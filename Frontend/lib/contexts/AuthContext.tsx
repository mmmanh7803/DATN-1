"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/lib/auth";
import { User, AuthResponse } from "@/types";

interface AuthUser extends User {
  roles: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Decode JWT token để lấy thông tin user và roles
  const decodeToken = (token: string): AuthUser | null => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      
      // Lấy roles từ token (có thể là array hoặc single string)
      let roles: string[] = [];
      if (payload.role) {
        roles = Array.isArray(payload.role) ? payload.role : [payload.role];
      }
      // Cũng check claim "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      const roleClaim = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      if (roleClaim) {
        const additionalRoles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
        roles = [...new Set([...roles, ...additionalRoles])];
      }

      return {
        id: payload.sub || payload.nameid || "",
        email: payload.email || payload.sub || "",
        userName: payload.unique_name || payload.name || payload.email,
        roles,
      };
    } catch {
      return null;
    }
  };

  // Load user từ token khi khởi tạo
  const refreshUser = () => {
    const token = authService.getToken();
    if (token && authService.isAuthenticated()) {
      const decodedUser = decodeToken(token);
      setUser(decodedUser);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    const decodedUser = decodeToken(response.token);
    
    // Merge roles từ response và decoded token
    if (decodedUser && response.user) {
      decodedUser.roles = response.user.roles || decodedUser.roles || [];
    }
    
    setUser(decodedUser);
  };

  const register = async (email: string, password: string) => {
    const response = await authService.register({ email, password });
    const decodedUser = decodeToken(response.token);
    
    if (decodedUser && response.user) {
      decodedUser.roles = response.user.roles || decodedUser.roles || [];
    }
    
    setUser(decodedUser);
  };

  const googleLogin = async (idToken: string) => {
    const response = await authService.googleLogin(idToken);
    const decodedUser = decodeToken(response.token);
    
    if (decodedUser && response.user) {
      decodedUser.roles = response.user.roles || decodedUser.roles || [];
    }
    
    setUser(decodedUser);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = !!user && authService.isAuthenticated();
  const isAdmin = isAuthenticated && user?.roles?.includes("Admin");

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        googleLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

