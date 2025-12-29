import torch
import torch.nn as nn
from torchvision import transforms
from facenet_pytorch import MTCNN
import cv2
import numpy as np
from PIL import Image
import os

# Import the correct model architecture
from model_loader import load_model

class LocalDeepfakeDetector:
    def __init__(self, model_path="models/best_model.pth", device=None):
        self.device = device if device else ("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[Local Engine] Device: {self.device}")
        
        # --- 1. Load Model Architecture ---
        try:
             # Use the dedicated loader which handles the custom class
            self.model = load_model(model_path, self.device)
            
        except Exception as e:
            print(f"[ERROR] Loading local model: {e}")
            self.model = None

        # --- 2. Initialize Face Detector ---
        try:
            self.mtcnn = MTCNN(keep_all=True, device=self.device)
        except:
             # Fallback to CPU for MTCNN if CUDA OOM or issues
            self.mtcnn = MTCNN(keep_all=True, device='cpu')

        # --- 3. Preprocessing ---
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def detect(self, video_path, num_frames=10):
        if not self.model:
            return {"error": "Model not loaded"}

        frames = self._extract_frames(video_path, num_frames)
        if not frames:
             return {"verdict": "ERROR", "confidence": 0, "details": "Could not extract frames."}

        face_preds = []
        
        print(f"[Local Engine] Analyzing {len(frames)} frames...")
        
        for frame in frames:
            pil_img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            
            # Detect faces
            boxes, _ = self.mtcnn.detect(pil_img)
            
            if boxes is not None:
                for box in boxes:
                    # Crop face
                    face = pil_img.crop(box)
                    
                    # Preprocess
                    # Model expects [Batch, Seq, Channels, H, W]
                    # We are processing 1 frame at a time which means Seq=1
                    face_tensor = self.transform(face).unsqueeze(0).unsqueeze(0).to(self.device)
                    
                    # Inference
                    with torch.no_grad():
                        outputs = self.model(face_tensor)
                        probs = torch.softmax(outputs, dim=1)
                        fake_prob = probs[0][1].item() # Assuming index 1 is FAKE
                        face_preds.append(fake_prob)

        if not face_preds:
            return {
                "verdict": "UNCERTAIN",
                "confidence": 0,
                "evidence": ["No biological faces detected in video."],
                "mode": "local"
            }

        # Aggregate
        avg_fake_prob = np.mean(face_preds)
        confidence_score = int(avg_fake_prob * 100)
        is_fake = confidence_score > 50
        
        return {
            "verdict": "DEEPFAKE DETECTED" if is_fake else "LIKELY AUTHENTIC",
            "confidence": confidence_score,
            "evidence": [
                f"Analyzed {len(face_preds)} face regions locally.",
                f"Aggregated Neural Score: {confidence_score}%"
            ],
             "mode": "local"
        }

    def _extract_frames(self, video_path, count):
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return []
        
        frames = []
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0: return []
        
        step = max(1, total_frames // count)
        
        for i in range(0, total_frames, step):
            cap.set(cv2.CAP_PROP_POS_FRAMES, i)
            ret, frame = cap.read()
            if ret:
                frames.append(frame)
                if len(frames) >= count:
                    break
        cap.release()
        return frames
