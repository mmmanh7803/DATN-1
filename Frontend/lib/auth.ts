import Cookies from "js-cookie";
import { AuthResponse, LoginRequest, RegisterRequest } from "@/types";
import apiClient from "./api";

export interface GoogleLoginRequest {
  idToken: string;
}

const AUTH_TOKEN_KEY = "authToken";
const AUTH_EXPIRATION_KEY = "authExpiration";

export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/api/auth/login", credentials);
      
      if (response.data.token) {
        // Store token in cookie
        Cookies.set(AUTH_TOKEN_KEY, response.data.token, {
          expires: new Date(response.data.expiration),
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        
        Cookies.set(AUTH_EXPIRATION_KEY, response.data.expiration, {
          expires: new Date(response.data.expiration),
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
    }
  },

  // Register
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/api/auth/register", data);
      
      if (response.data.token) {
        Cookies.set(AUTH_TOKEN_KEY, response.data.token, {
          expires: new Date(response.data.expiration),
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        
        Cookies.set(AUTH_EXPIRATION_KEY, response.data.expiration, {
          expires: new Date(response.data.expiration),
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
      }
      
      return response.data;
    } catch (error: any) {
      console.error("Register error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      
      // Lấy thông báo lỗi từ backend
      let errorMessage = "Đăng ký thất bại";
      
      // Nếu response.data là empty object, có thể là ModelState validation tự động từ [ApiController]
      if (error.response?.data && Object.keys(error.response.data).length === 0) {
        errorMessage = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại email và mật khẩu.";
      } else {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      
      // Xử lý mảng errors
      const errors = error.response?.data?.errors;
      const fieldErrors = error.response?.data?.fieldErrors;
      
      // Ưu tiên hiển thị lỗi theo field
      if (fieldErrors) {
        const errorMessages: string[] = [];
        if (fieldErrors.password && Array.isArray(fieldErrors.password) && fieldErrors.password.length > 0) {
          errorMessages.push(`Mật khẩu: ${fieldErrors.password.join(", ")}`);
        }
        if (fieldErrors.email && Array.isArray(fieldErrors.email) && fieldErrors.email.length > 0) {
          errorMessages.push(`Email: ${fieldErrors.email.join(", ")}`);
        }
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join(". ");
        }
      }
      
      if (errors && !fieldErrors) {
        if (Array.isArray(errors)) {
          // Nếu là mảng string
          if (errors.length > 0 && typeof errors[0] === "string") {
            errorMessage = errors.join(". ");
          } else {
            // Nếu là mảng object hoặc có cấu trúc khác
            const errorMessages = errors.map((e: any) => {
              if (typeof e === "string") return e;
              if (e.message) return e.message;
              if (e.Description) return e.Description;
              return JSON.stringify(e);
            }).filter(Boolean);
            if (errorMessages.length > 0) {
              errorMessage = errorMessages.join(". ");
            }
          }
        } else if (typeof errors === "object") {
          // Nếu là object (ModelState errors)
          const errorMessages: string[] = [];
          Object.keys(errors).forEach((key) => {
            const fieldError = errors[key];
            if (Array.isArray(fieldError)) {
              errorMessages.push(`${key}: ${fieldError.join(", ")}`);
            } else if (fieldError?.errors) {
              errorMessages.push(`${key}: ${fieldError.errors.map((e: any) => e.message || e).join(", ")}`);
            }
          });
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(". ");
          }
        }
      }
      
      // Nếu không có thông báo chi tiết, lấy từ status
      if (!errorMessage || errorMessage === "Đăng ký thất bại") {
        if (error.response?.status === 400) {
          errorMessage = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
        } else if (error.response?.status === 500) {
          errorMessage = "Lỗi server. Vui lòng thử lại sau.";
        } else if (!error.response) {
          errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  // Logout
  logout(): void {
    Cookies.remove(AUTH_TOKEN_KEY);
    Cookies.remove(AUTH_EXPIRATION_KEY);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  // Get token
  getToken(): string | undefined {
    return Cookies.get(AUTH_TOKEN_KEY);
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    const token = Cookies.get(AUTH_TOKEN_KEY);
    const expiration = Cookies.get(AUTH_EXPIRATION_KEY);
    
    if (!token || !expiration) {
      return false;
    }
    
    // Check if token is expired
    const expirationDate = new Date(expiration);
    if (expirationDate < new Date()) {
      this.logout();
      return false;
    }
    
    return true;
  },

  // Google Login
  async googleLogin(idToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/api/auth/google-login", {
        idToken,
      });
      
      if (response.data.token) {
        Cookies.set(AUTH_TOKEN_KEY, response.data.token, {
          expires: new Date(response.data.expiration),
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        
        Cookies.set(AUTH_EXPIRATION_KEY, response.data.expiration, {
          expires: new Date(response.data.expiration),
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
      }
      
      return response.data;
    } catch (error: any) {
      console.error("Google login error:", error);
      throw new Error(error.response?.data?.message || "Đăng nhập Google thất bại");
    }
  },

  // Get current user info from cookie/token
  getCurrentUser(): { email: string } | null {
    const token = Cookies.get(AUTH_TOKEN_KEY);
    if (!token) return null;

    try {
      // Decode JWT token (simple base64 decode, not validating)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        email: payload.email || payload.sub || "",
      };
    } catch {
      return null;
    }
  },
};

