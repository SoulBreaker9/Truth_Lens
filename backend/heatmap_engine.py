import torch
from torchvision import models, transforms
import cv2
import numpy as np
from PIL import Image

# --- NVIDIA GPU SETUP ---
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Running Heatmap Engine on: {device}")

# 1. SETUP THE MODEL (Pre-trained ImageNet)
try:
    model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
    model = model.to(device)
    model.eval()
except Exception as e:
    print(f"Error loading ResNet: {e}")
    model = None

# Hooks for the heatmap
gradients = None
activations = None

def backward_hook(module, grad_input, grad_output):
    global gradients
    gradients = grad_output[0]

def forward_hook(module, input, output):
    global activations
    activations = output

# Hook into layer4
if model:
    target_layer = model.layer4[-1]
    target_layer.register_forward_hook(forward_hook)
    target_layer.register_full_backward_hook(backward_hook)

def process_video_heatmap(video_path):
    if not model:
        return None

    cap = cv2.VideoCapture(video_path)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    import os
    # Ensure 'generated' folder exists
    output_dir = "generated"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # OUTPUT FILE: We prefer WebM (VP9) or MP4 (H.264) for browsers
    # MP4V is often blocked by Chrome/Edge.
    
    # Attempt 1: H.264 (Best for MP4)
    output_path = os.path.join(output_dir, "heatmap_output.mp4")
    try:
        fourcc = cv2.VideoWriter_fourcc(*'avc1')
        print("Heatmap Engine: Trying codec 'avc1' (H.264)")
    except:
        fourcc = None

    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Fallback / Check if opened
    if not out.isOpened():
        print("Heatmap Engine: 'avc1' failed. Trying 'vp09' (WebM)...")
        output_path = os.path.join(output_dir, "heatmap_output.webm")
        fourcc = cv2.VideoWriter_fourcc(*'vp09') # VP9
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        if not out.isOpened():
            print("Heatmap Engine: 'vp09' failed. Fallback to 'mp4v' (Legacy)...")
            output_path = os.path.join(output_dir, "heatmap_output.mp4")
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    preprocess = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    frame_count = 0
    # Process max 150 frames to save time
    while cap.isOpened() and frame_count < 150:
        ret, frame = cap.read()
        if not ret: 
            break

        # 1. Prepare Frame
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb_frame)
        
        # Move input to GPU
        input_tensor = preprocess(pil_img).unsqueeze(0).to(device) 

        # 2. Forward Pass
        output = model(input_tensor)
        
        # 3. Generate Heatmap
        score = output[:, output.argmax(dim=1).item()]
        model.zero_grad()
        score.backward()

        # Get gradients and activations
        # Pool the gradients across the channels
        pooled_gradients = torch.mean(gradients, dim=[0, 2, 3])
        
        # Weight the activations by the gradients
        # We perform this on the GPU to be fast
        weighted_activations = activations.clone()
        for i in range(weighted_activations.size(1)):
            weighted_activations[:, i, :, :] *= pooled_gradients[i]
        
        # Average the channels to get the heatmap
        heatmap = torch.mean(weighted_activations, dim=1).squeeze().cpu().detach().numpy()
        
        # ReLU (remove negatives)
        heatmap = np.maximum(heatmap, 0)
        
        # --- THE FIX IS HERE ---
        # Normalize and ensure FLOAT32 for OpenCV compatibility
        heatmap = np.array(heatmap, dtype=np.float32)
        
        max_val = np.max(heatmap)
        if max_val > 0:
            heatmap /= max_val
        # -----------------------

        # 4. Overlay Heatmap
        # Now 'heatmap' is definitely a numpy array, so cv2.resize works.
        heatmap_resized = cv2.resize(heatmap, (width, height))
        
        # Convert to 0-255 color map
        heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)
        
        # Blend
        superimposed = cv2.addWeighted(frame, 0.6, heatmap_colored, 0.4, 0)
        out.write(superimposed)
        frame_count += 1

    cap.release()
    out.release()
    
    # Calculate Threat Score based on how "Hot" the overall heatmap was
    # If heatmap is full of reds (near 1.0), score is high.
    # Note: 'heatmap' variable tracks the last frame. Ideally we'd track average across frames.
    # But for now, we'll just check the intensity of the *last* frame which is often representative, 
    # OR we can improve this loop to track global intensity. 
    # Let's keep it simple: Use the last frame's heatmap intensity as the score proxy.
    
    # Intensity = Mean value of the normalized heatmap (0.0 to 1.0)
    # We map 0.0-0.5 (Cold) -> 0-50 score
    # We map 0.5-1.0 (Hot) -> 50-100 score
    intensity = float(np.mean(heatmap)) if 'heatmap' in locals() else 0.0
    deepfake_score = min(max(intensity * 100 * 1.5, 0), 100) # 1.5 multiplier to make it more sensitive
    
    return {
        "deepfake_score": round(deepfake_score, 2),
        "video_path": output_path
    }