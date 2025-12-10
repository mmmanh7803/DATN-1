"""
Script lấy dữ liệu đề thi từ HiHSK API với Bearer token
"""

import requests
import json
from typing import Optional, Dict, List

class HiHSKAPIClient:
    def __init__(self, bearer_token: str):
        self.base_url = "https://api.hihsk.com/api"
        self.headers = {
            'Authorization': f'Bearer {bearer_token}',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def test_endpoint(self, endpoint: str) -> Dict:
        """Test một endpoint"""
        url = f"{self.base_url}/{endpoint}"
        try:
            print(f"📍 Testing: {endpoint}")
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ SUCCESS! Data: {list(data.keys()) if isinstance(data, dict) else type(data)}")
                return {"success": True, "data": data}
            else:
                print(f"   ❌ Status {response.status_code}: {response.text[:100]}")
                return {"success": False, "status": response.status_code}
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return {"success": False, "error": str(e)}
    
    def find_exam_endpoints(self) -> List[str]:
        """Tìm các endpoints có dữ liệu"""
        
        print("\n" + "="*60)
        print("🔍 TÌM KIẾM EXAM ENDPOINTS")
        print("="*60 + "\n")
        
        # Các patterns có thể
        endpoints = [
            # List endpoints
            "exams",
            "tests",
            "exam/list",
            "exam/hsk",
            "exams/hsk",
            
            # HSK level endpoints
            "exam/hsk/1",
            "exam/hsk/2",
            "exam/hsk/3",
            
            # Specific exam IDs
            "exam/hsk/1/1",
            "exam/hsk/1/10",
            "exam/hsk/1/100",
            "exam/hsk/2/1",
            "exam/hsk/2/10",
            
            # Practice endpoints
            "practice/hsk/1",
            "practice/hsk/2",
            
            # Study endpoints
            "study/exams",
            "study/tests",
        ]
        
        successful = []
        
        for endpoint in endpoints:
            result = self.test_endpoint(endpoint)
            if result["success"]:
                successful.append(endpoint)
                
                # Lưu response
                filename = f"hihsk_api_{endpoint.replace('/', '_')}.json"
                with open(filename, 'w', encoding='utf-8') as f:
                    json.dump(result["data"], f, indent=2, ensure_ascii=False)
                print(f"   💾 Saved: {filename}\n")
        
        return successful
    
    def get_exam_detail(self, level: int, exam_id: int) -> Optional[Dict]:
        """Lấy chi tiết một đề thi"""
        endpoint = f"exam/hsk/{level}/{exam_id}"
        result = self.test_endpoint(endpoint)
        return result.get("data") if result.get("success") else None


def main():
    print("""
╔════════════════════════════════════════════════════════════╗
║         FETCH DỮ LIỆU ĐỀ THI TỪ HIHSK API                 ║
╚════════════════════════════════════════════════════════════╝
""")
    
    # Bearer token (từ DevTools)
    token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMWJhYjJjYWE3N2Y1MTY0ZjE4NDQwMGRiOGY2NDMwNzU3YzQ1M2Y5MTJkNDBmNTRhNTk1OTEwNDAyYjkyNGRjMGYzODRmNmYwMGM1OWUxYzAiLCJpYXQiOjE3NjQ2MDIyNjguMTQzNTQxLCJuYmYiOjE3NjQ2MDIyNjguMTQzNTQ5LCJleHAiOjE3OTYxMzgyNjguMTMzNDk4LCJzdWIiOiIyMzQyMSIsInNjb3BlcyI6W119.b-t2OgYTpQPZYqHRppFVqpyVzGxIAlCZoSJtfh25yqP32bDYsCtAz5BhYnDZbmhPAit3r8xgarqWt_jIGWdN4En_2UGG96uQClhBaHNepKanfi41tmVAmpNKbMJpZRV0I5UvhWkUqLUrwA2hC_f0oj4rOl7WKr2g7DxynO0wZ7JCP1tzWH5z4wLHQxUurnNV0U6-8BpZafGagyWYmcXznWd3lqf3TMdLA9Ux6CaYMtq6L_GVWs4qqtMJEMO55xEZvRvtcTRKlvD2I9JhoIxkJh7XssAAvYhiLZvhqaK6Fe7QEWaNodr2gTt2pVfDZFwRd3gM-w1diDDitJo0dsbMOJtRuYAseMg194bJ5ELyftg5ci9_LJWbZieoxLKlyEevIgnVf29YXV5JtbYZJ7D4RVolFCtqWJuwPbXoJY6X4AfjpdyDwcG-b93buNdmAucFpDiLq1mQgao5CAv_KgRaBr6Isn3_5-AfoZCegjqOHRZT0wkhNRk23cgA08fCoRzRnQocV0aXV9uZD14nfH6QpwrDmZ3KDvQ9a94h3ZozpKcjeHpNj6CxOOKFPw0wlRa_ezPwSyPw5iQKRvsZpFZMH9Zwvc_RVFYqL-6lrSxAz-F37qzvaCmTvTfZDoQt8-HOQ6rjLi9CiGI3WnHzecVddgXXnZYpID55V84z4Vrxfw0"
    
    print(f"🔐 Token: {token[:50]}...\n")
    
    # Khởi tạo client
    client = HiHSKAPIClient(token)
    
    # Tìm endpoints hoạt động
    successful = client.find_exam_endpoints()
    
    if successful:
        print("\n" + "="*60)
        print(f"🎉 TÌM THẤY {len(successful)} ENDPOINTS HOẠT ĐỘNG!")
        print("="*60)
        print("\n✅ Endpoints:")
        for endpoint in successful:
            print(f"   - {endpoint}")
        
        print("\n📁 Xem các file JSON đã lưu để phân tích dữ liệu")
        print("\n🚀 Bước tiếp theo:")
        print("   1. Phân tích cấu trúc JSON response")
        print("   2. Tạo script chuyển đổi sang format template")
        print("   3. Import vào database")
    else:
        print("\n⚠️ Không tìm thấy endpoint nào hoạt động")
        print("\n💡 Cần:")
        print("   - Kiểm tra lại URL trong DevTools")
        print("   - Có thể cần thêm headers khác")
        print("   - Hoặc API pattern khác với dự kiến")


if __name__ == "__main__":
    main()

