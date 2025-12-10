import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-dark text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Về HiHSK</h3>
            <p className="text-sm leading-relaxed">
              Nền tảng học tiếng Trung trực tuyến miễn phí, giúp bạn luyện thi
              HSK hiệu quả từ cấp độ 1 đến 6.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/courses" className="hover:text-primary transition">
                  Giáo trình HSK
                </Link>
              </li>
              <li>
                <Link href="/hsk-levels" className="hover:text-primary transition">
                  HSK 1-6
                </Link>
              </li>
              <li>
                <Link href="/practice" className="hover:text-primary transition">
                  Luyện tập
                </Link>
              </li>
              <li>
                <Link href="/exams" className="hover:text-primary transition">
                  Đề thi thử
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-primary transition">
                  Hướng dẫn
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media & App Download */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Theo dõi chúng tôi</h3>
            <div className="flex space-x-4 mb-4">
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition"
                aria-label="YouTube"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
            {/* App Store badges placeholder */}
            <div className="mt-4 text-xs text-gray-400">
              Ứng dụng di động sắp ra mắt
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>© 2024 HiHSK. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}

