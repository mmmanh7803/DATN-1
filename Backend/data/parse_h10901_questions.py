"""
Script parse câu hỏi từ tài liệu nghe H10901
Tài liệu nghe chứa script đầy đủ của đề thi
"""

import json
import re
import sys
import io

# Fix encoding cho Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def clean_cid_text(text):
    """Loại bỏ các ký tự (cid:...) và thay thế bằng ký tự tương ứng nếu có thể"""
    # Một số mapping phổ biến (có thể cần điều chỉnh)
    cid_map = {
        '(cid:708)': '一',
        '(cid:13435)': '级',
        '(cid:709)': '的',
        '(cid:271)': '【',
        '(cid:272)': '】',
        '(cid:8438)': '欢',
        '(cid:452)': '。',
        '(cid:1864)': '兴',
        '(cid:8437)': '遍',
        '(cid:991)': '下',
        '(cid:3837)': '天',
        '(cid:2530)': '前',
        '(cid:7389)': '有',
        '(cid:5192)': '年',
        '(cid:7388)': '月',
        '(cid:989)': '三',
        '(cid:990)': '上',
    }
    
    for cid, char in cid_map.items():
        text = text.replace(cid, char)
    
    # Loại bỏ các (cid:...) còn lại
    text = re.sub(r'\(cid:\d+\)', '', text)
    
    return text

def parse_listening_script(text_content):
    """Parse script nghe thành câu hỏi"""
    full_text = '\n\n'.join([item['text'] for item in text_content])
    
    # Clean CID trước
    full_text = clean_cid_text(full_text)
    
    questions = []
    
    # Phần 1: Câu 1-5 (chỉ có text, không có đáp án)
    part1_pattern = r'第一部分.*?现在开始第1题：\s*(.+?)(?=第二部分|$)'
    part1_match = re.search(part1_pattern, full_text, re.DOTALL)
    if part1_match:
        part1_text = part1_match.group(1)
        # Tìm các câu 1-5 - sử dụng cả ． và .
        for i in range(1, 6):
            pattern = rf'{i}[．\.]\s*(.+?)(?=\d+[．\.]|第二部分|$)'
            match = re.search(pattern, part1_text, re.DOTALL)
            if match:
                script = match.group(1).strip()
                # Loại bỏ các ký tự đặc biệt còn sót
                script = re.sub(r'\(cid:\d+\)', '', script).strip()
                if script:
                    questions.append({
                        'number': i,
                        'part': 1,
                        'type': 'listening_simple',
                        'script': script,
                    })
    
    # Phần 2: Câu 6-10
    part2_pattern = r'第二部分.*?现在开始第6题：\s*(.+?)(?=第[三四]部分|H10901|$)'
    part2_match = re.search(part2_pattern, full_text, re.DOTALL)
    if part2_match:
        part2_text = part2_match.group(1)
        for i in range(6, 11):
            pattern = rf'{i}[．\.]\s*(.+?)(?=\d+[．\.]|第[三四]部分|H10901|$)'
            match = re.search(pattern, part2_text, re.DOTALL)
            if match:
                script = match.group(1).strip()
                script = re.sub(r'\(cid:\d+\)', '', script).strip()
                # Loại bỏ H10901 nếu có
                script = re.sub(r'H10901.*', '', script).strip()
                if script:
                    questions.append({
                        'number': i,
                        'part': 2,
                        'type': 'listening_sentence',
                        'script': script,
                    })
    
    # Phần 3: Câu 11-15 (có hội thoại)
    part3_pattern = r'第三部分.*?现在开始第11\s*题：\s*(.+?)(?=第四部分|$)'
    part3_match = re.search(part3_pattern, full_text, re.DOTALL)
    if part3_match:
        part3_text = part3_match.group(1)
        for i in range(11, 16):
            pattern = rf'{i}[．\.]\s*(.+?)(?=\d+[．\.]|第四部分|$)'
            match = re.search(pattern, part3_text, re.DOTALL)
            if match:
                script = match.group(1).strip()
                script = re.sub(r'\(cid:\d+\)', '', script).strip()
                
                # Tách nam/nữ nếu có
                dialogue = {}
                if '男：' in script or '女：' in script:
                    male_match = re.search(r'男：(.+?)(?=女：|$)', script, re.DOTALL)
                    female_match = re.search(r'女：(.+?)(?=男：|$)', script, re.DOTALL)
                    if male_match:
                        dialogue['male'] = male_match.group(1).strip()
                    if female_match:
                        dialogue['female'] = female_match.group(1).strip()
                
                questions.append({
                    'number': i,
                    'part': 3,
                    'type': 'listening_dialogue',
                    'script': script,
                    'dialogue': dialogue if dialogue else None,
                })
    
    # Phần 4: Câu 16-20 (có câu hỏi)
    part4_pattern = r'第四部分.*?现在开始第16题：\s*(.+?)(?=听力考试现在结束|$)'
    part4_match = re.search(part4_pattern, full_text, re.DOTALL)
    if part4_match:
        part4_text = part4_match.group(1)
        for i in range(16, 21):
            # Tìm script và question riêng biệt
            pattern = rf'{i}[．\.]\s*(.+?)(?=\d+[．\.]|听力考试现在结束|$)'
            match = re.search(pattern, part4_text, re.DOTALL)
            if match:
                content = match.group(1).strip()
                content = re.sub(r'\(cid:\d+\)', '', content)
                
                # Tìm câu hỏi
                question_match = re.search(r'问：(.+?)(?=\d+[．\.]|听力考试现在结束|$)', content, re.DOTALL)
                question_text = question_match.group(1).strip() if question_match else None
                
                # Loại bỏ "问：" khỏi script
                script_clean = re.sub(r'问：.+', '', content).strip()
                script_clean = re.sub(r'H10901.*', '', script_clean).strip()
                
                if script_clean:
                    questions.append({
                        'number': i,
                        'part': 4,
                        'type': 'listening_question',
                        'script': script_clean,
                        'question': question_text,
                    })
    
    return questions

