"""
Script xử lý file PDF đề thi HSK H10901
- H10901.pdf - Đề thi chính
- H10901 听力材料.pdf - Tài liệu nghe (Listening materials)
"""

import json
import sys
import io
import os
import re
from pathlib import Path

# Fix encoding cho Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def extract_pdf_content(pdf_path):
    """Extract toàn bộ nội dung từ PDF"""
    print(f"Đang extract từ: {os.path.basename(pdf_path)}...")
    
    # Thử pdfplumber trước (tốt nhất cho text)
    try:
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            content = []
            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text()
                if text:
                    content.append({
                        'page': page_num,
                        'text': text,
                    })
            return content
    except ImportError:
        pass
    except Exception as e:
        print(f"⚠ Lỗi pdfplumber: {e}")
    
    # Thử PyMuPDF
    try:
        import fitz
        doc = fitz.open(pdf_path)
        content = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            if text:
                content.append({
                    'page': page_num + 1,
                    'text': text,
                })
        doc.close()
        return content
    except ImportError:
        pass
    except Exception as e:
        print(f"⚠ Lỗi PyMuPDF: {e}")
    
    # Thử PyPDF2
    try:
        import PyPDF2
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            content = []
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                if text:
                    content.append({
                        'page': page_num + 1,
                        'text': text,
                    })
            return content
    except ImportError:
        pass
    except Exception as e:
        print(f"⚠ Lỗi PyPDF2: {e}")
    
    return None

def extract_images_from_pdf(pdf_path, output_dir):
    """Extract images từ PDF"""
    try:
        import fitz  # PyMuPDF
        os.makedirs(output_dir, exist_ok=True)
        
        images = []
        doc = fitz.open(pdf_path)
        pdf_name = os.path.splitext(os.path.basename(pdf_path))[0]
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            image_list = page.get_images()
            
            for img_index, img in enumerate(image_list, 1):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                
                image_filename = f"{pdf_name}_page_{page_num + 1}_img_{img_index}.{image_ext}"
                image_path = os.path.join(output_dir, image_filename)
                
                with open(image_path, "wb") as img_file:
                    img_file.write(image_bytes)
                
                images.append({
                    'page': page_num + 1,
                    'index': img_index,
                    'filename': image_filename,
                    'path': image_path,
                })
        
        doc.close()
        return images
    except:
        return None

def parse_hsk_questions(text_content):
    """Parse câu hỏi HSK từ text"""
    full_text = '\n\n'.join([item['text'] for item in text_content])
    
    questions = []
    
    # Pattern 1: Câu hỏi dạng "1. ..." hoặc "Câu 1: ..." hoặc "1) ..."
    question_pattern = r'(?:^|\n)\s*(?:Câu\s+)?(\d+)[\.:\)]\s*(.+?)(?=\n\s*(?:Câu\s+)?\d+[\.:\)]|\n\s*[A-D][\.\)]|$)'
    
    matches = re.finditer(question_pattern, full_text, re.MULTILINE | re.DOTALL)
    
    for match in matches:
        q_num = int(match.group(1))
        q_text = match.group(2).strip()
        
        # Tìm đáp án A, B, C, D
        options_pattern = r'([A-D])[\.\)]\s*(.+?)(?=\n\s*[A-D][\.\)]|$)'
        options_matches = re.findall(options_pattern, q_text, re.MULTILINE)
        
        if options_matches:
            # Tách phần câu hỏi và đáp án
            q_text_clean = re.sub(r'[A-D][\.\)].+', '', q_text, flags=re.MULTILINE).strip()
            
            options = {}
            for opt_letter, opt_text in options_matches:
                options[opt_letter] = opt_text.strip()
            
            questions.append({
                'number': q_num,
                'question_text': q_text_clean,
                'options': options,
            })
    
    return questions

