import time
import requests
import json

payload = {
    "id": "f1",
    "name": "Test Field",
    "location": "Tumkur, Karnataka",
    "soil_type": "red soil",
    "irrigation_type": "rainfed",
    "current_crop": "groundnut",
    "season": "Kharif"
}

start = time.time()
try:
    print("Sending Request to RAG backend...")
    r = requests.post("http://127.0.0.1:8000/api/gateway/krishichakra/api/v1/crop-plan", json=payload)
    end = time.time()
    
    if r.status_code == 200:
        print(f"Success! Time taken: {end - start:.2f} seconds")
        res = r.json()
        print("Model used:", res.get("trace", {}).get("model_used"))
        print("Generated Plan:")
        for yy in res.get("plan", {}).get("rotation_plan", []):
            print(f" - {yy['season']}: {yy['recommended_crop']}")
    else:
        print(f"Failed with {r.status_code}: {r.text}")
        print(f"Time taken before failure: {end - start:.2f} seconds")
except Exception as e:
    print(f"Error: {e}")
