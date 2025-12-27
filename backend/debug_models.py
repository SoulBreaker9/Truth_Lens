import os
import vertexai
from vertexai.generative_models import GenerativeModel

# Configuration
CREDENTIALS_FILE = "service-account.json"
PROJECT_ID = "sublime-vial-449113-e4"

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = CREDENTIALS_FILE

print(f"--- DIAGNOSING GEMINI MODELS ---")
print(f"Project: {PROJECT_ID}")

# List of models to test in order of preference
candidates = [
    "gemini-1.5-flash-001",
    "gemini-1.5-flash",
    "gemini-1.5-pro-001",
    "gemini-1.5-pro",
    "gemini-1.0-pro-001",
    "gemini-1.0-pro",
    "gemini-pro"
]

regions = ["us-central1", "us-east4", "us-west1", "us-east1"]

working_config = None

for region in regions:
    print(f"\n--- Checking Region: {region} ---")
    try:
        vertexai.init(project=PROJECT_ID, location=region)
    except Exception as e:
        print(f"Failed to init region {region}: {e}")
        continue
    
    for model_name in candidates:
        print(f"Testing: {model_name} in {region} ...", end=" ")
        try:
            model = GenerativeModel(model_name)
            response = model.generate_content("Test")
            print(f"WORKS!")
            working_config = (region, model_name)
            break 
        except Exception as e:
            # Shorten error
            print(f"FAILED")

    if working_config:
        break

if working_config:
    print(f"\nSUGGESTED FIX: Region='{working_config[0]}', Model='{working_config[1]}'")
else:
    print(f"\nCRITICAL: No models worked in ANY tested region.")
