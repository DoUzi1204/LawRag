import React from "react";
import { Check } from "lucide-react";
import ImageAI from "../../assets/images/ImageAI.png";
import ImageLaw from "../../assets/images/imageLaw.png";
import TimeandCost from "../../assets/images/TimeandCost.png";

const Benefits = () => {
  const reasons = [
    {
      id: 1,
      title: "Nền tảng huấn luyện AI thông minh",
      items: [
        "Ứng dụng AI & Machine Learning để thấu hiểu khách hàng",
        "Xử lý ngôn ngữ mượt mà, trò chuyện tự nhiên như con người",
        "Huấn luyện dựa trên hàng trăm nghìn văn bản pháp luật, được cập nhật liên tục trong ngày",
        "Học hỏi liên tục từ các tương tác, phản hồi của người dùng và dữ liệu pháp lý mới để cải thiện phản hồi với độ chính xác cao",
      ],
      image: ImageAI,
      imageAlt: "AI Architecture",
      textPosition: "left",
    },
    {
      id: 2,
      title: "Sở hữu hệ thống tri thức pháp luật hàng đầu Việt Nam",
      items: [
        "Lượng văn bản pháp luật khổng lồ từ năm 1945 đến nay, phong phú và đa dạng các lĩnh vực",
        "Được cập nhật mới liên tục trong ngày",
        "Công nghệ số hoá, đánh chỉ mục tới từng điều, khoản",
      ],
      image: ImageLaw,
      imageAlt: "Legal Knowledge Base",
      textPosition: "right",
    },
    {
      id: 3,
      title: "Tiết kiệm thời gian và nhân lực",
      items: [
        "Giải quyết vấn đề nhanh chóng, tra cứu nhanh hơn gấp 10 lần, tạm biệt hàng giờ làm việc mệt mỏi",
        "Giải phóng nhân lực, tiết kiệm tới 60% chi phí vận hành nhân sự",
        "Có thể xử lý nhiều yêu cầu cùng một lúc một cách nhanh chóng",
      ],
      image: TimeandCost,
      imageAlt: "Time and Cost Savings",
      textPosition: "left",
    },
  ];

  const BenefitItem = ({ item }) => (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 mt-1">
        <Check className="w-5 h-5 text-red-600 font-bold" strokeWidth={3} />
      </div>
      <p className="text-gray-700 text-base leading-relaxed">{item}</p>
    </div>
  );

  const BenefitReason = ({ reason }) => {
    const textContent = (
      <div className="flex flex-col justify-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-8">
          {reason.title}
        </h3>
        <div className="space-y-6">
          {reason.items.map((item, index) => (
            <BenefitItem key={index} item={item} />
          ))}
        </div>
      </div>
    );

    const imageContent = (
      <div className="flex items-center justify-center">
        <img
          src={reason.image}
          alt={reason.imageAlt}
          className="w-full h-auto rounded-2xl object-cover"
        />
      </div>
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {reason.textPosition === "left" ? (
          <>
            {textContent}
            {imageContent}
          </>
        ) : (
          <>
            {imageContent}
            {textContent}
          </>
        )}
      </div>
    );
  };

  return (
    <section className="w-full py-20 bg-white">
      <div className="page-container">
        {/* Tiêu đề */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900">
            Lý Do Nên Chọn{" "}
            <span className="text-blue-600">Đô Đô Giao Thông</span>
          </h2>
        </div>

        {/* Benefits List */}
        <div className="space-y-20">
          {reasons.map((reason) => (
            <BenefitReason key={reason.id} reason={reason} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
