
import os
import sys
import time

# Add current directory to path
sys.path.append(os.getcwd())

from local_engine import LocalDeepfakeDetector

def test_inference():
    print("--- QA TEST 2: INFERENCE PIPELINE ---")
    
    video_paths = [
        r"C:\Users\Parshva Shah\Downloads\Ai Video Kaise Banaye  Al Video Generator Free  Ai Video Generator  Image to Video Generator Free - DM Editor (1080p, h264, youtube).mp4",
        r"C:\Users\Parshva Shah\Downloads\AI generated video #vlogs #funny #veo3 #comedy #AI - Fact Prime Time (720p, h264, youtube).mp4",
        r"C:\Users\Parshva Shah\Downloads\How to make AI video for free  Free Ai video generator # #videoediting #shorts #ai #viral #explore - Ai.babyvideos (720p, h264, youtube).mp4"
    ]

    # Initialize Detector
    try:
        print("[QA] Initializing Detector...")
        detector = LocalDeepfakeDetector()
        if not detector.model:
            print("[CRITICAL] Model not loaded. Aborting.")
            return
    except Exception as e:
        print(f"[CRITICAL] Init Failed: {e}")
        return

    # Run Inference
    for i, path in enumerate(video_paths):
        print(f"\n[{i+1}/3] Testing Video: {os.path.basename(path)}")
        if not os.path.exists(path):
            print(f"    [WARN] File not found: {path}")
            continue
            
        try:
            start_time = time.time()
            result = detector.detect(path)
            duration = time.time() - start_time
            
            print(f"    Verdict:    {result.get('verdict')}")
            print(f"    Confidence: {result.get('confidence')}%")
            print(f"    Time Taken: {duration:.2f}s")
            
            if result.get('confidence') > 0:
                 print("    [SUCCESS] Pipeline executed and returned score.")
            else:
                 print("    [WARN] Score is 0 (Might be no faces or raw model output).")
                 
            # Print evidence for debugging
            # print(f"    Evidence: {result.get('evidence')}")
            
        except Exception as e:
            print(f"    [FAIL] Inference Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_inference()
