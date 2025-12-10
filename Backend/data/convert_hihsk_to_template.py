"""
Script chuyển đổi dữ liệu từ HiHSK API sang format template chuẩn
"""

import json
from typing import Dict, List

def analyze_hihsk_structure(json_file: str):
    """Phân tích cấu trúc JSON từ HiHSK"""
    
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("📊 PHÂN TÍCH CẤU TRÚC JSON:\n")
    
    if "exam" in data and len(data["exam"]) > 0:
        exam = data["exam"][0]
        
        print(f"📋 Thông tin đề thi:")
        print(f"   - ID: {exam.get('id')}")
        print(f"   - Tên: {exam.get('lang_vi')}")
        print(f"   - Cate ID: {exam.get('cate_id')}")
        
        # Đếm số câu hỏi trong các parts
        parts = []
        for i in range(1, 10):
            part_key = f"part{i}"
            if part_key in exam and exam[part_key]:
                parts.append({
                    "name": part_key,
                    "count": len(exam[part_key]),
                    "sample": exam[part_key][0] if exam[part_key] else None
                })
        
        print(f"\n📚 Các phần của đề thi:")
        for part in parts:
            print(f"   - {part['name']}: {part['count']} câu")
            if part['sample']:
                print(f"     → type_question: {part['sample'].get('type_question')}")
                print(f"     → has_mp3: {bool(part['sample'].get('mp3'))}")
                print(f"     → has_image: {bool(part['sample'].get('image'))}")
        
        return exam, parts
    
    return None, []


def convert_to_template_format(json_file: str, output_file: str = 'hihsk_converted.json'):
    """Chuyển đổi sang format template"""
    
    print("\n" + "="*60)
    print("🔄 CHUYỂN ĐỔI SANG FORMAT TEMPLATE")
    print("="*60 + "\n")
    
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if "exam" not in data or len(data["exam"]) == 0:
        print("❌ Không tìm thấy dữ liệu đề thi")
        return None
    
    exam = data["exam"][0]
    
    # Tạo template
    template = {
        "exam": {
            "title": f"HSK 1 - {exam.get('lang_vi', 'Đề thi')}",
            "examType": "HSK",
            "level": int(exam.get('type_hsk', 1)),
            "description": f"Đề thi HSK cấp {exam.get('type_hsk', 1)} - 2 kỹ năng",
            "durationMinutes": 40,
            "totalQuestions": 0,
            "totalPoints": 0,
            "passingScore": 60,
            "sourceId": exam.get('id')
        },
        "sections": []
    }
    
    # Xử lý các parts
    listening_questions = []
    reading_questions = []
    
    for part_num in range(1, 10):
        part_key = f"part{part_num}"
        if part_key not in exam or not exam[part_key]:
            continue
        
        part_questions = exam[part_key]
        
        for q_data in part_questions:
            question = convert_question(q_data)
            if question:
                # Phân loại Listening/Reading
                if q_data.get('mp3'):  # Có audio = Listening
                    question['questionType'] = 'LISTENING'
                    listening_questions.append(question)
                else:
                    question['questionType'] = 'READING'
                    reading_questions.append(question)
    
    # Sắp xếp theo order
    listening_questions.sort(key=lambda x: x.get('order', 0))
    reading_questions.sort(key=lambda x: x.get('order', 0))
    
    # Reset questionOrder
    for i, q in enumerate(listening_questions, 1):
        q['questionOrder'] = i
    for i, q in enumerate(reading_questions, len(listening_questions) + 1):
        q['questionOrder'] = i
    
    # Tạo sections
    if listening_questions:
        template["sections"].append({
            "sectionName": "Phần 1: Nghe (Listening)",
            "skillType": "Listening",
            "parts": [{
                "partNumber": 1,
                "partName": "Bài nghe",
                "questionCount": len(listening_questions),
                "questions": listening_questions
            }]
        })
    
    if reading_questions:
        template["sections"].append({
            "sectionName": "Phần 2: Đọc (Reading)",
            "skillType": "Reading",
            "parts": [{
                "partNumber": 1,
                "partName": "Bài đọc",
                "questionCount": len(reading_questions),
                "questions": reading_questions
            }]
        })
    
    # Cập nhật tổng số câu
    template["exam"]["totalQuestions"] = len(listening_questions) + len(reading_questions)
    template["exam"]["totalPoints"] = template["exam"]["totalQuestions"]
    
    # Lưu file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(template, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Đã chuyển đổi thành công!")
    print(f"📊 Thống kê:")
    print(f"   - Listening: {len(listening_questions)} câu")
    print(f"   - Reading: {len(reading_questions)} câu")
    print(f"   - Tổng: {template['exam']['totalQuestions']} câu")
    print(f"\n💾 Đã lưu vào: {output_file}")
    
    return template


