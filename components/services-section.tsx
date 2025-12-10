import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Stethoscope, Syringe, ShoppingBag, ArrowRight } from "lucide-react"

const services = [
  {
    icon: Stethoscope,
    title: "Khám bệnh thú cưng",
    description:
      "Khám sức khỏe tổng quát, chẩn đoán và điều trị các bệnh lý thường gặp với đội ngũ bác sĩ giàu kinh nghiệm.",
    href: "/services/examination",
  },
  {
    icon: Syringe,
    title: "Tiêm phòng",
    description:
      "Chương trình tiêm phòng đầy đủ cho chó mèo với vắc-xin nhập khẩu chất lượng cao. Hỗ trợ gói tiêm ưu đãi.",
    href: "/services/vaccination",
  },
  {
    icon: ShoppingBag,
    title: "Sản phẩm thú cưng",
    description: "Đa dạng thức ăn, phụ kiện, thuốc và các sản phẩm chăm sóc thú cưng chính hãng với giá tốt nhất.",
    href: "/services/products",
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-20 lg:py-28">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Dịch vụ của chúng tôi</h2>
          <p className="text-muted-foreground text-lg">
            Cung cấp đầy đủ các dịch vụ chăm sóc sức khỏe và nhu cầu thiết yếu cho thú cưng của bạn
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card
              key={service.title}
              className="group hover:shadow-lg transition-shadow border-2 hover:border-primary/20"
            >
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  asChild
                  className="gap-2 p-0 h-auto font-semibold text-primary hover:text-primary/80"
                >
                  <Link href={service.href}>
                    Xem chi tiết
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
