"""
Script cuối cùng để cào dữ liệu HSK exam
Sử dụng token và tìm API endpoint thực tế
"""

import json
import requests
import sys
import io
from typing import Dict, Optional

# Fix encoding cho Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# ============================================
# CẤU HÌNH
# ============================================
TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMjk3ZDdkNDNjZmVmZjUyMWUxNzRkZDY1ZjA1Mzk2MWEwYzM3NzlhZDU1YzdkMjViNWVlMWU5MDM2NTFmODY0N2JhYzM5N2MyMzEzYzhlM2UiLCJpYXQiOjE3NjQwMzQ0NTguNTY5NjA0LCJuYmYiOjE3NjQwMzQ0NTguNTY5NjA5LCJleHAiOjE3OTU1NzA0NTguNTU5Mzg1LCJzdWIiOiIyMzQyMSIsInNjb3BlcyI6W119.MfR_QfMjLetZb_f-kVtLubc3FTlY2FFqWUiYUj7-fdoBv30jycbPdCxldVx286wswv_Wfu5NYcftsSXXiDIXumyYU7-PCRx18LoUoN5Q9zaxd48jgZauhaOxgxdNY2xtd3FmgtS1Y_cEpUmSKkycTI3LK5cZbCbKYgrEBhHJIFRxjUvy3h_aqbXL0uZxFuGPoK4LNc-N8M-gp4TxC7s5JwjHg80T8qQxUW8tGhdIYAW_sHLFmNWjt5kGnsJkf9-1kuXOW7slkNr7kP2uGwPuarHAtV-wMAp4ePzWyNDpufS6B9vic1srrNjw8-AymNK5uI26m_PRMsN_c5NsLXchCzkHI3iXeI3Cd2VLM3rckMF_maFrkxCVc1sKnoqaIBT0hmUefX_ljHJkRbx2DrQH84zrAJasHDouFn6UIO6TIpbff1DHkxzucdillAfdpnAazWK0tTU5VeFzEjkbwxfcWI01Jq9TAstPV5YggFHkjVz-EcHXMeMxGqjrRFVzAgu0X4j3uSwbKMk0a4I3pzyAzuyBc4wMVZAjkdqw8NbpT4RSfd8Ilbp7d3bb7qCHmeVc79FwUP4td_lFNEdSlDK669q9m8hy8i8KkM6oNOgEmnVIdIcu_YGpl3w21Li1sjJR8tSrXwsSl08kjdAvgZAr8lukeCPgTXzzEBUXWb5eFuk"

COOKIES = {"token": TOKEN}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json, */*',
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': 'https://hihsk.com/exam/hsk1/test/343?isListen=true&isRead=true',
    'Origin': 'https://hihsk.com',
    'X-Requested-With': 'XMLHttpRequest',
}

API_BASE = "https://api.hihsk.com/api"
BASE_URL = "https://hihsk.com"
TEST_ID = 343

def try_api_endpoint(url: str, method: str = "GET", payload: Optional[Dict] = None) -> Optional[Dict]:
    """Thử một API endpoint"""
    try:
        print(f"\nĐang thử {method} {url}")
        
        if method.upper() == "GET":
            response = requests.get(url, headers=HEADERS, cookies=COOKIES, timeout=10)
        else:
            headers = {**HEADERS, 'Content-Type': 'application/json'}
            response = requests.post(url, headers=headers, cookies=COOKIES, json=payload, timeout=10)
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"✓ THÀNH CÔNG!")
                print(f"  Response keys: {list(data.keys())[:10] if isinstance(data, dict) else 'List/Other'}")
                return data
            except json.JSONDecodeError:
                print(f"✓ Thành công nhưng không phải JSON")
                print(f"  Preview: {response.text[:200]}")
                return {"html": response.text}
        elif response.status_code == 401:
            print(f"⚠ 401 - Token có thể đã hết hạn")
        elif response.status_code == 403:
            print(f"⚠ 403 - Bị chặn")
        elif response.status_code == 404:
            print(f"✗ 404")
        else:
            print(f"✗ Status: {response.status_code}")
    except Exception as e:
        print(f"✗ Lỗi: {str(e)[:50]}")
    
    return None

def main():
    print("=" * 60)
    print("Script tìm và fetch API endpoint HSK exam")
    print("=" * 60)
    print("\n⚠ LƯU Ý:")
    print("URL bạn gửi là Google Analytics tracking, không phải API endpoint.")
    print("Cần tìm API endpoint thực tế từ Network tab trong DevTools.")
    print("\n" + "=" * 60)
    
    # Danh sách các endpoint có thể có
    # Bạn có thể thêm endpoint mới vào đây sau khi tìm được từ Network tab
    endpoints_to_try = [
        # Format với test_id
        (f"{API_BASE}/exam/hsk1/test/{TEST_ID}", "GET", None),
        (f"{API_BASE}/exam/hsk1/{TEST_ID}", "GET", None),
        (f"{API_BASE}/exam/hsk/1/{TEST_ID}", "GET", None),
        
        # Format với questions
        (f"{API_BASE}/exam/hsk1/test/{TEST_ID}/questions", "GET", None),
        (f"{API_BASE}/exam/hsk1/{TEST_ID}/questions", "GET", None),
        
        # POST với body
        (f"{API_BASE}/exam/hsk1/test/{TEST_ID}/start", "POST", {"isListen": True, "isRead": True}),
        (f"{API_BASE}/exam/hsk1/{TEST_ID}/start", "POST", {"isListen": True, "isRead": True}),
        
        # Với query parameters
        (f"{API_BASE}/exam/hsk1/test/{TEST_ID}?isListen=true&isRead=true", "GET", None),
        (f"{API_BASE}/exam/hsk1/{TEST_ID}?isListen=true&isRead=true", "GET", None),
    ]
    
    print(f"\nĐang thử {len(endpoints_to_try)} endpoint(s)...")
    
    success_data = None
    for url, method, payload in endpoints_to_try:
        data = try_api_endpoint(url, method, payload)
        if data:
            success_data = data
            # Lưu dữ liệu
            filename = f"hsk_exam_{TEST_ID}_api_data.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  ✓ Đã lưu vào: {filename}")
            break
    
    print("\n" + "=" * 60)
    if success_data:
        print("✓ Tìm thấy dữ liệu!")
    else:
        print("⚠ Không tìm thấy endpoint nào hoạt động")
        print("\nHƯỚNG DẪN TÌM API ENDPOINT:")
        print("1. Mở trang exam trong trình duyệt (đã đăng nhập)")
        print("2. Mở DevTools (F12) > Network tab")
        print("3. Xóa request cũ và reload trang")
        print("4. Tìm request có:")
        print("   - Type: XHR hoặc Fetch")
        print("   - Name chứa: exam, test, 343, question, hsk1")
        print("   - URL không phải google-analytics.com")
        print("5. Copy Request URL và gửi cho tôi")
        print("\nSau đó cập nhật script với endpoint mới:")
        print("  endpoints_to_try = [")
        print("      (\"URL_BẠN_TÌM_ĐƯỢC\", \"GET/POST\", payload_nếu_có),")
        print("  ]")
    print("=" * 60)

if __name__ == "__main__":
    main()

