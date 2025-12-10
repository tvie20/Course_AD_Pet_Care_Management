import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

const tiers = [
  {
    name: "Cơ bản",
    badge: "Basic",
    requirement: "Đăng ký miễn phí",
    benefits: [
      "Tích điểm 1 điểm / 50,000đ",
      "Nhận thông báo nhắc lịch tiêm",
      "Theo dõi hồ sơ thú cưng online",
      "Đặt lịch hẹn trực tuyến",
    ],
    highlight: false,
  },
  {
    name: "Thân thiết",
    badge: "Loyal",
    requirement: "Chi tiêu từ 5,000,000đ/12 tháng",
    benefits: [
      "Tất cả quyền lợi Cơ bản",
      "Ưu tiên đặt lịch bác sĩ",
    ],
    highlight: true,
  },
  {
    name: "VIP",
    badge: "VIP",
    requirement: "Chi tiêu từ 12,000,000đ/12 tháng",
    benefits: [
      "Tất cả quyền lợi Thân thiết",
      "Tư vấn riêng với bác sĩ chuyên khoa",
    ],
    highlight: false,
  },
]

export function MembershipSection() {
  return (
    <section id="membership" className="py-20 lg:py-28">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Chương trình hội viên</h2>
          <p className="text-muted-foreground text-lg">
            Giữa vô vàn lựa chọn ngoài kia, sự tin yêu của bạn dành cho Hệ thống thú y PetCareX trong suốt thời gian vừa qua là món quà tinh thần vô cùng to lớn. Chúng tôi tin rằng Chương trình Hội viên PetCareX sẽ thay lời muốn nói tri ân khách hàng đã đồng hành; mở ra cánh cửa đến một loạt cá ưu đãi và dịch vụ hấp dẫn để chăm sóc sức khỏe của thú cưng.
            <br /><br />  
            Đăng ký ngay để nhận nhiều ưu đãi hấp dẫn và chăm sóc thú cưng tốt hơn!
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative ${
                tier.highlight ? "border-primary shadow-lg scale-105" : "hover:shadow-md"
              } transition-all`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Phổ biến nhất</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <Badge variant="outline" className="w-fit mx-auto mb-2">
                  {tier.badge}
                </Badge>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription className="text-sm">{tier.requirement}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
