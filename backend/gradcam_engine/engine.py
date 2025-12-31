import cv2
import torch
import numpy as np
from torchvision import transforms
from PIL import Image
import os
import time

from .models import DeepfakeResNet18
from .grad_cam import GradCAM, overlay_cam_on_image

class GradCAMDeepfakeDetector:
    def __init__(self, model_path="models/best_resnet18.pth", device=None):
        self.device = device if device else ("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[Grad-CAM Engine] Device: {self.device}")
        
        self.image_size = 224
        self.transform = transforms.Compose([
            transforms.Resize((self.image_size, self.image_size)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ])
        
        # Load Model
        # Default to ImageNet weights (Pretrained=True) for "Demo Mode" feature extraction
        self.model = DeepfakeResNet18(pretrained=True).to(self.device)
        self.is_demo = False

        if os.path.exists(model_path):
            print(f"[Grad-CAM Engine] Loading weights from {model_path}")
            try:
                ckpt = torch.load(model_path, map_location=self.device)
                if isinstance(ckpt, dict) and "model_state" in ckpt:
                    self.model.load_state_dict(ckpt["model_state"])
                else:
                    self.model.load_state_dict(ckpt)
                print("[Grad-CAM Engine] Weights loaded successfully.")
            except Exception as e:
                print(f"[Grad-CAM Engine] Error loading weights: {e}")
                print("[Grad-CAM Engine] FALLBACK: Using Standard ImageNet Weights (DEMO MODE)")
                self.is_demo = True
        else:
             print(f"[Grad-CAM Engine] Weight file {model_path} not found.")
             print("[Grad-CAM Engine] FALLBACK: Using Standard ImageNet Weights (DEMO MODE)")
             self.is_demo = True
        
        self.model.eval()
        
        # Hook into last layer
        self.target_layer = self.model.backbone.layer4[-1]
        self.grad_cam = GradCAM(self.model, self.target_layer)

    def process_video(self, input_path, output_path, frame_step=5):
        """
        Reads video, applies Grad-CAM, saves heatmap video to output_path.
        Returns (avg_fake_prob, output_path)
        """
        cap = cv2.VideoCapture(input_path)
        if not cap.isOpened():
            raise ValueError("Could not open video file.")

        width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps    = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Use avc1 (H.264) codec for browser compatibility
        # If this fails on your specific Windows setup without ffmpeg, try 'mp4v' or 'vp90' (webm)
        try:
             fourcc = cv2.VideoWriter_fourcc(*'avc1')
        except:
             fourcc = cv2.VideoWriter_fourcc(*'mp4v')
             
        out = cv2.VideoWriter(output_path, fourcc, fps / frame_step, (width, height))
        
        frame_idx = 0
        fake_probs = []
        
        print(f"[Grad-CAM] Processing {total_frames} frames from {input_path}...")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_idx += 1
            if frame_idx % frame_step != 0:
                continue
                
            # Preprocess
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(rgb)
            tensor = self.transform(pil_img).unsqueeze(0).to(self.device)
            
            # Predict
            # GradCAM requires gradients, so we might need to enable grad even in inference for the backward pass
            # usually model.eval() is fine, but we need to ensure gradients flow back to valid hooks.
            # In pytorch, backward() works if req_grad is True on params.
            
            # To be safe for GradCAM, we might need a separate forward pass
            # Or ensure params have requires_grad=True? 
            # Usually during inference we do torch.no_grad(), but GradCAM NEEDS grad.
            # So we do NOT use torch.no_grad() here.
            
            outputs = self.model(tensor)
            probs = torch.softmax(outputs, dim=1)
            prob_fake = probs[0, 1].item() # Class 1 = Fake
            pred_idx = outputs.argmax(dim=1).item()
            
            fake_probs.append(prob_fake)
            
            # Generate Heatmap
            cam = self.grad_cam.generate(tensor, class_idx=pred_idx)
            
            # Overlay
            if cam is not None:
                overlay = overlay_cam_on_image(frame, cam, alpha=0.5)
            else:
                overlay = frame
            
            # Add text
            label = "FAKE" if pred_idx == 1 else "REAL"
            color = (0, 0, 255) if pred_idx == 1 else (0, 255, 0)
            cv2.putText(overlay, f"{label} ({prob_fake:.2f})", (30, 50), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
            
            out.write(overlay)
            
        cap.release()
        out.release()
        
        if not fake_probs:
            return 0.0, output_path, self.is_demo
            
        avg_prob = float(np.mean(fake_probs)) * 100
        print(f"[Grad-CAM] Completed. Avg Score: {avg_prob:.1f}% (Demo: {self.is_demo})")
        
        return avg_prob, output_path, self.is_demo
