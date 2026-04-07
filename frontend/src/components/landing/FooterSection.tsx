import React from "react";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from "lucide-react";

const FooterSection: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Trang chủ", href: "#home" },
    { label: "Tính năng", href: "#features" },
    { label: "Tin tức", href: "#news" },
    { label: "Video hướng dẫn", href: "#tutorial" },
  ];

  const supportLinks = [
    { label: "Trợ giúp", href: "#help" },
    { label: "Liên hệ", href: "#contact" },
    { label: "Điều khoản dịch vụ", href: "#terms" },
    { label: "Chính sách bảo mật", href: "#privacy" },
  ];

  const contactInfo = [
    {
      icon: <Phone className="w-5 h-5" />,
      label: "Hotline",
      value: "1900 xxxx",
      href: "tel:1900xxxx",
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: "Email",
      value: "support@dodogiaothong.com",
      href: "mailto:support@dodogiaothong.com",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Địa chỉ",
      value: "Hà Nội, Việt Nam",
      href: "#",
    },
  ];

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, label: "Facebook", href: "#" },
    { icon: <Twitter className="w-5 h-5" />, label: "Twitter", href: "#" },
    { icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn", href: "#" },
  ];

  return (
    <footer className="w-full bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="text-2xl font-bold text-white">
              Đô Đô Giao Thông
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Nền tảng AI thông minh giúp bạn tra cứu luật giao thông một cách
              nhanh chóng và chính xác, 24/7.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="p-2 bg-gray-800 hover:bg-blue-600 rounded-full transition-colors duration-200"
                  title={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Liên kết nhanh</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Hỗ trợ</h3>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-6">Liên hệ</h3>
            <ul className="space-y-4">
              {contactInfo.map((info, index) => (
                <li key={index}>
                  <a
                    href={info.href}
                    className="flex items-start gap-3 text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm group"
                  >
                    <span className="text-blue-600 group-hover:text-blue-400 flex-shrink-0 mt-0.5">
                      {info.icon}
                    </span>
                    <div>
                      <p className="text-gray-500 text-xs">{info.label}</p>
                      <p className="text-gray-300">{info.value}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800" />

      {/* Bottom Footer */}
      <div className="page-container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} Đô Đô Giao Thông. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a
              href="#privacy"
              className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
            >
              Chính sách bảo mật
            </a>
            <a
              href="#terms"
              className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
            >
              Điều khoản sử dụng
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
