import requests
import json
import urllib3

# Suppress SSL warnings if testing self-signed or intermediate
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://18.221.6.95.sslip.io"

print(f"Testing public HTTPS endpoint: {BASE_URL}")

# 1. Health check
try:
    r = requests.get(f"{BASE_URL}/api/health", verify=True, timeout=10)
    print(f"1. Health Check: {r.status_code} -> {r.text}")
except Exception as e:
    print(f"1. Health Check with verify=True failed: {e}")
    r = requests.get(f"{BASE_URL}/api/health", verify=False, timeout=10)
    print(f"   Health Check with verify=False: {r.status_code} -> {r.text}")

# 2. Login
try:
    login_data = {"username": "admin", "password": "admin123"}
    r = requests.post(f"{BASE_URL}/api/auth/login", json=login_data, verify=False, timeout=10)
    print(f"2. Login status: {r.status_code}")
    res = r.json()
    token = res.get("access_token")
    print(f"   User logged in: {res.get('user')}")
    print(f"   Token: {token[:25]}...")
except Exception as e:
    print(f"2. Login failed: {e}")
    token = None

# 3. Prediction test
if token:
    try:
        sample_path = "client/public/samples/sample_cracks.jpg"
        print(f"3. Sending sample image '{sample_path}' for Ensemble prediction...")
        headers = {"Authorization": f"Bearer {token}"}
        with open(sample_path, "rb") as f:
            files = {"file": ("sample_cracks.jpg", f, "image/jpeg")}
            r = requests.post(f"{BASE_URL}/api/predictions/predict", headers=headers, files=files, verify=False, timeout=60)
            print(f"   Prediction Status: {r.status_code}")
            pred = r.json()
            print("   Prediction Result:")
            print(json.dumps(pred, indent=2))
    except Exception as e:
        print(f"3. Prediction failed: {e}")
