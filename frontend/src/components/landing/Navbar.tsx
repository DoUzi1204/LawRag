import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Nếu ở đầu trang, luôn hiển thị navbar
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scroll xuống - ẩn navbar
        setIsVisible(false);
      } else {
        // Scroll lên - hiệnnavbar
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogoClick = () => {
    window.location.reload();
  };

  const handleScrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="page-container h-16 flex items-center justify-between relative">
        {/* Tên trang web bên trái */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 text-2xl font-bold text-blue-700 whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity duration-200"
        >
          <div className="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          Đô Đô Giao Thông
        </button>

        {/* Các nút điều hướng ở giữa */}
        <ul className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8 list-none m-0 p-0">
          <li>
            <a
              href="#hero-section"
              onClick={(e) => handleScrollToSection(e, "hero-section")}
              className="text-gray-600 text-base font-medium hover:text-blue-700 transition-colors duration-200 cursor-pointer"
            >
              Trang chủ
            </a>
          </li>
          <li>
            <a
              href="#features-section"
              onClick={(e) => handleScrollToSection(e, "features-section")}
              className="text-gray-600 text-base font-medium hover:text-blue-700 transition-colors duration-200 cursor-pointer"
            >
              Tính năng
            </a>
          </li>
          <li>
            <a
              href="#news"
              className="text-gray-600 text-base font-medium hover:text-blue-700 transition-colors duration-200"
            >
              Tin tức
            </a>
          </li>
          <li>
            <a
              href="#tutorial"
              className="text-gray-600 text-base font-medium hover:text-blue-700 transition-colors duration-200"
            >
              Video hướng dẫn
            </a>
          </li>
          <li>
            <a
              href="#footer-section"
              onClick={(e) => handleScrollToSection(e, "footer-section")}
              className="text-gray-600 text-base font-medium hover:text-blue-700 transition-colors duration-200 cursor-pointer"
            >
              Liên hệ
            </a>
          </li>
        </ul>

        {/* Nút Đăng ký và Đăng nhập bên phải */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 rounded-md border border-blue-700 text-blue-700 text-base font-medium bg-transparent hover:bg-blue-50 transition-colors duration-200"
          >
            Đăng ký
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-md bg-blue-700 text-white text-base font-medium hover:bg-blue-800 transition-colors duration-200"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
