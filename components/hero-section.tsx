import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, UserPlus } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 lg:py-32">
      <div className="container px-4 mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              10 chi nhánh trên toàn quốc
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Hệ thống trung tâm chăm sóc thú cưng <span className="text-primary">PetCareX</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Chăm sóc sức khỏe toàn diện cho thú cưng của bạn với đội ngũ bác sĩ thú y chuyên nghiệp, trang thiết bị
              hiện đại và dịch vụ tận tâm.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="gap-2">
                <Link href="/customer/appointments/new">
                  <Calendar className="w-5 h-5" />
                  Đặt lịch khám ngay
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2 bg-transparent">
                <Link href="/register">
                  <UserPlus className="w-5 h-5" />
                  Đăng ký hội viên
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/veterinarian-with-cute-dog-and-cat-in-modern-pet-c.jpg"
                alt="Bác sĩ thú y với thú cưng"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-4 shadow-lg border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">🏥</span>
                </div>
                <div>
                  <p className="font-semibold">50,000+</p>
                  <p className="text-sm text-muted-foreground">Lượt khám mỗi năm</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 bg-card rounded-2xl p-4 shadow-lg border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
                <div>
                  <p className="font-semibold">4.9/5</p>
                  <p className="text-sm text-muted-foreground">Đánh giá khách hàng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
