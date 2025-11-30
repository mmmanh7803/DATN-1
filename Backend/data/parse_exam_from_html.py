"""
Script để parse dữ liệu exam từ HTML đã lưu
Có thể dữ liệu đã được nhúng sẵn trong HTML
"""

import json
import re
import sys
import io
from bs4 import BeautifulSoup

# Fix encoding cho Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

HTML_FILE = 'hsk_exam_343.html'

def parse_html():
    """Parse HTML để tìm dữ liệu exam"""
    try:
        with open(HTML_FILE, 'r', encoding='utf-8') as f:
            html = f.read()
    except FileNotFoundError:
        print(f"❌ Không tìm thấy file {HTML_FILE}")
        return None
    
    print("=" * 60)
    print("Phân tích HTML để tìm dữ liệu exam")
    print("=" * 60)
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # Tìm các script tags
    scripts = soup.find_all('script')
    print(f"\n✓ Tìm thấy {len(scripts)} script tag(s)")
    
    # Tìm JSON data trong script tags
    json_data_found = []
    for i, script in enumerate(scripts):
        script_content = script.string or ""
        
        # Tìm window.__NUXT__
        nuxt_match = re.search(r'window\.__NUXT__\s*=\s*({.+?});', script_content, re.DOTALL)
        if nuxt_match:
            try:
                data = json.loads(nuxt_match.group(1))
                json_data_found.append(('window.__NUXT__', data))
                print(f"✓ Script {i+1}: Tìm thấy window.__NUXT__")
            except:
                pass
        
        # Tìm các pattern JSON khác
        json_patterns = [
            r'var\s+examData\s*=\s*({.+?});',
            r'const\s+examData\s*=\s*({.+?});',
            r'let\s+examData\s*=\s*({.+?});',
            r'exam.*?:\s*({.+?})',
        ]
        
        for pattern in json_patterns:
            matches = re.findall(pattern, script_content, re.DOTALL | re.IGNORECASE)
            for match in matches:
                try:
                    data = json.loads(match)
                    json_data_found.append((f'pattern_{pattern[:20]}', data))
                except:
                    pass
    
    # Tìm các element chứa exam data
    exam_elements = soup.find_all(string=re.compile(r'exam|test|343|question', re.IGNORECASE))
    print(f"✓ Tìm thấy {len(exam_elements)} element(s) chứa từ khóa exam/test")
    
    # Tìm các data attributes
    data_attrs = soup.find_all(attrs={'data-exam': True}) + \
                soup.find_all(attrs={'data-test': True}) + \
                soup.find_all(attrs={'data-question': True})
    print(f"✓ Tìm thấy {len(data_attrs)} element(s) với data attributes")
    
    # Tìm các class/id chứa exam
    exam_classes = soup.find_all(class_=re.compile(r'exam|test', re.IGNORECASE))
    exam_ids = soup.find_all(id=re.compile(r'exam|test', re.IGNORECASE))
    print(f"✓ Tìm thấy {len(exam_classes)} class và {len(exam_ids)} id liên quan")
    
    # Lưu kết quả
    result = {
        'json_data': json_data_found,
        'exam_elements_count': len(exam_elements),
        'data_attrs_count': len(data_attrs),
        'exam_classes_count': len(exam_classes),
        'exam_ids_count': len(exam_ids),
    }
    
    if json_data_found:
        print(f"\n✓ Tìm thấy {len(json_data_found)} JSON data structure(s)")
        for name, data in json_data_found:
            filename = f'exam_data_{name.replace(" ", "_")}.json'
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  ✓ Đã lưu vào: {filename}")
    
    return result

def search_for_exam_api_calls(html):
    """Tìm các API call liên quan đến exam trong HTML/JS"""
    print("\nĐang tìm API calls liên quan đến exam...")
    
    # Tìm fetch/axios calls
    patterns = [
        r'(?:fetch|axios|\$fetch)\(["\']([^"\']*api[^"\']*exam[^"\']*)["\']',
        r'(?:fetch|axios|\$fetch)\(["\']([^"\']*api[^"\']*test[^"\']*)["\']',
        r'\.get\(["\']([^"\']*api[^"\']*exam[^"\']*)["\']',
        r'\.post\(["\']([^"\']*api[^"\']*exam[^"\']*)["\']',
    ]
    
    endpoints = set()
    for pattern in patterns:
        matches = re.findall(pattern, html, re.IGNORECASE)
        for match in matches:
            if match.startswith('/'):
                match = f"https://hihsk.com{match}"
            endpoints.add(match)
    
    if endpoints:
        print(f"✓ Tìm thấy {len(endpoints)} API endpoint(s):")
        for endpoint in sorted(endpoints):
            print(f"  - {endpoint}")
        return list(endpoints)
    else:
        print("⚠ Không tìm thấy API endpoint trong HTML")
        return []

if __name__ == "__main__":
    try:
        result = parse_html()
        
        # Đọc HTML để tìm API calls
        with open(HTML_FILE, 'r', encoding='utf-8') as f:
            html = f.read()
        api_endpoints = search_for_exam_api_calls(html)
        
        print("\n" + "=" * 60)
        print("KẾT LUẬN:")
        print("=" * 60)
        if result and result.get('json_data'):
            print("✓ Tìm thấy dữ liệu JSON trong HTML")
            print("  Kiểm tra các file exam_data_*.json")
        else:
            print("⚠ Không tìm thấy dữ liệu exam trong HTML")
            print("  Dữ liệu có thể được load qua API sau khi trang load")
        
        if api_endpoints:
            print(f"\n✓ Tìm thấy {len(api_endpoints)} API endpoint(s) có thể dùng")
            print("  Cập nhật script scrape_hsk_exam_final.py với các endpoint này")
        
        print("\n💡 Gợi ý:")
        print("  - Kiểm tra Network tab > XHR/Fetch để tìm API request thực tế")
        print("  - Hoặc kiểm tra Console tab xem có lỗi API nào không")
        print("=" * 60)
        
    except ImportError:
        print("⚠ Cần cài đặt BeautifulSoup4:")
        print("  pip install beautifulsoup4")
    except Exception as e:
        print(f"❌ Lỗi: {e}")

