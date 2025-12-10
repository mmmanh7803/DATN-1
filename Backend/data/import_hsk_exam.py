"""
Script import dữ liệu đề thi HSK từ JSON vào database
Sử dụng API để tạo ExamPaper, Questions và Options
"""

import json
import requests
import time
from typing import Dict, List, Optional

# Cấu hình
API_BASE_URL = "http://localhost:5075/api"
ADMIN_EMAIL = "admin@hihsk.com"
ADMIN_PASSWORD = "Admin@123"

class HSKExamImporter:
    def __init__(self, base_url: str = API_BASE_URL):
        self.base_url = base_url
        self.token = None
        self.headers = {}
        
    def login_admin(self, email: str, password: str) -> bool:
        """Đăng nhập admin để lấy token"""
        try:
            print(f"🔐 Đăng nhập với tài khoản: {email}")
            response = requests.post(
                f"{self.base_url}/auth/login",
                json={"email": email, "password": password}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("token")
                self.headers = {
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json"
                }
                print("✅ Đăng nhập thành công!")
                return True
            else:
                print(f"❌ Đăng nhập thất bại: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Lỗi khi đăng nhập: {e}")
            return False
    
    def create_exam_paper(self, exam_data: Dict) -> Optional[int]:
        """Tạo đề thi mới"""
        try:
            print(f"\n📝 Tạo đề thi: {exam_data['title']}")
            response = requests.post(
                f"{self.base_url}/exampapers",
                headers=self.headers,
                json={
                    "title": exam_data["title"],
                    "examType": exam_data["examType"],
                    "level": exam_data.get("level"),
                    "description": exam_data.get("description"),
                    "durationMinutes": exam_data["durationMinutes"],
                    "totalQuestions": exam_data["totalQuestions"],
                    "totalPoints": exam_data["totalPoints"],
                    "passingScore": exam_data["passingScore"]
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                exam_id = result["data"]["id"]
                print(f"✅ Tạo đề thi thành công! ID: {exam_id}")
                return exam_id
            else:
                print(f"❌ Tạo đề thi thất bại: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Lỗi khi tạo đề thi: {e}")
            return None
    
    def create_question(self, question_data: Dict) -> Optional[int]:
        """Tạo câu hỏi mới"""
        try:
            # Tạo question qua Admin controller
            response = requests.post(
                f"{self.base_url}/admin/create-quiz",
                headers=self.headers,
                json={
                    "lessonId": None,
                    "questionType": question_data["questionType"],
                    "questionText": question_data["questionText"],
                    "audioUrl": question_data.get("audioUrl"),
                    "points": question_data["points"],
                    "difficultyLevel": question_data["difficultyLevel"],
                    "explanation": question_data.get("explanation"),
                    "options": question_data["options"]
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                question_id = result["data"]["questionId"]
                return question_id
            else:
                print(f"⚠️ Tạo câu hỏi thất bại: {response.text}")
                return None
        except Exception as e:
            print(f"⚠️ Lỗi khi tạo câu hỏi: {e}")
            return None
    
    def add_question_to_exam(self, exam_id: int, question_id: int, order: int) -> bool:
        """Thêm câu hỏi vào đề thi"""
        try:
            response = requests.post(
                f"{self.base_url}/exampapers/{exam_id}/questions",
                headers=self.headers,
                json={
                    "questionId": question_id,
                    "questionOrder": order
                }
            )
            
            return response.status_code == 200
        except Exception as e:
            print(f"⚠️ Lỗi khi thêm câu hỏi vào đề thi: {e}")
            return False
    
    def import_exam_from_json(self, json_file: str) -> bool:
        """Import đề thi từ file JSON"""
        try:
            print(f"\n📂 Đọc file: {json_file}")
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # 1. Tạo ExamPaper
            exam_id = self.create_exam_paper(data["exam"])
            if not exam_id:
                return False
            
            # 2. Tạo các câu hỏi và thêm vào đề thi
            total_questions = 0
            created_questions = 0
            
            for section in data["sections"]:
                print(f"\n📚 Xử lý phần: {section['sectionName']}")
                
                for part in section["parts"]:
                    print(f"  📖 Part {part['partNumber']}: {part['partName']}")
                    
                    for question in part["questions"]:
                        total_questions += 1
                        
                        # Tạo question
                        question_data = {
                            "questionType": question["questionType"],
                            "questionText": question["questionText"],
                            "audioUrl": question.get("audioUrl"),
                            "points": question["points"],
                            "difficultyLevel": question["difficultyLevel"],
                            "explanation": question.get("explanation"),
                            "options": [
                                {
                                    "optionLabel": opt["optionLabel"],
                                    "optionText": opt["optionText"],
                                    "isCorrect": opt["isCorrect"],
                                    "explanation": opt.get("explanation")
                                }
                                for opt in question["options"]
                            ]
                        }
                        
                        question_id = self.create_question(question_data)
                        
                        if question_id:
                            # Thêm vào đề thi
                            if self.add_question_to_exam(exam_id, question_id, question["questionOrder"]):
                                created_questions += 1
                                print(f"    ✅ Câu {question['questionOrder']}")
                            else:
                                print(f"    ⚠️ Không thể thêm câu {question['questionOrder']} vào đề thi")
                        else:
                            print(f"    ❌ Không thể tạo câu {question['questionOrder']}")
                        
                        # Delay nhỏ để tránh quá tải
                        time.sleep(0.1)
            
            # Tổng kết
            print(f"\n" + "="*60)
            print(f"🎉 HOÀN THÀNH!")
            print(f"📊 Thống kê:")
            print(f"   - Đề thi ID: {exam_id}")
            print(f"   - Tổng câu hỏi: {total_questions}")
            print(f"   - Đã tạo thành công: {created_questions}")
            print(f"   - Thất bại: {total_questions - created_questions}")
            print("="*60)
            
            return created_questions > 0
            
        except Exception as e:
            print(f"❌ Lỗi khi import: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def import_multiple_exams(self, json_files: List[str]) -> None:
        """Import nhiều đề thi"""
        print("\n" + "="*60)
        print("🚀 BẮT ĐẦU IMPORT ĐỀ THI HSK")
        print("="*60)
        
        success_count = 0
        fail_count = 0
        
        for json_file in json_files:
            if self.import_exam_from_json(json_file):
                success_count += 1
            else:
                fail_count += 1
        
        print("\n" + "="*60)
        print("📊 KẾT QUẢ TỔNG THỂ:")
        print(f"   ✅ Thành công: {success_count} đề")
        print(f"   ❌ Thất bại: {fail_count} đề")
        print("="*60)


def main():
    """Hàm chính"""
    print("""
╔════════════════════════════════════════════════════════════╗
║           IMPORT ĐỀ THI HSK VÀO DATABASE                   ║
╚════════════════════════════════════════════════════════════╝
""")
    
    # Khởi tạo importer
    importer = HSKExamImporter()
    
    # Đăng nhập admin
    if not importer.login_admin(ADMIN_EMAIL, ADMIN_PASSWORD):
        print("\n❌ Không thể đăng nhập. Vui lòng kiểm tra:")
        print("   1. Backend API đang chạy (http://localhost:5075)")
        print("   2. Tài khoản admin tồn tại")
        print("   3. Mật khẩu đúng")
        return
    
    # Chọn file để import
    print("\n📁 Chọn file để import:")
    print("   1. hsk_exam_template.json (Đề mẫu)")
    print("   2. Nhập đường dẫn file khác")
    print("   3. Import tất cả file trong thư mục")
    
    choice = input("\nNhập lựa chọn (1-3): ").strip()
    
    if choice == "1":
        importer.import_exam_from_json("hsk_exam_template.json")
    elif choice == "2":
        file_path = input("Nhập đường dẫn file JSON: ").strip()
        importer.import_exam_from_json(file_path)
    elif choice == "3":
        import os
        import glob
        
        # Tìm tất cả file JSON có pattern hsk*exam*.json
        json_files = glob.glob("hsk*exam*.json")
        
        if json_files:
            print(f"\n📂 Tìm thấy {len(json_files)} file:")
            for f in json_files:
                print(f"   - {f}")
            
            confirm = input("\nXác nhận import tất cả? (y/n): ").strip().lower()
            if confirm == 'y':
                importer.import_multiple_exams(json_files)
        else:
            print("\n⚠️ Không tìm thấy file JSON nào!")
    else:
        print("❌ Lựa chọn không hợp lệ!")


if __name__ == "__main__":
    main()

