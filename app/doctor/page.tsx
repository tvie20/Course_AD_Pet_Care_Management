import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarCheck, Clock, Stethoscope, Syringe, AlertTriangle, ArrowRight } from "lucide-react"

const stats = [
  { label: "Lịch hẹn hôm nay", value: 12, icon: CalendarCheck },
  { label: "Đã khám", value: 5, icon: Stethoscope },
  { label: "Đang chờ", value: 4, icon: Clock },
  { label: "Lịch tiêm hôm nay", value: 3, icon: Syringe },
]

const examQueue = [
  {
    id: 1,
    time: "09:00",
    customer: "Nguyễn Văn A",
    pet: "Mochi • Chó Poodle",
    reason: "Khám lại viêm da",
    status: "waiting" as const,
  },
  {
    id: 2,
    time: "09:30",
    customer: "Trần Thị B",
    pet: "Miu • Mèo Anh lông ngắn",
    reason: "Khám tổng quát",
    status: "in-progress" as const,
  },
  {
    id: 3,
    time: "10:00",
    customer: "Lê Văn C",
    pet: "Lu • Chó Corgi",
    reason: "Tiêm vaccine 7 bệnh",
    status: "booked" as const,
  },
]

const vaccinationToday = [
  {
    id: 1,
    time: "10:30",
    pet: "Mochi",
    customer: "Nguyễn Văn A",
    vaccine: "Vaccine 7 bệnh chó",
    dose: "Mũi 2/3",
  },
  {
    id: 2,
    time: "11:00",
    pet: "Miu",
    customer: "Trần Thị B",
    vaccine: "Vaccine dại",
    dose: "Mũi 1/1",
  },
]

const notes = [
  "Ưu tiên khám các ca tái phát / bệnh mãn tính trước.",
  "Kiểm tra lịch sử dị ứng thuốc trước khi kê đơn kháng sinh.",
  "Nhắc lễ tân xác nhận lại lịch tái khám sau khi kết thúc ca.",
]

export default function DoctorDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard bác sĩ</h1>
          <p className="text-muted-foreground">
            Tổng quan lịch khám và tiêm phòng trong ngày của bạn
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button asChild>
            <Link href="/doctor/examination">Bắt đầu khám</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/doctor/vaccination">Xem lịch tiêm</Link>
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
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hàng đợi khám + lịch tiêm */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Hàng đợi khám</CardTitle>
              <CardDescription>Các ca sắp khám trong hôm nay</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link href="/doctor/examination">
                Xem chi tiết
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {examQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3 rounded-lg border bg-card/40"
                >
                  <div>
                    <p className="font-medium">{item.customer}</p>
                    <p className="text-sm text-muted-foreground">{item.pet}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-medium">{item.time}</span>
                    <Badge
                      variant={
                        item.status === "waiting"
                          ? "default"
                          : item.status === "in-progress"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {item.status === "waiting"
                        ? "Đang chờ"
                        : item.status === "in-progress"
                        ? "Đang khám"
                        : "Đã đặt"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Lịch tiêm hôm nay</CardTitle>
              <CardDescription>Các mũi vaccine trong ca trực của bạn</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link href="/doctor/vaccination">
                Quản lý tiêm phòng
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vaccinationToday.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3 rounded-lg border bg-card/40"
                >
                  <div>
                    <p className="font-medium">
                      {item.pet} • {item.customer}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.vaccine}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.dose}</p>
                  </div>
                  <span className="text-sm font-medium">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ghi chú trong ngày */}
      <Card>
        <CardHeader>
          <CardTitle>Các lưu ý trong ngày</CardTitle>
          <CardDescription>Tổng hợp nhanh những điều quan trọng cần nhớ</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {notes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
