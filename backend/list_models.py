import google.generativeai as genai

API_KEY = "AIzaSyDPWUxBhRmbgOa6NqGEGTEHOVTvuG2fUxw"
genai.configure(api_key=API_KEY)

print("--- AVAILABLE MODELS ---")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"Name: {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")