def create_exam_structure(questions):
    """Tạo cấu trúc đề thi hoàn chỉnh"""
    exam_data = {
        'exam_code': 'H10901',
        'hsk_level': 1,
        'total_questions': 20,
        'parts': {
            'part1': {
                'name': '第一部分',
                'description': '一共5个题，每题听两遍',
                'questions': [q for q in questions if q['part'] == 1],
            },
            'part2': {
                'name': '第二部分',
                'description': '一共5个题，每题听两遍',
                'questions': [q for q in questions if q['part'] == 2],
            },
            'part3': {
                'name': '第三部分',
                'description': '一共5个题，每题听两遍',
                'questions': [q for q in questions if q['part'] == 3],
            },
            'part4': {
                'name': '第四部分',
                'description': '一共5个题，每题听两遍',
                'questions': [q for q in questions if q['part'] == 4],
            },
        },
        'all_questions': questions,
    }
    
    return exam_data

def main():
    print("=" * 60)
    print("Parse câu hỏi từ tài liệu nghe H10901")
    print("=" * 60)
    
    # Đọc file text đã extract
    try:
        with open('h10901_listening_text.json', 'r', encoding='utf-8') as f:
            text_content = json.load(f)
    except FileNotFoundError:
        print("✗ Không tìm thấy file h10901_listening_text.json")
        print("  Chạy process_h10901_pdfs.py trước")
        return
    
    print(f"✓ Đã đọc {len(text_content)} trang")
    
    # Parse questions
    print("\nĐang parse câu hỏi...")
    questions = parse_listening_script(text_content)
    
    if questions:
        print(f"✓ Đã parse {len(questions)} câu hỏi")
        
        # Lưu questions
        with open('h10901_questions_parsed.json', 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        print("✓ Đã lưu vào: h10901_questions_parsed.json")
        
        # Tạo cấu trúc đề thi
        exam_structure = create_exam_structure(questions)
        with open('h10901_exam_structure.json', 'w', encoding='utf-8') as f:
            json.dump(exam_structure, f, ensure_ascii=False, indent=2)
        print("✓ Đã lưu cấu trúc đề thi vào: h10901_exam_structure.json")
        
        # Hiển thị summary
        print("\n" + "=" * 60)
        print("Tổng kết:")
        print("=" * 60)
        print(f"Tổng số câu hỏi: {len(questions)}")
        print(f"Phần 1: {len([q for q in questions if q['part'] == 1])} câu")
        print(f"Phần 2: {len([q for q in questions if q['part'] == 2])} câu")
        print(f"Phần 3: {len([q for q in questions if q['part'] == 3])} câu")
        print(f"Phần 4: {len([q for q in questions if q['part'] == 4])} câu")
        
        # Hiển thị vài câu mẫu
        print("\n" + "=" * 60)
        print("Mẫu câu hỏi:")
        print("=" * 60)
        for q in questions[:3]:
            print(f"\nCâu {q['number']} (Phần {q['part']}):")
            print(f"  Type: {q['type']}")
            print(f"  Script: {q['script'][:100]}...")
            if 'question' in q:
                print(f"  Question: {q['question']}")
    else:
        print("⚠ Không parse được câu hỏi")
        print("  Kiểm tra lại format của file")

if __name__ == "__main__":
    main()

