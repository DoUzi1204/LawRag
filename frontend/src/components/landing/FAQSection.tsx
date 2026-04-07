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
      question: "Lời khuyên từ chatbot AI Luật có đáng tin cậy không?",
      answer:
        "Chatbot AI Luật vẫn đang trong giai đoạn phát triển và không ngừng cải tiến để ngày một hoàn thiện hơn. Do đó, độ tin cậy của nó cũng sẽ tăng dần theo thời gian. Người dùng hãy cần nhắc việc kiểm tra những thông tin quan trọng do chatbot AI tạo ra.",
    },
    {
      id: 1,
      question: "AI Luật có cải thiện sau khi triển khai không?",
      answer:
        "Có, AI Luật được thiết kế để học hỏi liên tục từ các tương tác với người dùng và các dữ liệu pháp luật mới nhất để cải thiện độ chính xác và chất lượng của các câu trả lời.",
    },
    {
      id: 2,
      question: "Chatbot AI Luật có tốt như luật sư con người không?",
      answer:
        "AI Luật được thiết kế để hỗ trợ người dùng tra cứu thông tin pháp luật một cách nhanh chóng. Tuy nhiên, đối với những vấn đề pháp lý phức tạp, bạn nên tham khảo ý kiến của luật sư chuyên nghiệp.",
    },
    {
      id: 3,
      question: "AI có thể kiến Luật sư thất nghiệp?",
      answer:
        "AI Luật được thiết kế để hỗ trợ và tự động hoá quá trình tra cứu pháp luật. Tuy nhiên, luật sư con người vẫn đóng vai trò quan trọng trong việc cung cấp tư vấn pháp lý chuyên sâu và xử lý các trường hợp phức tạp.",
    },
    {
      id: 4,
      question: "Lợi ích của việc sử dụng Chabot AI Luật là gì?",
      answer:
        "Những lợi ích chính bao gồm: tiết kiệm thời gian trong tra cứu pháp luật, giảm chi phí vận hành, truy cập 24/7, xử lý nhiều yêu cầu cùng một lúc, và cải thiện độ chính xác thông tin.",
    },
    {
      id: 5,
      question: "Những hạn chế của AI Luật là gì?",
      answer:
        "Những hạn chế bao gồm: AI vẫn cần sự giám sát của con người, không thể xử lý tất cả các trường hợp phức tạp, và cần được cập nhật liên tục với những luật mới.",
    },
    {
      id: 6,
      question: "AI Luật có hỗ trợ ngôn ngữ Anh không?",
      answer:
        "Hiện tại, AI Luật chủ yếu hỗ trợ ngôn ngữ Tiếng Việt. Chúng tôi đang phát triển các tính năng hỗ trợ ngôn ngữ khác trong tương lai.",
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
            Câu hỏi liên quan
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
