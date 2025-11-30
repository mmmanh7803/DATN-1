"""
Script test OCR đơn giản - chỉ thử với 1-2 images đầu tiên
"""

import requests
import json
import sys
import io
from urllib.parse import urljoin

# Fix encoding cho Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

BASE_URL = "https://chinesetest.online"
BASE_PATH = "/fileluutru/chungchi/hsk/hsk1/bo1/images/"

def test_ocr():
    """Test OCR với 1-2 images đầu tiên"""
    print("=" * 60)
    print("Test OCR với images đầu tiên")
    print("=" * 60)
    
    # Kiểm tra pytesseract
    try:
        import pytesseract
        from PIL import Image
        import io as image_io
        import os
        print("✓ Đã import pytesseract và PIL")
    except ImportError as e:
        print(f"❌ Chưa cài đặt: {e}")
        print("\nCài đặt:")
        print("  python -m pip install pytesseract pillow")
        return
    
    # Tìm Tesseract
    print("\nĐang tìm Tesseract OCR...")
    common_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        r"C:\Users\{}\AppData\Local\Programs\Tesseract-OCR\tesseract.exe".format(os.getenv('USERNAME', '')),
    ]
    
    tesseract_path = None
    for path in common_paths:
        if os.path.exists(path):
            tesseract_path = path
            print(f"✓ Tìm thấy Tesseract tại: {path}")
            pytesseract.pytesseract.tesseract_cmd = path
            break
    
    if not tesseract_path:
        print("✗ Không tìm thấy Tesseract OCR")
        print("\nCần cài đặt Tesseract OCR:")
        print("  Windows: https://github.com/UB-Mannheim/tesseract/wiki")
        print("  Sau khi cài đặt, chạy lại script này")
        return
    
    # Test với 1-2 images đầu tiên
    test_images = ['1.jpg', '2.jpg']
    
    print(f"\nĐang test OCR với {len(test_images)} image(s)...\n")
    
    for img_name in test_images:
        img_url = urljoin(BASE_URL, BASE_PATH + img_name)
        print(f"Đang tải: {img_name}")
        
        try:
            response = requests.get(img_url, timeout=10)
            if response.status_code == 200:
                print(f"✓ Đã tải image")
                
                # Extract text
                print("Đang extract text...")
                try:
                    img = Image.open(image_io.BytesIO(response.content))
                    
                    # Thử với tiếng Trung
                    try:
                        text = pytesseract.image_to_string(img, lang='chi_sim+eng')
                    except:
                        # Nếu không có language pack, thử chỉ tiếng Anh
                        try:
                            text = pytesseract.image_to_string(img, lang='eng')
                        except:
                            text = pytesseract.image_to_string(img)
                    
                    if text.strip():
                        print(f"✓ Extract được text ({len(text)} ký tự):")
                        print(f"  {text[:200]}...")
                        
                        # Lưu kết quả
                        with open(f'ocr_test_{img_name.replace(".jpg", "")}.txt', 'w', encoding='utf-8') as f:
                            f.write(text)
                        print(f"  ✓ Đã lưu vào: ocr_test_{img_name.replace('.jpg', '')}.txt")
                    else:
                        print("⚠ Không extract được text (có thể image không chứa text)")
                except Exception as e:
                    print(f"✗ Lỗi OCR: {e}")
            else:
                print(f"✗ Không thể tải image: {response.status_code}")
        except Exception as e:
            print(f"✗ Lỗi: {e}")
        
        print()
    
    print("=" * 60)
    print("Hoàn thành test!")
    print("=" * 60)

if __name__ == "__main__":
    test_ocr()

