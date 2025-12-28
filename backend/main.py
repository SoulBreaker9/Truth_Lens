import os
import shutil
import json
import time
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv

# --- CONFIGURATION (AI STUDIO) ---
PORT = 8000

# 1. Load the secrets from the .env file
load_dotenv()

# User provided API Key
API_KEY = os.getenv("GOOGLE_API_KEY")

if not API_KEY:
    raise ValueError("❌ CRITICAL ERROR: GOOGLE_API_KEY is missing. Check your .env file!")

print(f"--- TruthLens Backend Starting (SOTA Mode) ---")
print(f"Configuring Gemini API...")

genai.configure(api_key=API_KEY)

# --- MODEL SETUP ---
# Switching to PRO model for maximum reasoning capability
model_name = "gemini-2.5-pro"
print(f"Loading SOTA Model: {model_name}...")

# Grounding via Google Search
tools_config = [
    {"google_search": {}}
]

try:
    print("Attempting to initialize with Google Search Grounding...")
    model = genai.GenerativeModel(model_name, tools=tools_config)
    print(f"SUCCESS: Model '{model_name}' initialized with Grounding.")
except Exception as e:
    print(f"WARNING: Grounding initialization failed: {e}")
    print("Retrying WITHOUT Google Search (Basic Mode)...")
    try:
        model = genai.GenerativeModel(model_name) # No tools
        print(f"SUCCESS: Model '{model_name}' initialized (Basic Mode).")
    except Exception as e2:
         print(f"CRITICAL ERROR initializing model (Basic Mode): {e2}")
         model = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "TruthLens Backend is Running (SOTA Mode)", "model": model_name}

import cv2

# --- HELPER: HD FRAME EXTRACTION ---
def extract_hd_frames(video_path, output_folder, count=5):
    """Extracts 5 HD frames at 10%, 30%, 50%, 70%, 90% intervals."""
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error opening video file for frame extraction.")
        return []

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total_frames / fps if fps > 0 else 0
    
    # Calculate timestamps for 10%, 30%, ... 90%
    intervals = [0.1, 0.3, 0.5, 0.7, 0.9]
    extracted_paths = []

    print(f"Extracting {count} HD Frames from {duration:.2f}s video...")

    for i, ratio in enumerate(intervals):
        target_frame = int(total_frames * ratio)
        cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
        ret, frame = cap.read()
        
        if ret:
            # Save as high quality JPEG
            frame_name = f"frame_{i}_{int(target_frame)}.jpg"
            frame_path = os.path.join(output_folder, frame_name)
            cv2.imwrite(frame_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 100])
            extracted_paths.append(frame_path)
    
    cap.release()
    print(f"Extracted {len(extracted_paths)} frames.")
    return extracted_paths

