import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CalendarCheck,
  Stethoscope,
  Syringe,
  Receipt,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
} from "lucide-react"

const stats = [
  { label: "Ca khám hôm nay", value: "12", change: "+3", icon: Stethoscope, color: "text-primary" },
  { label: "Ca tiêm hôm nay", value: "8", change: "+2", icon: Syringe, color: "text-chart-2" },
  { label: "Hóa đơn hôm nay", value: "24", change: "+5", icon: Receipt, color: "text-chart-3" },
  { label: "Khách mới tháng này", value: "156", change: "+12%", icon: Users, color: "text-chart-4" },
]

const queue = [
  { id: 1, order: 1, time: "09:00", customer: "Nguyễn Văn A", pet: "Mochi", service: "Khám bệnh", status: "waiting" },
  { id: 2, order: 2, time: "09:30", customer: "Trần Thị B", pet: "Luna", service: "Tiêm phòng", status: "waiting" },
  { id: 3, order: 3, time: "10:00", customer: "Lê Văn C", pet: "Buddy", service: "Khám bệnh", status: "booked" },
]

const alerts = [
  { id: 1, type: "warning", message: "5 sản phẩm dưới mức tồn kho an toàn" },
  { id: 2, type: "warning", message: "3 lô vắc-xin sắp hết hạn trong 30 ngày" },
  { id: 3, type: "info", message: "2 lịch hẹn chờ xác nhận" },
]

export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Tổng quan hoạt động chi nhánh hôm nay</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/staff/reception">Tiếp nhận khách</Link>
          </Button>
          <Button asChild>
            <Link href="/staff/pos">Tạo hóa đơn</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm">
                <TrendingUp className="w-4 h-4 text-chart-2" />
                <span className="text-chart-2 font-medium">{stat.change}</span>
                <span className="text-muted-foreground">so với hôm qua</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Queue */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Hàng đợi khám
              </CardTitle>
              <CardDescription>Danh sách khách hàng đang chờ</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link href="/staff/reception">
                Xem tất cả
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {queue.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {item.order}
                    </div>
                    <div>
                      <p className="font-medium">{item.customer}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.pet} • {item.service}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{item.time}</span>
                    <Badge variant={item.status === "waiting" ? "default" : "secondary"}>
                      {item.status === "waiting" ? "Đang chờ" : "Đã đặt"}
                    </Badge>
                    <Button size="sm">Check-in</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Cảnh báo
            </CardTitle>
            <CardDescription>Các vấn đề cần chú ý</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === "warning" ? "border-l-accent bg-accent/10" : "border-l-primary bg-primary/5"
                  }`}
                >
                  <p className="text-sm">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <CardDescription>Truy cập nhanh các chức năng thường dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent" asChild>
              <Link href="/staff/reception">
                <CalendarCheck className="w-6 h-6" />
                <span>Tiếp nhận khách</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent" asChild>
              <Link href="/staff/examination">
                <Stethoscope className="w-6 h-6" />
                <span>Bắt đầu khám</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent" asChild>
              <Link href="/staff/vaccination">
                <Syringe className="w-6 h-6" />
                <span>Thực hiện tiêm</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent" asChild>
              <Link href="/staff/pos">
                <Receipt className="w-6 h-6" />
                <span>Tạo hóa đơn</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
