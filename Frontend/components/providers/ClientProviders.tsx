"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  if (!clientId) {
    console.warn("⚠️ NEXT_PUBLIC_GOOGLE_CLIENT_ID chưa được cấu hình. Đăng nhập Google sẽ không hoạt động.");
    console.warn("Vui lòng tạo file .env.local và thêm: NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id");
    return (
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <ToastProvider>
        <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

