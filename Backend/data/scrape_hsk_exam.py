"""
Script để cào dữ liệu từ trang thi thử HSK
URL: https://hihsk.com/exam/hsk1/test/343?isListen=true&isRead=true
"""

import json
import requests
import time
import sys
import io
import re
from typing import Dict, List, Optional
from urllib.parse import urlparse, parse_qs

# Fix encoding cho Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Headers để giả lập trình duyệt
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}

def fetch_page(url: str) -> Optional[str]:
    """Fetch HTML content từ URL"""
    try:
        print(f"Đang tải trang: {url}")
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        response.encoding = 'utf-8'
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"Lỗi khi tải trang: {e}")
        return None

def extract_json_data(html: str) -> Optional[Dict]:
    """Tìm và extract JSON data từ HTML (thường trong script tags)"""
    # Tìm script tag với id="__NUXT_DATA__"
    nuxt_data_match = re.search(r'<script[^>]*id="__NUXT_DATA__"[^>]*>(.+?)</script>', html, re.DOTALL)
    if nuxt_data_match:
        try:
            # Nuxt data thường là một mảng JSON
            data_str = nuxt_data_match.group(1)
            data = json.loads(data_str)
            return {'nuxt_data': data}
        except json.JSONDecodeError as e:
            print(f"Lỗi parse Nuxt data: {e}")
    
    # Tìm window.__NUXT__
    nuxt_match = re.search(r'window\.__NUXT__\s*=\s*({.+?});', html, re.DOTALL)
    if nuxt_match:
        try:
            data = json.loads(nuxt_match.group(1))
            return {'nuxt_config': data}
        except json.JSONDecodeError:
            pass
    
    # Tìm các pattern JSON phổ biến khác
    patterns = [
        r'window\.__INITIAL_STATE__\s*=\s*({.+?});',
        r'window\.__NEXT_DATA__\s*=\s*({.+?})',
        r'var\s+examData\s*=\s*({.+?});',
        r'const\s+examData\s*=\s*({.+?});',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, html, re.DOTALL)
        for match in matches:
            try:
                data = json.loads(match)
                return data
            except json.JSONDecodeError:
                continue
    
    return None

def parse_questions_from_html(html: str) -> Dict:
    """Parse câu hỏi từ HTML"""
    from bs4 import BeautifulSoup
    
    soup = BeautifulSoup(html, 'html.parser')
    result = {
        'listen_questions': [],
        'read_questions': [],
        'metadata': {}
    }
    
    # Tìm thông tin metadata
    title = soup.find('title')
    if title:
        result['metadata']['title'] = title.get_text().strip()
    
    # Tìm timer
    timer = soup.find(string=re.compile(r'\d+:\d+'))
    if timer:
        result['metadata']['timer'] = timer.strip()
    
    # Tìm số lượng câu hỏi
    listen_count = soup.find(string=re.compile(r'Nghe\s+\d+/\d+'))
    read_count = soup.find(string=re.compile(r'Đọc\s+\d+/\d+'))
    
    if listen_count:
        result['metadata']['listen_count'] = listen_count.strip()
    if read_count:
        result['metadata']['read_count'] = read_count.strip()
    
    # Tìm danh sách câu hỏi (có thể trong các div, ul, hoặc script)
    question_containers = soup.find_all(['div', 'ul', 'section'], class_=re.compile(r'question|exam|test', re.I))
    
    for container in question_containers:
        # Logic để parse câu hỏi từ container
        # (Cần điều chỉnh dựa trên cấu trúc HTML thực tế)
        pass
    
    return result

def check_api_endpoints(base_url: str) -> List[str]:
    """Kiểm tra các API endpoints có thể có"""
    parsed = urlparse(base_url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    
    # Từ HTML, tôi thấy API endpoint là: https://api.hihsk.com/api/exam/hsk/1/343
    api_base = "https://api.hihsk.com/api"
    
    # Các endpoint có thể có
    possible_endpoints = [
        f"{api_base}/exam/hsk/1/343",
        f"{api_base}/exam/hsk1/test/343",
        f"{base}/api/exam/343",
        f"{base}/api/exam/hsk1/test/343",
        f"{base}/api/exams/343",
        f"{base}/api/test/343",
    ]
    
    return possible_endpoints

def fetch_api_data(endpoint: str) -> Optional[Dict]:
    """Thử fetch dữ liệu từ API endpoint"""
    try:
        print(f"Đang thử API: {endpoint}")
        response = requests.get(endpoint, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            try:
                return response.json()
            except json.JSONDecodeError:
                return {'html': response.text}
    except requests.exceptions.RequestException:
        pass
    return None

def main():
    url = "https://hihsk.com/exam/hsk1/test/343?isListen=true&isRead=true"
    
    print("=" * 60)
    print("Script cào dữ liệu từ trang thi thử HSK")
    print("=" * 60)
    
    # Bước 1: Fetch HTML
    html = fetch_page(url)
    if not html:
        print("Không thể tải trang. Có thể trang cần đăng nhập hoặc có bảo vệ.")
        return
    
    # Lưu HTML raw
    with open('hsk_exam_raw.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("✓ Đã lưu HTML raw vào: hsk_exam_raw.html")
    
    # Bước 2: Tìm JSON data trong HTML
    json_data = extract_json_data(html)
    if json_data:
        with open('hsk_exam_data.json', 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        print("✓ Đã tìm thấy và lưu JSON data vào: hsk_exam_data.json")
    
    # Bước 3: Parse HTML với BeautifulSoup
    try:
        from bs4 import BeautifulSoup
        parsed_data = parse_questions_from_html(html)
        
        with open('hsk_exam_parsed.json', 'w', encoding='utf-8') as f:
            json.dump(parsed_data, f, ensure_ascii=False, indent=2)
        print("✓ Đã parse và lưu dữ liệu vào: hsk_exam_parsed.json")
    except ImportError:
        print("⚠ BeautifulSoup chưa được cài đặt. Chạy: pip install beautifulsoup4")
    except Exception as e:
        print(f"⚠ Lỗi khi parse HTML: {e}")
    
    # Bước 4: Thử các API endpoints
    print("\nĐang kiểm tra các API endpoints...")
    api_endpoints = check_api_endpoints(url)
    for endpoint in api_endpoints:
        api_data = fetch_api_data(endpoint)
        if api_data:
            filename = f"hsk_exam_api_{endpoint.split('/')[-1]}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(api_data, f, ensure_ascii=False, indent=2)
            print(f"✓ Đã lưu dữ liệu API vào: {filename}")
            break
    
    print("\n" + "=" * 60)
    print("Hoàn thành! Vui lòng kiểm tra các file JSON đã tạo.")
    print("=" * 60)

if __name__ == "__main__":
    main()

