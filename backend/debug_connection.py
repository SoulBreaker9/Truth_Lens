
import os
import google.generativeai as genai
from dotenv import load_dotenv

# 1. Load Environment Variables
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

print(f"DEBUG: Loaded API Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("❌ ERROR: No API Key found in .env")
    exit(1)

# 2. Configure Gemini
genai.configure(api_key=api_key)

# 3. List Models
print("\n--- Available Models ---")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
            
    print("\n--- Testing Content Generation (gemini-2.0-flash-exp) ---")
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    res = model.generate_content("Hello")
    print(f"✅ Success! Response: {res.text}")
    
except Exception as e:
    print(f"❌ API Error: {str(e)}")
