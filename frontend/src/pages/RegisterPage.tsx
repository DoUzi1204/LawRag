/**
 * Registration page
 */

import { useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";
import { RegisterForm } from "../components/auth/RegisterForm";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

export function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold">
            <Bot className="w-5 h-5" />
            <span>Đô Đô Giao Thông</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Tạo tài khoản mới
          </h1>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
