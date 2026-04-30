import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, MessageSquare, LogOut, CircleUser } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        // Scroll lên - hiện navbar
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate("/");
  };

  const handleGoToChat = () => {
    setIsDropdownOpen(false);
    navigate("/chat");
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
          Viet Law
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

        {/* Phần bên phải: hiển thị theo trạng thái đăng nhập */}
        {isAuthenticated && user ? (
          /* Đã đăng nhập: hiển thị avatar + tên người dùng */
          <div className="relative" ref={dropdownRef}>
            <button
              id="user-menu-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
            >
              {/* Avatar icon hình người */}
              <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-md">
                <CircleUser className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-700 text-sm font-medium max-w-[120px] truncate">
                {user.username}
              </span>
              <svg
                className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 10 6"
                fill="currentColor"
              >
                <path d="M5 6L0 0h10L5 6z" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Thông tin người dùng */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-md">
                      <CircleUser className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                      {user.username}
                    </p>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    id="go-to-chat-button"
                    onClick={handleGoToChat}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Trò chuyện
                  </button>
                </div>

                <div className="border-t border-gray-100">
                  <button
                    id="logout-button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Chưa đăng nhập: hiển thị nút Đăng ký và Đăng nhập */
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
        )}
      </div>
    </nav>
  );
};

export default Navbar;

