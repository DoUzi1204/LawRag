import React from "react";
import bannerImage from "../../assets/images/Banner.png";
import { useAuth } from "../../contexts/AuthContext";

const HeroSection: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section
      className="relative w-full h-[80vh] bg-cover bg-center bg-no-repeat flex items-center"
      style={{ backgroundImage: `url(${bannerImage})` }}
    >
      {/* Overlay gradient: tối bên trái, trong suốt bên phải */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

      {/* Nội dung đè lên banner */}
      <div className="relative z-10 page-container flex flex-col gap-6 py-28">
        {/* Tiêu đề chính */}
        <h1 className="text-5xl font-bold text-white leading-tight max-w-2xl">
          Trợ lý pháp luật <br />
          <span className="text-blue-400">Việt Nam</span>
        </h1>

        {/* Mô tả */}
        <p className="text-gray-200 text-base leading-relaxed max-w-xl">
          Đặt câu hỏi về các quy định pháp luật Việt Nam và nhận câu trả lời
          chính xác trong vài giây. Hệ thống chatbot sử dụng AI kết hợp với dữ
          liệu pháp luật toàn diện để hỗ trợ người dùng tra cứu thông tin một
          cách nhanh chóng, dễ hiểu và đáng tin cậy.
        </p>

        {/* Nút hành động */}
        <div className="flex items-center gap-4 mt-2">
          <a
            href="/chat"
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 transition-colors duration-200 shadow-lg"
          >
            Chat ngay
          </a>
          {!isAuthenticated && (
            <a
              href="/register"
              className="px-6 py-3 rounded-lg border-2 border-white text-white font-semibold text-base hover:bg-white hover:text-blue-700 transition-colors duration-200"
            >
              Đăng ký
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
