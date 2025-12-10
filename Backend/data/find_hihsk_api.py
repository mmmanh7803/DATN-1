"""
Script thử nhiều API patterns để tìm endpoint đúng
"""

import requests
import json

def test_api_pattern(url):
    """Test một API pattern"""
    try:
        response = requests.get(url, timeout=5)
        return {
            "url": url,
            "status": response.status_code,
            "success": response.status_code == 200,
            "data": response.json() if response.status_code == 200 else None
        }
    except Exception as e:
        return {
            "url": url,
            "status": "Error",
            "success": False,
            "error": str(e)
        }


def find_working_endpoints():
    """Thử nhiều patterns khác nhau"""
    
    print("🔍 Đang thử tìm API endpoints hoạt động...\n")
    
    # Các patterns có thể
    patterns = [
        # Patterns với ID khác nhau
        "https://api.hihsk.com/api/exam/hsk/1/1",
        "https://api.hihsk.com/api/exam/hsk/1/100",
        "https://api.hihsk.com/api/exam/hsk/2/1",
        
        # Patterns không cần ID
        "https://api.hihsk.com/api/exams",
        "https://api.hihsk.com/api/tests",
        "https://api.hihsk.com/api/hsk/exams",
        
        # List endpoints
        "https://api.hihsk.com/api/exam/list",
        "https://api.hihsk.com/api/exam/hsk/1",
        "https://api.hihsk.com/api/exam/hsk/2",
        
        # Alternative patterns
        "https://api.hihsk.com/api/test/hsk1",
        "https://api.hihsk.com/api/test/hsk2",
        
        # Practice endpoints
        "https://api.hihsk.com/api/practice/hsk/1",
        "https://api.hihsk.com/api/practice/hsk/2",
    ]
    
    results = []
    
    for pattern in patterns:
        print(f"📍 Testing: {pattern}")
        result = test_api_pattern(pattern)
        results.append(result)
        
        if result["success"]:
            print(f"   ✅ SUCCESS! Status: {result['status']}")
            print(f"   📦 Data keys: {list(result['data'].keys()) if result['data'] else 'None'}")
        else:
            status = result.get('status', 'Error')
            print(f"   ❌ Failed: {status}")
        print()
    
    # Tổng hợp kết quả
    successful = [r for r in results if r["success"]]
    
    print("="*60)
    print(f"📊 KẾT QUẢ: Tìm thấy {len(successful)}/{len(patterns)} endpoints hoạt động")
    print("="*60)
    
    if successful:
        print("\n✅ CÁC ENDPOINTS HOẠT ĐỘNG:")
        for r in successful:
            print(f"   - {r['url']}")
            
            # Lưu response
            filename = f"api_response_{r['url'].split('/')[-1]}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(r['data'], f, indent=2, ensure_ascii=False)
            print(f"     💾 Saved to: {filename}")
    else:
        print("\n❌ Không tìm thấy endpoint nào hoạt động")
        print("\n💡 GỢI Ý:")
        print("   1. Kiểm tra DevTools Network tab khi dùng trang web")
        print("   2. API có thể cần authentication token")
        print("   3. Thử với session cookies từ browser")
    
    return successful


if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════╗
║          TÌM KIẾM API ENDPOINTS HIHSK                      ║
╚════════════════════════════════════════════════════════════╝
""")
    
    successful = find_working_endpoints()
    
    if not successful:
        print("\n" + "="*60)
        print("📖 HƯỚNG DẪN TÌM API THỦ CÔNG")
        print("="*60)
        print("""
1. Mở Chrome và truy cập: https://hihsk.com/
2. Đăng nhập (nếu cần)
3. Mở DevTools (F12) → Network tab
4. Lọc: XHR hoặc Fetch
5. Click vào một đề thi HSK
6. Tìm request đến api.hihsk.com với status 200
7. Copy Request URL
8. Paste URL đó vào đây để test

Hoặc gửi cho tôi URL đó, tôi sẽ tạo script!
""")

