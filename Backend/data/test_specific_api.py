"""
Test API cụ thể với Bearer token
"""

import requests
import json

# Bearer token từ DevTools
TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMWJhYjJjYWE3N2Y1MTY0ZjE4NDQwMGRiOGY2NDMwNzU3YzQ1M2Y5MTJkNDBmNTRhNTk1OTEwNDAyYjkyNGRjMGYzODRmNmYwMGM1OWUxYzAiLCJpYXQiOjE3NjQ2MDIyNjguMTQzNTQxLCJuYmYiOjE3NjQ2MDIyNjguMTQzNTQ5LCJleHAiOjE3OTYxMzgyNjguMTMzNDk4LCJzdWIiOiIyMzQyMSIsInNjb3BlcyI6W119.b-t2OgYTpQPZYqHRppFVqpyVzGxIAlCZoSJtfh25yqP32bDYsCtAz5BhYnDZbmhPAit3r8xgarqWt_jIGWdN4En_2UGG96uQClhBaHNepKanfi41tmVAmpNKbMJpZRV0I5UvhWkUqLUrwA2hC_f0oj4rOl7WKr2g7DxynO0wZ7JCP1tzWH5z4wLHQxUurnNV0U6-8BpZafGagyWYmcXznWd3lqf3TMdLA9Ux6CaYMtq6L_GVWs4qqtMJEMO55xEZvRvtcTRKlvD2I9JhoIxkJh7XssAAvYhiLZvhqaK6Fe7QEWaNodr2gTt2pVfDZFwRd3gM-w1diDDitJo0dsbMOJtRuYAseMg194bJ5ELyftg5ci9_LJWbZieoxLKlyEevIgnVf29YXV5JtbYZJ7D4RVolFCtqWJuwPbXoJY6X4AfjpdyDwcG-b93buNdmAucFpDiLq1mQgao5CAv_KgRaBr6Isn3_5-AfoZCegjqOHRZT0wkhNRk23cgA08fCoRzRnQocV0aXV9uZD14nfH6QpwrDmZ3KDvQ9a94h3ZozpKcjeHpNj6CxOOKFPw0wlRa_ezPwSyPw5iQKRvsZpFZMH9Zwvc_RVFYqL-6lrSxAz-F37qzvaCmTvTfZDoQt8-HOQ6rjLi9CiGI3WnHzecVddgXXnZYpID55V84z4Vrxfw0"

# API URL cụ thể
URL = "https://api.hihsk.com/api/exam/hsk/1/325"

def test_api():
    """Test API với token"""
    
    print(f"🔍 Testing API: {URL}\n")
    
    headers = {
        'Authorization': f'Bearer {TOKEN}',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(URL, headers=headers, timeout=10)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📦 Content-Type: {response.headers.get('Content-Type')}\n")
        
        if response.status_code == 200:
            print("✅ API HOẠT ĐỘNG!\n")
            
            data = response.json()
            
            # Lưu response
            with open('hihsk_exam_325.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print("💾 Đã lưu response vào: hihsk_exam_325.json\n")
            
            # Phân tích cấu trúc
            print("📋 Cấu trúc dữ liệu:")
            if isinstance(data, dict):
                for key, value in data.items():
                    if isinstance(value, list):
                        print(f"   - {key}: List[{len(value)} items]")
                        if len(value) > 0 and isinstance(value[0], dict):
                            print(f"     → First item keys: {list(value[0].keys())}")
                    elif isinstance(value, dict):
                        print(f"   - {key}: Dict[{list(value.keys())[:5]}...]")
                    else:
                        print(f"   - {key}: {value}")
            
            print("\n🎉 THÀNH CÔNG! Dữ liệu đã sẵn sàng!")
            return data
            
        elif response.status_code == 404:
            print("❌ 404 - Không tìm thấy đề thi với ID 325")
            print(f"📄 Response: {response.text}\n")
            
            print("💡 Có thể:")
            print("   - ID 325 không tồn tại")
            print("   - Thử ID khác: 1, 10, 100, 200...")
            print("   - Hoặc lấy danh sách đề thi trước")
            return None
            
        elif response.status_code == 401:
            print("❌ 401 - Token không hợp lệ hoặc đã hết hạn")
            print("💡 Lấy token mới từ DevTools")
            return None
            
        else:
            print(f"❌ Lỗi: {response.status_code}")
            print(f"📄 Response: {response.text[:200]}")
            return None
            
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return None


if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════╗
║         TEST HIHSK API VỚI BEARER TOKEN                    ║
╚════════════════════════════════════════════════════════════╝
""")
    
    data = test_api()
    
    if data:
        print("\n" + "="*60)
        print("🚀 BƯỚC TIẾP THEO")
        print("="*60)
        print("""
1. Xem file hihsk_exam_325.json
2. Phân tích cấu trúc dữ liệu
3. Tạo script chuyển đổi sang format template
4. Import vào database
""")
    else:
        print("\n" + "="*60)
        print("💡 THỬ TÌM ENDPOINT KHÁC")
        print("="*60)
        print("""
Chạy script tìm tự động:
    python fetch_hihsk_exam.py

Hoặc tìm thủ công:
1. Mở DevTools → Network → Fetch/XHR
2. Click vào các đề thi khác
3. Tìm request 200 OK
4. Copy URL và test lại
""")

