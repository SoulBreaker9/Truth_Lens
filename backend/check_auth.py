import os
import google.auth
from google.oauth2 import service_account

# 1. Force the path explicitly to verify we are reading the file
key_path = os.path.abspath("service-account.json")
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = key_path

print(f"--- AUTH DEBUG ---")
print(f"Target Key File: {key_path}")
print(f"File Exists: {os.path.exists(key_path)}")

try:
    # 2. Load credentials exactly as the library would
    credentials, project_id = google.auth.default()
    print(f"Detected Project ID: {project_id}")
    
    # 3. Inspect who we are
    if hasattr(credentials, "service_account_email"):
        print(f"Active Identity: {credentials.service_account_email}")
    elif hasattr(credentials, "signer_email"):
         print(f"Active Identity (Signer): {credentials.signer_email}")
    else:
        print("Active Identity: Unknown/Opaque (Could be User Credentials?)")
        print(f"Cred Type: {type(credentials)}")

except Exception as e:
    print(f"AUTHENTICATION CRASH: {e}")
