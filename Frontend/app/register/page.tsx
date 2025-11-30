"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/auth";
import { RegisterRequest } from "@/types";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import ErrorAlert from "@/components/common/ErrorAlert";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterRequest>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      errors.password = "Mật khẩu là bắt buộc";
    } else {
      const passwordErrors: string[] = [];
      if (formData.password.length < 6) {
        passwordErrors.push("ít nhất 6 ký tự");
      }
      if (!/[a-z]/.test(formData.password)) {
        passwordErrors.push("chữ thường");
      }
      if (!/[A-Z]/.test(formData.password)) {
        passwordErrors.push("chữ hoa");
      }
      if (!/[0-9]/.test(formData.password)) {
        passwordErrors.push("số");
      }
      if (passwordErrors.length > 0) {
        errors.password = `Mật khẩu phải có ${passwordErrors.join(", ")}`;
      }
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate form trước khi submit
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      console.log("Form validation failed:", errors);
      return;
    }
    
    // Clear validation errors nếu form hợp lệ
    setValidationErrors({});

    setLoading(true);

    try {
      console.log("Submitting registration:", { 
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      const result = await authService.register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      console.log("Registration successful:", result);
      
      // Redirect to home page after successful registration
      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error("Registration error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
      });
      
      const errorMessage = err.message || "Đăng ký thất bại. Vui lòng thử lại.";
      
      // Xử lý lỗi từ backend response
      const backendErrors: Record<string, string> = {};
      
      // Kiểm tra nếu có fieldErrors từ backend
      if (err.response?.data?.fieldErrors) {
        const fieldErrors = err.response.data.fieldErrors;
        if (fieldErrors.password && Array.isArray(fieldErrors.password) && fieldErrors.password.length > 0) {
          backendErrors.password = fieldErrors.password.join(". ");
        }
        if (fieldErrors.email && Array.isArray(fieldErrors.email) && fieldErrors.email.length > 0) {
          backendErrors.email = fieldErrors.email.join(". ");
        }
      }
      
      // Nếu có errors array từ backend
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        err.response.data.errors.forEach((error: string) => {
          if (error.toLowerCase().includes("email")) {
            backendErrors.email = error;
          } else if (error.toLowerCase().includes("password") || error.toLowerCase().includes("mật khẩu")) {
            backendErrors.password = error;
          }
        });
      }
      
      // Parse error message nếu có format "Field: Message"
      if (err.message && err.message.includes(":") && Object.keys(backendErrors).length === 0) {
        const parts = err.message.split(":");
        if (parts.length >= 2) {
          const field = parts[0].toLowerCase().trim();
          const message = parts.slice(1).join(":").trim();
          
          if (field.includes("email")) {
            backendErrors.email = message;
          } else if (field.includes("password") || field.includes("mật khẩu")) {
            backendErrors.password = message;
          }
        }
      }
      
      // Set validation errors nếu có
      if (Object.keys(backendErrors).length > 0) {
        setValidationErrors(backendErrors);
        // Hiển thị message chung nếu không có field errors cụ thể
        setError("Vui lòng kiểm tra các thông tin đã nhập");
      } else {
        // Nếu không có field errors, hiển thị message chung
        setError(errorMessage);
        setValidationErrors({});
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Update form data và validation errors cùng lúc
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };
      
      // Xóa lỗi của field đang thay đổi và kiểm tra lại match cho password fields
      setValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        
        // Xóa lỗi của field đang thay đổi
        delete newErrors[name];
        
        // Nếu đang thay đổi password hoặc confirmPassword, kiểm tra lại match
        if (name === "password" || name === "confirmPassword") {
          // Tính giá trị mới cho cả hai field
          const updatedPassword = name === "password" ? value : prev.password;
          const updatedConfirmPassword = name === "confirmPassword" ? value : prev.confirmPassword;         
          // Nếu cả hai field đều có giá trị và khớp nhau, xóa lỗi confirmPassword
          if (updatedPassword && updatedConfirmPassword) {
            if (updatedPassword === updatedConfirmPassword) {
              delete newErrors.confirmPassword;
            }
          }
        }
        
        return newErrors;
      });
      
      return newData;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              汉语
            </div>
            <span className="text-3xl font-bold text-gray-800">HiHSK</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đăng ký
            </h1>
            <p className="text-gray-600">
              Tạo tài khoản mới để bắt đầu học tiếng Trung
            </p>
          </div>

          {error && (
            <ErrorAlert
              message={error}
              onClose={() => setError("")}
            />
          )}

          {/* Google Sign Up Button */}
          <div className="mb-6">
            <GoogleLoginButton
              text="Đăng ký với Google"
              onSuccess={() => {
                // Success handled in component
              }}
              onError={(err) => setError(err)}
            />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Hoặc đăng ký bằng email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                validationErrors.email
                  ? "border-red-300"
                  : "border-gray-300"
              }`}
              placeholder="your.email@example.com"
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                validationErrors.password
                  ? "border-red-300"
                  : "border-gray-300"
              }`}
              placeholder="Có chữ hoa, chữ thường và số"
            />
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Mật khẩu phải có: chữ hoa, chữ thường, số và tối thiểu 6 ký tự
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                validationErrors.confirmPassword
                  ? "border-red-300"
                  : "border-gray-300"
              }`}
              placeholder="Nhập lại mật khẩu"
            />
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay về trang chủ
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}

