"""
Hướng dẫn cài đặt Tesseract OCR
"""

import os
import sys
import io

# Fix encoding cho Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def check_tesseract_installed():
    """Kiểm tra xem Tesseract đã được cài đặt chưa"""
    print("=" * 60)
    print("Kiểm tra Tesseract OCR")
    print("=" * 60)
    
    # Các đường dẫn phổ biến trên Windows
    common_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        r"C:\Users\{}\AppData\Local\Programs\Tesseract-OCR\tesseract.exe".format(os.getenv('USERNAME', '')),
    ]
    
    print("\nĐang kiểm tra các đường dẫn phổ biến...")
    found = False
    
    for path in common_paths:
        if os.path.exists(path):
            print(f"✓ Tìm thấy Tesseract tại: {path}")
            found = True
            # Cấu hình pytesseract để dùng đường dẫn này
            try:
                import pytesseract
                pytesseract.pytesseract.tesseract_cmd = path
                print(f"✓ Đã cấu hình pytesseract")
                return True
            except:
                pass
    
    if not found:
        print("✗ Không tìm thấy Tesseract OCR")
    
    return found

def print_installation_guide():
    """In hướng dẫn cài đặt"""
    print("\n" + "=" * 60)
    print("HƯỚNG DẪN CÀI ĐẶT TESSERACT OCR")
    print("=" * 60)
    
    print("\n1. Tải Tesseract OCR:")
    print("   Windows: https://github.com/UB-Mannheim/tesseract/wiki")
    print("   Hoặc: https://github.com/tesseract-ocr/tesseract/releases")
    
    print("\n2. Cài đặt:")
    print("   - Chạy file installer (.exe)")
    print("   - Chọn đường dẫn cài đặt (mặc định: C:\\Program Files\\Tesseract-OCR)")
    print("   - Quan trọng: Chọn cài đặt language data cho tiếng Trung (chi_sim)")
    
    print("\n3. Sau khi cài đặt:")
    print("   - Thêm Tesseract vào PATH (hoặc ghi nhớ đường dẫn)")
    print("   - Hoặc cấu hình trong script Python:")
    print("     import pytesseract")
    print("     pytesseract.pytesseract.tesseract_cmd = r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'")
    
    print("\n4. Kiểm tra:")
    print("   - Mở Command Prompt")
    print("   - Chạy: tesseract --version")
    print("   - Nếu hiển thị version thì đã cài đặt thành công")
    
    print("\n5. Cài đặt language pack tiếng Trung:")
    print("   - Tải: https://github.com/tesseract-ocr/tessdata")
    print("   - Copy file chi_sim.traineddata vào thư mục tessdata")
    print("   - Thường ở: C:\\Program Files\\Tesseract-OCR\\tessdata")
    
    print("\n" + "=" * 60)
    print("SAU KHI CÀI ĐẶT:")
    print("=" * 60)
    print("Chạy lại script: python extract_text_from_images_ocr.py")
    print("=" * 60)

def main():
    if check_tesseract_installed():
        print("\n✓ Tesseract đã được cài đặt!")
        print("Có thể chạy script OCR ngay:")
        print("  python extract_text_from_images_ocr.py")
    else:
        print_installation_guide()

if __name__ == "__main__":
    main()

