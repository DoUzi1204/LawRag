import React from "react";
import { MessageSquare, AlertCircle, FileText, Clock } from "lucide-react";

interface Feature {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureSection: React.FC = () => {
  const features: Feature[] = [
    {
      id: 1,
      icon: <MessageSquare className="w-12 h-12 text-blue-600" />,
      title: "Hỏi đáp luật giao thông bằng AI",
      description:
        "Người dùng có thể đặt câu hỏi tự nhiên về luật giao thông đường bộ và nhận câu trả lời nhanh chóng từ chatbot AI.",
    },
    {
      id: 2,
      icon: <AlertCircle className="w-12 h-12 text-blue-600" />,
      title: "Tra cứu lỗi vi phạm và mức phạt",
      description:
        "Hệ thống cung cấp thông tin chi tiết về các lỗi vi phạm giao thông và mức xử phạt tương ứng dựa trên các quy định pháp luật hiện hành.",
    },
    {
      id: 3,
      icon: <FileText className="w-12 h-12 text-blue-600" />,
      title: "Thông tin dựa trên văn bản pháp luật",
      description:
        "Chatbot sử dụng dữ liệu từ các văn bản pháp luật về giao thông đường bộ để đảm bảo câu trả lời chính xác và đáng tin cậy.",
    },
    {
      id: 4,
      icon: <Clock className="w-12 h-12 text-blue-600" />,
      title: "Trả lời nhanh chóng 24/7",
      description:
        "Người dùng có thể tra cứu thông tin về luật giao thông bất cứ lúc nào mà không cần tìm kiếm thủ công trong các tài liệu pháp luật.",
    },
  ];

  return (
    <section className="w-full py-20 bg-gray-50">
      <div className="page-container">
        {/* Tiêu đề */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="text-blue-600">Đô Đô Giao Thông</span> Có Thể Giúp
            Gì Cho Bạn?
          </h2>
        </div>

        {/* Grid 4 features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="relative bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center group"
            >
              {/* Icon container */}
              <div className="mb-6 p-4 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors duration-300">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-base leading-relaxed">
                {feature.description}
              </p>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-lg" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
