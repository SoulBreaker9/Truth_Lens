import os
import shutil
import json
import time
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

# --- CONFIGURATION (AI STUDIO) ---
PORT = 8000
# User provided API Key
API_KEY = "AIzaSyDPWUxBhRmbgOa6NqGEGTEHOVTvuG2fUxw"

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

@app.post("/analyze")
async def analyze_video(file: UploadFile = File(...)):
    temp_filename = f"temp_{file.filename}"
    
    try:
        print(f"Receiving video: {file.filename}")
        
        # Save upload to disk
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        print(f"Uploading to Gemini File API...")
        video_file = genai.upload_file(path=temp_filename, display_name=file.filename)
        
        # Wait for processing
        print(f"Waiting for video processing...")
        while video_file.state.name == "PROCESSING":
            time.sleep(2)
            video_file = genai.get_file(video_file.name)
            
        if video_file.state.name == "FAILED":
            raise ValueError("Video processing failed on Google server.")
            
        print(f"Video ready: {video_file.uri}")

        prompt = """
        ROLE: You are 'TruthLens Alpha', a military-grade AI Forensic Analyst specialized in Media Authenticity. 
        Your task is to dissect this video for Generative AI manipulation (GANs, Diffusion, Voice Cloning).
        
        STRICT PROTOCOL: Assume the video is FAKE until biological and physical consistency is proven beyond 99% probability.
        
        ### PHASE 1: MICRO-BIOLOGICAL ANALYSIS (The "Alive" Test)
        1. Ocular Micro-Tremors: Do the eyes have natural saccadic movement, or is the gaze "dead/fixed"?
        2. Corneal Reflections: Zoom into the eyes. Do the reflection shapes match the environment? Are they symmetrical in both eyes? (GANs often fail here).
        3. Subsurface Scattering: Does the skin absorb/scatter light naturally? Look for "waxy" or overly smooth skin textures typical of diffusion models.
        4. Blink Dynamics: Are blink patterns regular and complete? (AI often generates partial or slow blinks).

        ### PHASE 2: PHYSICS & GEOMETRY (The "World" Test)
        1. Light Consistency: Check shadows on the nose and neck. Do they strictly follow the light source direction of the background?
        2. Boundary Warping: Analyze the jawline, hairline, and collar area frame-by-frame. Look for blurring, shifting, or "doubling" artifacts during fast movement.
        3. Head Pose vs. Face Landmark: Does the face rotation perfectly match the head shape? (Face swaps often "slide" 2D faces over 3D heads).

        ### PHASE 3: AUDIO-VISUAL SYNCHRONIZATION (The "Lip" Test)
        1. Phoneme-Viseme Alignment: Focus on "Plosive" sounds (B, P, M). Do the lips fully close?
        2. Breath Detection: Does the chest movement align with audio inhalation/exhalation?
        3. Spectral Consistency: Does the voice have "metallic" robotic artifacts or sudden cut-offs in background noise?

        ### PHASE 4: SEMANTIC & CONTEXTUAL GROUNDING (The "Reality" Test)
        1. Use Google Search to cross-reference the event. 
        2. If a public figure is speaking, verify: Did they actually say this? Is this a known clip repurposed with AI audio (Lip-Sync Deepfake)?
        
        ### EXECUTION INSTRUCTIONS:
        - Analyze the video chronologically.
        - If you find an artifact, note the approximate TIMESTAMP.
        - Be aggressive. If the lip-sync is off by even 100ms, flag it.

        OUTPUT FORMAT (Strict JSON):
        {
            "confidence_score": integer (0-100), // 0 = DEFINITELY REAL, 100 = DEFINITELY FAKE AI
            "verdict_title": "Short, technical verdict (e.g., 'TEMPORAL WARPING DETECTED' or 'BIOMETRIC MISMATCH')",
            "visual_evidence": [
                "At 00:03 - Non-specular reflection in left eye does not match scene lighting.",
                "At 00:08 - Jawline boundary blur during rapid head turn.",
                "General - Skin texture lacks pores/subsurface scattering (waxy appearance)."
            ],
            "audio_evidence": [
                "At 00:05 - Lip closure fails on the 'P' sound in the word 'People'.",
                "Background noise floor cuts out artificially between sentences."
            ],
            "fact_check_analysis": "Search results indicate this video is a manipulated version of a speech from [Date]. The audio does not match official transcripts."
        }
        """

        print(f"Sending to {model_name}...")
        
        response = model.generate_content(
            [video_file, prompt],
            generation_config={"response_mime_type": "application/json"}
        )
        
        print("Analysis Complete!")
        # Clean up file from cloud storage (Good citizenship)
        # genai.delete_file(video_file.name) 
        
        return response.text

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return json.dumps({
            "is_fake": False, 
            "verdict_title": "SYSTEM ERROR", 
            "visual_evidence": [str(e)],
            "audio_evidence": [],
            "fact_check_analysis": "System failed to process video."
        })
    
    finally:
        if os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except:
                pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)