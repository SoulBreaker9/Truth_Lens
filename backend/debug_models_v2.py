import os
from google.cloud import aiplatform

# Configuration
CREDENTIALS_FILE = "service-account.json"
PROJECT_ID = "sublime-vial-449113-e4"

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = CREDENTIALS_FILE

print(f"--- DIAGNOSING GEMINI MODELS (Method 2: Low-Level API) ---")
print(f"Project: {PROJECT_ID}")

regions = ["us-central1", "us-east4", "us-west1", "us-east1"]

for region in regions:
    print(f"\n--- Checking Region: {region} ---")
    try:
        aiplatform.init(project=PROJECT_ID, location=region)
        # Try to list models directly
        models = aiplatform.Model.list()
        print(f"Found {len(models)} custom models (Expected 0 for Generative AI, but proves connection works)")
        print("[OK] Connection Successful - API is enabled!")
        break
    except Exception as e:
        print(f"[FAIL] to connect: {e}")
