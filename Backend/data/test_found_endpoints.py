"""
Script để thử các API endpoints đã tìm được
"""

import json
import requests
import sys
import io

# Fix encoding cho Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMjk3ZDdkNDNjZmVmZjUyMWUxNzRkZDY1ZjA1Mzk2MWEwYzM3NzlhZDU1YzdkMjViNWVlMWU5MDM2NTFmODY0N2JhYzM5N2MyMzEzYzhlM2UiLCJpYXQiOjE3NjQwMzQ0NTguNTY5NjA0LCJuYmYiOjE3NjQwMzQ0NTguNTY5NjA5LCJleHAiOjE3OTU1NzA0NTguNTU5Mzg1LCJzdWIiOiIyMzQyMSIsInNjb3BlcyI6W119.MfR_QfMjLetZb_f-kVtLubc3FTlY2FFqWUiYUj7-fdoBv30jycbPdCxldVx286wswv_Wfu5NYcftsSXXiDIXumyYU7-PCRx18LoUoN5Q9zaxd48jgZauhaOxgxdNY2xtd3FmgtS1Y_cEpUmSKkycTI3LK5cZbCbKYgrEBhHJIFRxjUvy3h_aqbXL0uZxFuGPoK4LNc-N8M-gp4TxC7s5JwjHg80T8qQxUW8tGhdIYAW_sHLFmNWjt5kGnsJkf9-1kuXOW7slkNr7kP2uGwPuarHAtV-wMAp4ePzWyNDpufS6B9vic1srrNjw8-AymNK5uI26m_PRMsN_c5NsLXchCzkHI3iXeI3Cd2VLM3rckMF_maFrkxCVc1sKnoqaIBT0hmUefX_ljHJkRbx2DrQH84zrAJasHDouFn6UIO6TIpbff1DHkxzucdillAfdpnAazWK0tTU5VeFzEjkbwxfcWI01Jq9TAstPV5YggFHkjVz-EcHXMeMxGqjrRFVzAgu0X4j3uSwbKMk0a4I3pzyAzuyBc4wMVZAjkdqw8NbpT4RSfd8Ilbp7d3bb7qCHmeVc79FwUP4td_lFNEdSlDK669q9m8hy8i8KkM6oNOgEmnVIdIcu_YGpl3w21Li1sjJR8tSrXwsSl08kjdAvgZAr8lukeCPgTXzzEBUXWb5eFuk"

COOKIES = {"token": TOKEN}
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json, */*',
    'Referer': 'https://hihsk.com/exam/hsk1/test/343?isListen=true&isRead=true',
    'Origin': 'https://hihsk.com',
}

# Endpoints tìm được từ file JS
endpoints = [
    "https://api.hihsk.com/api/study/save",
    "https://hihsk.com/api/grammar",
]

# Thêm các pattern có thể có cho exam
TEST_ID = 343
API_BASE = "https://api.hihsk.com/api"
BASE_URL = "https://hihsk.com"

exam_endpoints = [
    f"{API_BASE}/exam/{TEST_ID}",
    f"{API_BASE}/test/{TEST_ID}",
    f"{API_BASE}/exams/{TEST_ID}",
    f"{API_BASE}/exam/hsk1/{TEST_ID}",
    f"{API_BASE}/exam/hsk1/test/{TEST_ID}",
    f"{BASE_URL}/api/exam/{TEST_ID}",
    f"{BASE_URL}/api/test/{TEST_ID}",
    f"{BASE_URL}/api/exam/hsk1/{TEST_ID}",
    f"{BASE_URL}/api/exam/hsk1/test/{TEST_ID}",
]

print("=" * 60)
print("Thử các API endpoints đã tìm được")
print("=" * 60)

print("\n1. Endpoints tìm được từ file JS:")
for endpoint in endpoints:
    try:
        response = requests.get(endpoint, headers=HEADERS, cookies=COOKIES, timeout=10)
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"✓ {endpoint}")
                print(f"  Response: {list(data.keys())[:5] if isinstance(data, dict) else 'List/Other'}")
            except:
                print(f"✓ {endpoint} (HTML/Text)")
        else:
            print(f"✗ {endpoint} - Status: {response.status_code}")
    except Exception as e:
        print(f"✗ {endpoint} - Error: {str(e)[:50]}")

print("\n2. Thử các pattern có thể có cho exam:")
for endpoint in exam_endpoints:
    try:
        response = requests.get(endpoint, headers=HEADERS, cookies=COOKIES, timeout=10)
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"✓ {endpoint}")
                print(f"  Response keys: {list(data.keys())[:10] if isinstance(data, dict) else 'List/Other'}")
                # Lưu dữ liệu
                filename = f"exam_data_{endpoint.split('/')[-1]}.json"
                with open(filename, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"  ✓ Đã lưu vào: {filename}")
            except:
                print(f"✓ {endpoint} (HTML/Text)")
        elif response.status_code == 404:
            print(f"✗ {endpoint} - 404")
        else:
            print(f"✗ {endpoint} - Status: {response.status_code}")
    except Exception as e:
        print(f"✗ {endpoint} - Error: {str(e)[:50]}")

print("\n" + "=" * 60)
print("Hoàn thành!")
print("=" * 60)

