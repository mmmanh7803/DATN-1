"""
Test API endpoint của HiHSK
"""

import requests
import json

def test_hihsk_api():
    """Test API endpoint"""
    
    # API URL bạn tìm thấy
    url = "https://api.hihsk.com/api/exam/hsk/1/325"
    
    print("🔍 Testing API endpoint...")
    print(f"📍 URL: {url}\n")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📦 Content-Type: {response.headers.get('Content-Type')}\n")
        
        if response.status_code == 200:
            print("✅ API HOẠT ĐỘNG!\n")
            
            # Parse JSON
            data = response.json()
            
            # Lưu response để phân tích
            with open('hihsk_api_response.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print("💾 Đã lưu response vào: hihsk_api_response.json\n")
            
            # Phân tích cấu trúc
            print("📋 Cấu trúc dữ liệu:")
            print(f"   Type: {type(data)}")
            
            if isinstance(data, dict):
                print(f"   Keys: {list(data.keys())}")
                
                # Hiển thị một số thông tin cơ bản
                for key, value in list(data.items())[:5]:
                    if isinstance(value, (str, int, bool)):
                        print(f"   - {key}: {value}")
                    elif isinstance(value, list):
                        print(f"   - {key}: List[{len(value)} items]")
                    elif isinstance(value, dict):
                        print(f"   - {key}: Dict[{len(value)} keys]")
            
            return data
            
        else:
            print(f"❌ API trả về lỗi: {response.status_code}")
            print(f"📄 Response: {response.text[:500]}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Lỗi kết nối: {e}")
        return None


def explore_api_patterns():
    """Thử các API patterns khác"""
    
    print("\n" + "="*60)
    print("🔍 KHÁM PHÁ CÁC API PATTERNS KHÁC")
    print("="*60 + "\n")
    
    patterns = [
        "https://api.hihsk.com/api/exam/hsk/2/325",  # HSK 2
        "https://api.hihsk.com/api/exam/hsk/1/",     # List exams
        "https://api.hihsk.com/api/exams/hsk/1",     # Alternative
    ]
    
    for url in patterns:
        print(f"📍 Testing: {url}")
        try:
            response = requests.get(url, timeout=5)
            print(f"   → Status: {response.status_code}")
            if response.status_code == 200:
                print(f"   ✅ Có dữ liệu!")
        except:
            print(f"   ❌ Không kết nối được")
        print()


if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════╗
║            TEST HIHSK API ENDPOINT                         ║
╚════════════════════════════════════════════════════════════╝
""")
    
    # Test API endpoint
    data = test_hihsk_api()
    
    # Explore other patterns
    explore_api_patterns()
    
    if data:
        print("\n" + "="*60)
        print("🎉 THÀNH CÔNG!")
        print("="*60)
        print("\n📁 Xem file hihsk_api_response.json để phân tích chi tiết")
        print("\n🚀 Bước tiếp theo:")
        print("   1. Phân tích cấu trúc JSON response")
        print("   2. Viết script chuyển đổi sang format template")
        print("   3. Import vào database")