@app.post("/analyze")
async def analyze_video(file: UploadFile = File(...)):
    temp_filename = f"temp_{file.filename}"
    frame_folder = f"frames_{int(time.time())}"
    extracted_frames = []
    
    try:
        print(f"Receiving video: {file.filename}")
        
        # Save upload to disk
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # --- HYBRID FORENSICS: EXTRACT FRAMES ---
        extracted_frames = extract_hd_frames(temp_filename, frame_folder, count=5)
            
        print(f"Uploading Video to Gemini...")
        video_file = genai.upload_file(path=temp_filename, display_name=file.filename)
        
        # Upload Frames to Gemini
        uploaded_images = []
        print(f"Uploading {len(extracted_frames)} Frames to Gemini...")
        for frame_path in extracted_frames:
             img_file = genai.upload_file(path=frame_path, display_name=os.path.basename(frame_path))
             uploaded_images.append(img_file)

        # Wait for VIDEO processing (Images are instant usually)
        print(f"Waiting for video processing...")
        while video_file.state.name == "PROCESSING":
            time.sleep(2)
            video_file = genai.get_file(video_file.name)
            
        if video_file.state.name == "FAILED":
            raise ValueError("Video processing failed on Google server.")
            
        print(f"Video ready: {video_file.uri}")

        prompt = """
🚨 SYSTEM ALERT: FORENSIC ANALYSIS MODE ACTIVATED (Protocol: ZERO-TRUST) 🚨
ROLE: You are 'TruthLens Omega', a Tier-1 Digital Media Forensic Examiner for the Department of Defense.
OBJECTIVE: Conduct a ruthless, frame-by-frame analysis of the provided VIDEO and 5 HD KEYFRAMES to detect Generative AI manipulation (Sora, Kling, Luma, Runway).

THEORY OF OPERATION:
Generative AI models function on "Dream Logic." They hallucinate textures but consistently fail at:
1. **Conservation of Momentum:** Objects don't hit; they "spawn."
2. **Object Permanence:** Background objects "glide" or vanish.
3. **Biological Pulse (rPPG):** Real skin flushes with blood flow; AI skin is "dead/waxy."
4. **Specular Geometry:** Eye reflections often show different rooms in left vs. right eyes.

### PHASE 1: CAUSALITY & PHYSICS FORENSICS (The "Mud Test") - [USE VIDEO]
*Focus strictly on interaction mechanics.*
1. 💥 IMPACT PHYSICS (Critical for Particle Effects):
   - If debris (mud, rain, water) hits the subject, track its trajectory. Does it travel through space? Or does it **instantly manifest** on the surface?
   - **Momentum Check:** Does the head recoil *exactly* when hit? AI often lags the reaction or morphs the face *before* impact.
2. 🌊 FLUID DYNAMICS & GRAVITY:
   - Watch rain/water. Does it flow downwards with constant acceleration (9.8m/s²)? Or does it float/move in random slow motion?
   - **Wetness Logic:** If the subject is in rain, is the clothing uniformly wet? AI often renders "dry patches" in pouring rain.

### PHASE 2: MICRO-BIOLOGICAL SIGNAL ANALYSIS - [USE 5 HD KEYFRAMES]
*Ignore video compression. Zoom into the 5 static images.*
1. 🩸 SUB-SURFACE SCATTERING (The "Wax" Test):
   - Real skin glows slightly red at edges due to blood flow. AI skin looks opaque (like plastic/clay).
   - **Texture Frequency:** Does the skin have pores? Or is it heavily smoothed (Gaussian Blur artifact)?
2. 👁️ OCULAR SPECULARITY (The "Mirror" Test):
   - Zoom into the pupils. **Constraint:** The reflection (highlight) in the Left Eye MUST match the Right Eye.
   - If the Left Eye shows a window and the Right Eye shows a lamp -> **CONFIRMED FAKE**.
3. 🦷 DENTAL MORPHOLOGY:
   - Count the teeth. Are there too many incisors? Do they "melt" into a single white bar?

### PHASE 3: TEMPORAL CONSISTENCY (The "Glitch" Test) - [USE VIDEO]
1. 👻 OBJECT PERMANENCE:
   - Watch the background (cars, animals). Do they "glide" without moving legs? Do they vanish behind thin poles?
2. 🔇 LIP-SYNC PHYSICS (Phoneme-Viseme Mismatch):
   - Watch the lips on "B", "P", and "M" sounds.
   - **Physics Rule:** The lips MUST touch. If they hover open while making a "P" sound -> **CONFIRMED FAKE**.

### EXECUTION INSTRUCTIONS:
- You are a prosecutor, not a defender. If you find ONE physics violation (e.g., mud spawning), the verdict is FAKE.
- Use the timestamps from the video to prove your case.

OUTPUT FORMAT (JSON ONLY):
{
    "confidence_score": integer (0-100), // 99+ = DEFINITELY FAKE
    "verdict_title": "Aggressive Technical Verdict (e.g. 'PHYSICS CAUSALITY VIOLATION')",
    "visual_evidence": [
        "Video 00:03: Debris lacks trajectory; substance manifests on face without impact momentum.",
        "Frame 2: Specular highlight asymmetry in eyes (Left: Window, Right: Softbox).",
        "Background: Entity at 00:05 glides without leg articulation."
    ],
    "audio_evidence": [
        "00:12: Phoneme 'P' produced without bilabial closure."
    ],
    "fact_check_analysis": "Search results confirm no record of this event."
}
"""

        print(f"Sending to {model_name} (1 Video + {len(uploaded_images)} Images)...")
        
        # Combine inputs: Prompt + Video + Images
        input_content = [prompt, video_file] + uploaded_images

        response = model.generate_content(
            input_content,
            generation_config={"response_mime_type": "application/json"}
        )
        
        print("Analysis Complete!")
        
        # Parse text response to JSON dict
        try:
            return json.loads(response.text)
        except json.JSONDecodeError:
            print("Model failed to return valid JSON. Returning raw text for debugging.")
            return {
                "confidence_score": 0,
                "verdict_title": "FORMAT ERROR",
                "visual_evidence": ["Model returned invalid JSON format."],
                "audio_evidence": [],
                "fact_check_analysis": response.text
            }

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "confidence_score": 0, 
            "verdict_title": "SYSTEM ERROR", 
            "visual_evidence": [str(e)],
            "audio_evidence": [],
            "fact_check_analysis": "System failed to process video."
        }
    
    finally:
        # Cleanup
        if os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except:
                pass
        if os.path.exists(frame_folder):
            try:
                shutil.rmtree(frame_folder)
            except:
                pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)