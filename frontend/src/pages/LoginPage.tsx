/**
 * Login page - Split layout with info on left and form on right
 */

import { useNavigate, useLocation, Link } from "react-router-dom";
import { Bot, CheckCircle, Scale } from "lucide-react";
import { LoginForm } from "../components/auth/LoginForm";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || "/";
  const justRegistered = location.state?.registered === true;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex">
      {/* Bên trái - Thông tin giới thiệu */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex-col justify-center px-16 xl:px-24 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 mb-12 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-center w-11 h-11 bg-blue-600 rounded-xl">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold">Viet Law</span>
          </button>

          {/* Tiêu đề */}
          <h2 className="text-4xl font-bold leading-tight mb-8">
            AI pháp luật
          </h2>

          {/* Các điểm nổi bật */}
          <div className="space-y-5 mb-10">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-gray-300 text-base leading-relaxed">
                AI pháp luật đang giải đáp các vấn đề pháp lý cơ bản ở 37 lĩnh
                vực, với mục tiêu trở thành một Trợ lý pháp lý.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-gray-300 text-base leading-relaxed">
                Chất lượng giải đáp từ AI pháp luật đang tiếp tục được huấn
                luyện hàng ngày, sẽ ngày một hoàn thiện.
              </p>
            </div>
          </div>

          {/* Danh sách lĩnh vực */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-blue-400" />
              <p className="text-sm font-semibold text-blue-300">
                Hỗ trợ giải đáp ở 37 lĩnh vực
              </p>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Thuế, Lao động, An toàn lao động, Bảo hiểm xã hội, Bảo hiểm thất
              nghiệp, Đầu tư, Thương mại, Doanh nghiệp, Kế toán - Kiểm toán,
              Sở hữu trí tuệ, Đất đai - Nhà ở, Hôn nhân Gia đình, Dân sự,
              Hình sự, Bảo vệ môi trường, Phòng cháy chữa cháy, Tư pháp, Đấu
              thầu, Xây dựng, Tài chính ngân hàng, Bảo hiểm y tế,...
            </p>
          </div>
        </div>
      </div>

      {/* Bên phải - Form đăng nhập */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Tab navigation */}
          <div className="flex border-b border-gray-200 mb-8">
            <div className="w-1/2 py-3 text-center text-blue-600 font-semibold text-sm border-b-2 border-blue-600 cursor-default">
              ĐĂNG NHẬP
            </div>
            <Link
              to="/register"
              className="w-1/2 py-3 text-center text-gray-400 font-semibold text-sm hover:text-gray-600 transition-colors"
            >
              ĐĂNG KÝ
            </Link>
          </div>

          {/* Tiêu đề form */}
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Đăng nhập tài khoản
          </h1>

          {/* Success message after registration */}
          {justRegistered && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Tạo tài khoản thành công! Vui lòng đăng nhập.
            </div>
          )}

          {/* Login form */}
          <LoginForm onSuccess={handleSuccess} />

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-8">
            Phát triển và vận hành bởi{" "}
            <span className="font-semibold text-gray-600">
              Viet Law – Trợ lý pháp luật
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
