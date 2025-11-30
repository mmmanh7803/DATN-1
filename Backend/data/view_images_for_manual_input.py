"""
Script để tải và hiển thị thông tin images
Giúp người dùng xem images và điền nội dung câu hỏi thủ công
"""

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

def create_images_list():
    """Tạo danh sách images với thông tin để manual input"""
    
    # Đọc cấu trúc questions
    try:
        with open('hsk1bo1_questions_structure.json', 'r', encoding='utf-8') as f:
            questions_data = json.load(f)
    except FileNotFoundError:
        print("❌ Không tìm thấy file hsk1bo1_questions_structure.json")
        return
    
    images_list = []
    
    for q in questions_data['questions']:
        q_num = q['question_number']
        
        # Images chính (câu hỏi)
        for img in q.get('images', []):
            images_list.append({
                'question_number': q_num,
                'type': 'question',
                'filename': img['filename'],
                'url': img['url'],
                'description': f'Câu hỏi {q_num} - Image chính',
            })
        
        # Options images
        for option_key, option_data in q.get('options', {}).items():
            images_list.append({
                'question_number': q_num,
                'type': 'option',
                'option': option_key.upper(),
                'filename': option_data['filename'],
                'url': option_data['url'],
                'description': f'Câu hỏi {q_num} - Lựa chọn {option_key.upper()}',
            })
    
    # Lưu danh sách
    with open('hsk1bo1_images_list.json', 'w', encoding='utf-8') as f:
        json.dump(images_list, f, ensure_ascii=False, indent=2)
    
    # Tạo HTML để xem images
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>HSK1 Bộ 1 - Images để điền nội dung</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }}
        .question-group {{
            background: white;
            margin: 20px 0;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .question-header {{
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
        }}
        .image-container {{
            margin: 15px 0;
            padding: 15px;
            background: #fafafa;
            border-radius: 4px;
        }}
        .image-container img {{
            max-width: 100%;
            height: auto;
            border: 2px solid #ddd;
            border-radius: 4px;
        }}
        .image-info {{
            margin-top: 10px;
            font-size: 14px;
            color: #666;
        }}
        .url {{
            word-break: break-all;
            font-size: 12px;
            color: #999;
        }}
    </style>
</head>
<body>
    <h1>HSK1 Bộ 1 - Images để điền nội dung câu hỏi</h1>
    <p>Tổng số: {len(images_list)} image(s)</p>
    <p>Mở từng image và ghi lại nội dung câu hỏi và đáp án vào file template</p>
    <hr>
"""
    
    # Nhóm theo câu hỏi
    current_q = None
    for img_info in images_list:
        q_num = img_info['question_number']
        
        if current_q != q_num:
            if current_q is not None:
                html_content += "    </div>\n"
            html_content += f"""    <div class="question-group">
        <div class="question-header">Câu hỏi {q_num}</div>
"""
            current_q = q_num
        
        img_type = img_info['type']
        if img_type == 'question':
            html_content += f"""        <div class="image-container">
            <strong>Câu hỏi:</strong><br>
            <img src="{img_info['url']}" alt="{img_info['filename']}"><br>
            <div class="image-info">
                File: {img_info['filename']}<br>
                <span class="url">URL: {img_info['url']}</span>
            </div>
        </div>
"""
        else:
            option = img_info.get('option', '')
            html_content += f"""        <div class="image-container">
            <strong>Lựa chọn {option}:</strong><br>
            <img src="{img_info['url']}" alt="{img_info['filename']}"><br>
            <div class="image-info">
                File: {img_info['filename']}<br>
                <span class="url">URL: {img_info['url']}</span>
            </div>
        </div>
"""
    
    if current_q is not None:
        html_content += "    </div>\n"
    
    html_content += """</body>
</html>
"""
    
    # Lưu HTML
    with open('hsk1bo1_images_viewer.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print("=" * 60)
    print("Đã tạo danh sách images và HTML viewer")
    print("=" * 60)
    print(f"\n✓ Tổng số images: {len(images_list)}")
    print(f"✓ Đã lưu danh sách vào: hsk1bo1_images_list.json")
    print(f"✓ Đã tạo HTML viewer: hsk1bo1_images_viewer.html")
    
    print("\n" + "=" * 60)
    print("CÁCH SỬ DỤNG:")
    print("=" * 60)
    print("\n1. Mở file: hsk1bo1_images_viewer.html trong trình duyệt")
    print("   → Sẽ hiển thị tất cả images theo từng câu hỏi")
    
    print("\n2. Hoặc mở từng image URL trực tiếp:")
    for img_info in images_list[:5]:
        print(f"   - {img_info['description']}: {img_info['url']}")
    if len(images_list) > 5:
        print(f"   ... và {len(images_list) - 5} image(s) khác")
    
    print("\n3. Xem images và ghi lại:")
    print("   - Nội dung câu hỏi (text)")
    print("   - Nội dung các lựa chọn (A, B, C)")
    print("   - Đáp án đúng")
    
    print("\n4. Điền vào file: hsk1bo1_exam_data_template.json")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    create_images_list()

