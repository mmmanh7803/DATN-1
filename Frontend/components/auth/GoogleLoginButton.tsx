"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { authService } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  text?: string;
}

export default function GoogleLoginButton({
  onSuccess,
  onError,
  text = "Đăng nhập với Google",
}: GoogleLoginButtonProps) {
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error("Không nhận được credential từ Google");
      }

      // Gửi ID token lên backend
      await authService.googleLogin(credentialResponse.credential);
      
      onSuccess?.();
      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.error("Google login error:", error);
      
      // Xử lý các loại lỗi khác nhau
      let errorMessage = "Đăng nhập Google thất bại";
      
      if (error.code === "ERR_NETWORK" || error.message?.includes("ERR_CONNECTION_REFUSED")) {
        errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      onError?.(errorMessage);
    }
  };

  const handleGoogleError = () => {
    const errorMessage = "Đăng nhập Google thất bại";
    onError?.(errorMessage);
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        size="large"
        width="100%"
        text="continue_with"
        locale="vi"
      />
    </div>
  );
}


