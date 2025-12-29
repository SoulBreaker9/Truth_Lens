
import requests
import os

BASE_URL = "http://127.0.0.1:8000"

def test_connectivity():
    try:
        print("Testing Root Endpoint...")
        resp = requests.get(f"{BASE_URL}/")
        print(f"Response: {resp.status_code} - {resp.json()}")
        if resp.status_code == 200:
            print("[OK] Root Endpoint OK")
            return True
        else:
            print("[FAIL] Root Endpoint Failed")
            return False
    except Exception as e:
        print(f"[FAIL] Connection Failed: {e}")
        return False

def test_local_engine():
    print("\nTesting Local Engine (Mock Upload)...")
    # multiple chunk upload mock
    with open("requirements.txt", "rb") as f: # Use dummy file
        files = {"file": ("test_video.mp4", f, "video/mp4")}
        data = {"mode": "local"}
        try:
            resp = requests.post(f"{BASE_URL}/analyze", files=files, data=data)
            print(f"Response: {resp.status_code}")
            if resp.status_code == 200:
                print(f"JSON: {resp.json()}")
                print("[OK] Local Engine API OK")
            else:
                print(f"[FAIL] Local Engine Failed: {resp.text}")
        except Exception as e:
            print(f"[FAIL] Local Engine Error: {e}")

if __name__ == "__main__":
    if test_connectivity():
        test_local_engine()
