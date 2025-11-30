import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/providers/ClientProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HiHSK - Học tiếng Trung online miễn phí | Luyện thi HSK 1-6",
  description: "Nền tảng học tiếng Trung trực tuyến miễn phí, luyện thi HSK hiệu quả từ cấp độ 1 đến 6 với Flashcard, Quiz và các công cụ học tập thông minh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

