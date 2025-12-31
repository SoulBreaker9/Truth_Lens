from transformers import pipeline
import cv2
from PIL import Image
import torch

# --- NVIDIA GPU SETUP ---
# device=0 targets the first GPU (RTX 4050)
# device=-1 means CPU
gpu_id = 0 if torch.cuda.is_available() else -1
print(f"Running Neural Core on Device ID: {gpu_id}")

try:
    # Load Deepfake Detector (Dima806)
    classifier = pipeline("image-classification", model="dima806/deepfake_vs_real_image_detection", device=gpu_id)
except Exception as e:
    print(f"Model download failed: {e}")
    classifier = None

def analyze_video_neural(video_path):
    cap = cv2.VideoCapture(video_path)
    frame_scores = []
    frame_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret or frame_count > 40: # Checked 40 frames
            break
            
        if frame_count % 5 == 0:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(rgb_frame)
            
            if classifier:
                results = classifier(pil_img)
                # Structure: [{'label': 'FAKE', 'score': 0.99}, {'label': 'REAL', 'score': 0.01}]
                # We need to find the "FAKE" score or "REAL" score and normalize.
                
                # Default to 0.5 if unclear
                risk_score = 50.0 
                
                for res in results:
                    if res['label'].upper() == "FAKE":
                        # If FAKE 0.9 -> Score 90.0
                        risk_score = res['score'] * 100
                        break
                    elif res['label'].upper() == "REAL":
                        # If REAL 0.9 -> Score 10.0 (1 - 0.9 = 0.1 * 100 = 10)
                        # But wait, results list usually sums to 1. 
                        # If we find REAL first, we can interpret it.
                        risk_score = (1.0 - res['score']) * 100
                        break
                
                frame_scores.append(risk_score)
            else:
                frame_scores.append(50.0)
                
        frame_count += 1
    
    cap.release()
    
    if not frame_scores:
        return {"label": "UNCERTAIN", "deepfake_score": 50.0}
    
    avg_deepfake_score = sum(frame_scores) / len(frame_scores)
    
    # Label logic based on the score
    label = "FAKE" if avg_deepfake_score > 50 else "REAL"
    
    return {
        "label": label, 
        "deepfake_score": round(avg_deepfake_score, 2)
    }