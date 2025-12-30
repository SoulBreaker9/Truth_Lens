import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

print("SEARCHING MODELS...")
available_models = []
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"FOUND: {m.name}")
            available_models.append(m.name)
except Exception as e:
    print(f"ERROR: {e}")

# Logic to find the best PRO model
# Filter for 'pro' and exclude 'vision' legacy models if they show up differently, though 1.5 handles it.
pro_models = [m for m in available_models if "pro" in m.lower() and "vision" not in m.lower()]
# Sort to find the latest version (e.g. 002 > 001)
pro_models.sort(reverse=True)

if pro_models:
    print(f"RECOMMENDED_MODEL: {pro_models[0]}")
else:
    print("RECOMMENDED_MODEL: gemini-1.5-flash") # Fallback