
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

def test_load_final():
    print("--- QA TEST 1: SMOKE TEST (FINAL) ---")
    model_path = "models/best_model.pth"
    
    try:
        from local_engine import LocalDeepfakeDetector
        print("[QA] Imported LocalDeepfakeDetector.")
        
        detector = LocalDeepfakeDetector(model_path=model_path)
        
        if detector.model:
            print("SUCCESS: DeepFakeModel (EfficientNet+LSTM) loaded successfully.")
        else:
            print("FAILED: Model is None.")
            
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")

if __name__ == "__main__":
    test_load_final()