def analyze_listening_materials(text_content):
    """Phân tích tài liệu nghe (听力材料)"""
    full_text = '\n\n'.join([item['text'] for item in text_content])
    
    # Tìm các phần có thể là script nghe
    listening_parts = []
    
    # Pattern: Tìm các phần có số thứ tự (1, 2, 3...) hoặc chữ cái (A, B, C...)
    part_patterns = [
        r'(?:^|\n)\s*(\d+)[\.:\)]\s*(.+?)(?=\n\s*\d+[\.:\)]|$)',
        r'(?:^|\n)\s*([A-Z])[\.:\)]\s*(.+?)(?=\n\s*[A-Z][\.:\)]|$)',
    ]
    
    for pattern in part_patterns:
        matches = re.finditer(pattern, full_text, re.MULTILINE | re.DOTALL)
        for match in matches:
            part_num = match.group(1)
            part_text = match.group(2).strip()
            
            if len(part_text) > 20:  # Chỉ lấy phần có nội dung đủ dài
                listening_parts.append({
                    'part': part_num,
                    'text': part_text[:500],  # 500 ký tự đầu
                })
    
    return listening_parts

def main():
    print("=" * 60)
    print("Xử lý file PDF đề thi HSK H10901")
    print("=" * 60)
    
    # Tìm các file PDF
    examples_dir = Path('Examples')
    if not examples_dir.exists():
        examples_dir = Path('.')
    
    pdf_files = {
        'exam': None,
        'listening': None,
    }
    
    # Tìm file đề thi chính
    exam_file = examples_dir / 'H10901.pdf'
    if not exam_file.exists():
        exam_file = Path('H10901.pdf')
    
    if exam_file.exists():
        pdf_files['exam'] = str(exam_file)
        print(f"✓ Tìm thấy đề thi: {exam_file.name}")
    else:
        print("⚠ Không tìm thấy H10901.pdf")
    
    # Tìm file tài liệu nghe
    listening_file = examples_dir / 'H10901 听力材料.pdf'
    if not listening_file.exists():
        listening_file = Path('H10901 听力材料.pdf')
    
    if listening_file.exists():
        pdf_files['listening'] = str(listening_file)
        print(f"✓ Tìm thấy tài liệu nghe: {listening_file.name}")
    else:
        print("⚠ Không tìm thấy H10901 听力材料.pdf")
    
    if not pdf_files['exam'] and not pdf_files['listening']:
        print("\n✗ Không tìm thấy file PDF nào")
        print("\nĐảm bảo các file nằm trong:")
        print("  - Backend/data/Examples/")
        print("  - Hoặc Backend/data/")
        return
    
    results = {}
    
    # Xử lý đề thi chính
    if pdf_files['exam']:
        print("\n" + "=" * 60)
        print("1. Xử lý đề thi chính (H10901.pdf)")
        print("=" * 60)
        
        text_content = extract_pdf_content(pdf_files['exam'])
        
        if text_content:
            print(f"✓ Đã extract text từ {len(text_content)} trang")
            
            # Lưu text
            exam_text_file = 'h10901_exam_text.json'
            with open(exam_text_file, 'w', encoding='utf-8') as f:
                json.dump(text_content, f, ensure_ascii=False, indent=2)
            
            full_text = '\n\n'.join([f"=== Trang {item['page']} ===\n{item['text']}" 
                                   for item in text_content])
            with open('h10901_exam_text.txt', 'w', encoding='utf-8') as f:
                f.write(full_text)
            
            print(f"✓ Đã lưu text vào: {exam_text_file} và h10901_exam_text.txt")
            
            # Extract images
            images = extract_images_from_pdf(pdf_files['exam'], 'h10901_exam_images')
            if images:
                print(f"✓ Đã extract {len(images)} image(s) vào: h10901_exam_images/")
                with open('h10901_exam_images.json', 'w', encoding='utf-8') as f:
                    json.dump(images, f, ensure_ascii=False, indent=2)
            
            # Parse questions
            questions = parse_hsk_questions(text_content)
            if questions:
                print(f"✓ Đã parse {len(questions)} câu hỏi")
                with open('h10901_exam_questions.json', 'w', encoding='utf-8') as f:
                    json.dump(questions, f, ensure_ascii=False, indent=2)
            else:
                print("⚠ Không parse được câu hỏi tự động")
            
            results['exam'] = {
                'pages': len(text_content),
                'questions': len(questions),
                'images': len(images) if images else 0,
            }
    
    # Xử lý tài liệu nghe
    if pdf_files['listening']:
        print("\n" + "=" * 60)
        print("2. Xử lý tài liệu nghe (H10901 听力材料.pdf)")
        print("=" * 60)
        
        text_content = extract_pdf_content(pdf_files['listening'])
        
        if text_content:
            print(f"✓ Đã extract text từ {len(text_content)} trang")
            
            # Lưu text
            listening_text_file = 'h10901_listening_text.json'
            with open(listening_text_file, 'w', encoding='utf-8') as f:
                json.dump(text_content, f, ensure_ascii=False, indent=2)
            
            full_text = '\n\n'.join([f"=== Trang {item['page']} ===\n{item['text']}" 
                                   for item in text_content])
            with open('h10901_listening_text.txt', 'w', encoding='utf-8') as f:
                f.write(full_text)
            
            print(f"✓ Đã lưu text vào: {listening_text_file} và h10901_listening_text.txt")
            
            # Phân tích tài liệu nghe
            listening_parts = analyze_listening_materials(text_content)
            if listening_parts:
                print(f"✓ Đã phân tích {len(listening_parts)} phần")
                with open('h10901_listening_parts.json', 'w', encoding='utf-8') as f:
                    json.dump(listening_parts, f, ensure_ascii=False, indent=2)
            
            # Extract images
            images = extract_images_from_pdf(pdf_files['listening'], 'h10901_listening_images')
            if images:
                print(f"✓ Đã extract {len(images)} image(s) vào: h10901_listening_images/")
                with open('h10901_listening_images.json', 'w', encoding='utf-8') as f:
                    json.dump(images, f, ensure_ascii=False, indent=2)
            
            results['listening'] = {
                'pages': len(text_content),
                'parts': len(listening_parts),
                'images': len(images) if images else 0,
            }
    
    # Tổng kết
    print("\n" + "=" * 60)
    print("Tổng kết")
    print("=" * 60)
    
    if 'exam' in results:
        print(f"\nĐề thi chính:")
        print(f"  - Trang: {results['exam']['pages']}")
        print(f"  - Câu hỏi: {results['exam']['questions']}")
        print(f"  - Images: {results['exam']['images']}")
    
    if 'listening' in results:
        print(f"\nTài liệu nghe:")
        print(f"  - Trang: {results['listening']['pages']}")
        print(f"  - Phần: {results['listening']['parts']}")
        print(f"  - Images: {results['listening']['images']}")
    
    # Lưu summary
    with open('h10901_summary.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print("Files đã tạo:")
    print("=" * 60)
    print("\nĐề thi chính:")
    print("  - h10901_exam_text.json")
    print("  - h10901_exam_text.txt")
    if 'exam' in results and results['exam']['questions'] > 0:
        print("  - h10901_exam_questions.json")
    if 'exam' in results and results['exam']['images'] > 0:
        print("  - h10901_exam_images.json")
        print("  - h10901_exam_images/")
    
    print("\nTài liệu nghe:")
    print("  - h10901_listening_text.json")
    print("  - h10901_listening_text.txt")
    if 'listening' in results and results['listening']['parts'] > 0:
        print("  - h10901_listening_parts.json")
    if 'listening' in results and results['listening']['images'] > 0:
        print("  - h10901_listening_images.json")
        print("  - h10901_listening_images/")
    
    print("\n  - h10901_summary.json")
    
    print("\n" + "=" * 60)
    print("Bước tiếp theo:")
    print("=" * 60)
    print("1. Xem các file .txt để kiểm tra nội dung")
    print("2. Chỉnh sửa câu hỏi trong file .json nếu cần")
    print("3. Thêm đáp án đúng và audio links")
    print("4. Sử dụng OCR trên images nếu cần")
    print("5. Import dữ liệu vào database")

if __name__ == "__main__":
    main()