def convert_question(q_data: Dict) -> Dict:
    """Chuyển đổi một câu hỏi"""
    
    # Base URL cho audio và images
    audio_base = "https://api.hihsk.com/storage/mp3/"
    image_base = "https://api.hihsk.com/storage/images/"
    
    question = {
        "questionOrder": q_data.get('order', 0),
        "questionType": "READING",
        "questionText": q_data.get('explain', ''),
        "points": 1,
        "difficultyLevel": int(q_data.get('type_hsk', 1)),
        "order": q_data.get('order', 0),
        "sourceId": q_data.get('id'),
        "options": []
    }
    
    # Thêm audio URL
    if q_data.get('mp3'):
        question['audioUrl'] = f"{audio_base}{q_data['mp3']}"
        question['audioScript'] = q_data.get('explain', '')
    
    # Thêm image URL
    if q_data.get('image'):
        question['imageUrl'] = f"{image_base}{q_data['image']}"
    
    # Thêm dịch tiếng Việt
    if q_data.get('translate_vi'):
        question['translation'] = q_data['translate_vi']
    
    # Parse options dựa vào answer
    answer = q_data.get('answer', '')
    type_question = q_data.get('type_question', '')
    
    # Type 1: Đúng/Sai
    if type_question == "1":
        question['options'] = [
            {
                "optionLabel": "Đúng",
                "optionText": "Đúng",
                "isCorrect": answer == "Đ"
            },
            {
                "optionLabel": "Sai",
                "optionText": "Sai",
                "isCorrect": answer == "S"
            }
        ]
    
    # Type 7, 8: Multiple choice A/B/C/D
    else:
        # Parse từ question field nếu có
        question_field = q_data.get('question', '')
        if question_field:
            try:
                question_json = json.loads(question_field)
                if 'A' in question_json:
                    question['questionText'] = question_json.get('A', '')
            except:
                pass
        
        # Parse từ text_answer hoặc các field A, B, C, D
        text_answer = q_data.get('text_answer', '')
        if text_answer:
            question['questionText'] = q_data.get('question', '') or q_data.get('explain', '')
        
        # Tạo options (cần bổ sung thủ công vì API không trả về đầy đủ)
        for label in ['A', 'B', 'C', 'D']:
            if q_data.get(label) or label == answer:
                question['options'].append({
                    "optionLabel": label,
                    "optionText": q_data.get(label, f"Option {label}"),
                    "isCorrect": label == answer
                })
    
    return question


def main():
    print("""
╔════════════════════════════════════════════════════════════╗
║       CHUYỂN ĐỔI DỮ LIỆU HIHSK SANG FORMAT TEMPLATE       ║
╚════════════════════════════════════════════════════════════╝
""")
    
    json_file = 'hihsk_exam_325.json'
    
    # 1. Phân tích cấu trúc
    exam, parts = analyze_hihsk_structure(json_file)
    
    if not exam:
        print("❌ Không đọc được dữ liệu")
        return
    
    # 2. Chuyển đổi
    template = convert_to_template_format(json_file)
    
    if template:
        print("\n" + "="*60)
        print("🎉 HOÀN THÀNH CHUYỂN ĐỔI!")
        print("="*60)
        print("\n🚀 Bước tiếp theo:")
        print("   1. Kiểm tra file hihsk_converted.json")
        print("   2. Chạy: python import_hsk_exam.py")
        print("   3. Chọn file hihsk_converted.json để import")
        print("\n💡 Sau đó tạo UI Frontend!")


if __name__ == "__main__":
    main()

