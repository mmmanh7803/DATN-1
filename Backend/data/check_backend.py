"""
Script kiểm tra Backend có đang chạy không
"""

import requests
import sys

API_BASE_URL = "http://localhost:5075/api"

def check_backend():
    print("🔍 Kiểm tra Backend...")
    print(f"   URL: {API_BASE_URL}\n")
    
    try:
        # Try to ping the API
        response = requests.get(f"{API_BASE_URL}/health", timeout=3)
        
        if response.status_code == 200:
            print("✅ Backend đang chạy!")
            print(f"   Status: {response.status_code}")
            return True
        else:
            print(f"⚠️  Backend phản hồi nhưng có lỗi: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Backend KHÔNG chạy!")
        print("\n💡 Hướng dẫn khởi động Backend:")
        print("   1. Mở terminal mới")
        print("   2. cd C:\\Users\\hmanh\\source\\repos\\DATN\\Backend\\src\\HiHSK.Api")
        print("   3. dotnet run")
        print("   4. Đợi Backend khởi động (có thể mất 10-30 giây)")
        print("   5. Chạy lại script này\n")
        return False
        
    except Exception as e:
        print(f"❌ Lỗi khi kiểm tra: {e}")
        return False

def check_exam_api():
    """Kiểm tra ExamPapers API có hoạt động không"""
    print("\n🔍 Kiểm tra ExamPapers API...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/exam-papers", timeout=3)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ ExamPapers API hoạt động!")
            print(f"   Số đề thi hiện có: {len(data) if isinstance(data, list) else 'N/A'}")
            return True
        else:
            print(f"⚠️  ExamPapers API có lỗi: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Không thể kiểm tra ExamPapers API: {e}")
        return False

if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════╗
║              KIỂM TRA BACKEND STATUS                       ║
╚════════════════════════════════════════════════════════════╝
""")
    
    backend_ok = check_backend()
    
    if backend_ok:
        check_exam_api()
        print("\n🎉 Backend sẵn sàng! Có thể chạy import script.")
        sys.exit(0)
    else:
        print("\n⚠️  Vui lòng khởi động Backend trước khi import dữ liệu.")
        sys.exit(1)

