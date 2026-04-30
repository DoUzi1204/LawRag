import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQSection: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      id: 0,
      question: "Lời khuyên từ chatbot AI pháp luật có đáng tin cậy không?",
      answer:
        "Chatbot AI pháp luật được xây dựa trên các văn bản pháp luật chính thức của Việt Nam và đang trong quá trình cải tiến liên tục. Tuy nhiên, đối với các vấn đề quan trọng, bạn nên kiểm tra lại thông tin hoặc tư vấn với chuyên gia.",
    },
    {
      id: 1,
      question: "Chatbot có cập nhật và cải thiện thường xuyên không?",
      answer:
        "Có, hệ thống được thiết kế để học hỏi liên tục và cập nhật với những quy định pháp luật mới nhất, những thực hành tốt ưu mới của pháp luật Việt Nam.",
    },
    {
      id: 2,
      question: "Chatbot có thể thay thế luật sư chuyên nghiệp không?",
      answer:
        "Không. Chatbot được thiết kế để cung cấp thông tin pháp luật một cách nhanh chóng và cổ động hóa quá trình tra cứu. Đối với các vấn đề pháp lý phức tạp, bạn còn cần tư vấn luật sư con người.",
    },
    {
      id: 3,
      question:
        "Thông tin từ hệ thống có phù hợp với pháp luật hiện hành không?",
      answer:
        "Có. Hệ thống được xây dựa trên các văn bản pháp luật có hiệu lực pháp lý của Nhà nước Việt Nam. Tuy nhiên, do pháp luật luôn thay đổi, bạn nên đối chứng với các chuyên gia khi có câu hỏi quan trọng.",
    },
    {
      id: 4,
      question: "Lợi ích của việc sử dụng chatbot là gì?",
      answer:
        "Những lợi ích chính bao gồm: tra cứu thông tin pháp luật nhanh chóng, không cần thường xuyên tư vấn luật sư (giảm chi phí), truy cập 24/7, xử lý nhiều yêu cầu cùng lúc, và giấp cấp đối với khó khăn.",
    },
    {
      id: 5,
      question: "Có những hạn chế nào cần lưu ý không?",
      answer:
        "Có. AI vẫn cần sự giám sát của con người, không thể xử lý hết tất cả các trường hợp phức tạp, và cần được cập nhật khi có các luật mới. Quá trình tư vấn với chuyên gia vẫn rất quan trọng.",
    },
    {
      id: 6,
      question: "Có những ngôn ngữ nào được hỗ trợ?",
      answer:
        "Hiện tại, hệ thống chủ yếu hỗ trợ Tiếng Việt. Chúng tôi sẽ tiếp tục phát triển để hỗ trợ thêm các ngôn ngữ khác trong tương lai, giúp phục vụ không nhân dân rộng hơn.",
    },
  ];

  const leftColumn = faqs.slice(0, 4);
  const rightColumn = faqs.slice(4);

  const FAQItem = ({ item }: { item: FAQItem }) => (
    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-200">
      <button
        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors duration-200 text-left"
      >
        <span className="text-gray-900 font-semibold text-base">
          {item.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform duration-300 ${
            expandedId === item.id ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {expandedId === item.id && (
        <div className="px-6 py-4 border-t border-gray-200 bg-white">
          <p className="text-gray-700 text-base leading-relaxed">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <section className="w-full py-20 bg-gray-50">
      <div className="page-container">
        {/* Tiêu đề */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            Câu hỏi thường gặp
          </h2>
        </div>

        {/* FAQ Grid - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-5">
            {leftColumn.map((item) => (
              <FAQItem key={item.id} item={item} />
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {rightColumn.map((item) => (
              <FAQItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
