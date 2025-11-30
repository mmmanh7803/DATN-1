"use client";

import Link from "next/link";
import { authService } from "@/lib/auth";
import { useState, useEffect } from "react";
import UserProfileBar from "./UserProfileBar";

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              汉语
            </div>
            <span className="text-xl font-bold text-dark">HiHSK</span>
          </Link>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary transition font-medium"
            >
              Trang chủ
            </Link>
            <Link
              href="/courses"
              className="text-gray-700 hover:text-primary transition font-medium"
            >
              Giáo trình HSK
            </Link>
            <Link
              href="/vocabulary"
              className="text-gray-700 hover:text-primary transition font-medium"
            >
              Từ vựng
            </Link>
            <Link
              href="/practice"
              className="text-gray-700 hover:text-primary transition font-medium"
            >
              Luyện tập
            </Link>
            <Link
              href="/tests"
              className="text-gray-700 hover:text-primary transition font-medium"
            >
              Đề thi thử
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <UserProfileBar />
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-primary transition font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-md"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-primary transition font-medium px-2 py-1"
              >
                Trang chủ
              </Link>
              <Link
                href="/courses"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-primary transition font-medium px-2 py-1"
              >
                Giáo trình HSK
              </Link>
              <Link
                href="/vocabulary"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-primary transition font-medium px-2 py-1"
              >
                Từ vựng
              </Link>
              <Link
                href="/practice"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-primary transition font-medium px-2 py-1"
              >
                Luyện tập
              </Link>
              <Link
                href="/tests"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-primary transition font-medium px-2 py-1"
              >
                Đề thi thử
              </Link>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-gray-700 hover:text-primary transition font-medium px-2 py-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-gray-700 hover:text-primary transition font-medium px-2 py-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Hồ sơ cá nhân
                    </Link>
                    <Link
                      href="/vocabulary/review"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-gray-700 hover:text-primary transition font-medium px-2 py-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Ôn tập từ vựng
                    </Link>
                    <button
                      onClick={() => {
                        authService.logout();
                        setIsAuthenticated(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 text-left bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-gray-700 hover:text-primary transition font-medium px-2 py-1"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-md"
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

