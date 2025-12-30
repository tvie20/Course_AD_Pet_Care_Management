"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CalendarCheck, 
  Clock, 
  Stethoscope, 
  Syringe, 
  AlertTriangle, 
  ArrowRight, 
  User,
  MoreHorizontal
} from "lucide-react"

// --- DỮ LIỆU MẪU (MOCK DATA) ---

const stats = [
  { label: "Tổng lịch hẹn", value: 12, icon: CalendarCheck, color: "text-blue-600 bg-blue-50" },
  { label: "Đã hoàn thành", value: 8, icon: Stethoscope, color: "text-emerald-600 bg-emerald-50" },
  { label: "Đang chờ khám", value: 2, icon: Clock, color: "text-orange-600 bg-orange-50" },
  { label: "Đang chờ tiêm", value: 2, icon: Syringe, color: "text-purple-600 bg-purple-50" },
]

// Dữ liệu hàng đợi KHÁM BỆNH
const examQueue = [
  {
    id: 1,
    time: "09:00",
    customer: "Nguyễn Văn A",
    pet: "Mochi",
    type: "Chó Poodle",
    reason: "Khám lại viêm da",
    status: "waiting", // Đang chờ
  },
  {
    id: 2,
    time: "09:30",
    customer: "Trần Thị B",
    pet: "Miu",
    type: "Mèo Anh lông ngắn",
    reason: "Bỏ ăn, nôn mửa",
    status: "in-progress", // Đang khám
  },
  {
    id: 3,
    time: "10:00",
    customer: "Hoàng Văn D",
    pet: "Lu",
    type: "Chó Corgi",
    reason: "Kiểm tra tai",
    status: "booked", // Đã đặt (chưa đến)
  },
]

// Dữ liệu hàng đợi TIÊM PHÒNG
const vaccineQueue = [
  {
    id: 1,
    time: "10:15",
    customer: "Phạm Thị E",
    pet: "Bông",
    type: "Mèo Ba Tư",
    vaccine: "Vaccine 4 bệnh mèo",
    status: "waiting",
  },
  {
    id: 2,
    time: "10:30",
    customer: "Lê Văn C",
    pet: "Rex",
    type: "Chó Becgie",
    vaccine: "Vaccine Dại",
    status: "waiting",
  },
]

const notes = [
  "Ưu tiên khám các ca cấp cứu hoặc thú cưng già yếu.",
  "Kiểm tra kỹ hạn sử dụng vaccine trước khi tiêm.",
  "Nhắc lễ tân xác nhận lại lịch tái khám cho ca số 2 (Miu).",
]

export default function DoctorDashboardPage() {
  
  // Hàm helper để render badge trạng thái
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">Đang chờ</Badge>
      case 'in-progress':
        return <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">Đang khám</Badge>
      case 'booked':
        return <Badge variant="outline" className="text-muted-foreground">Đã đặt</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard bác sĩ</h1>
          <p className="text-muted-foreground">
            Xin chào, BS. Nguyễn Văn A. Chúc bạn một ngày làm việc hiệu quả!
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hidden sm:flex">
             Báo cáo ngày
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
             Làm mới dữ liệu
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MAIN CONTENT: 2 CỘT TÁCH BIỆT */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* CỘT 1: HÀNG ĐỢI KHÁM BỆNH */}
        <Card className="flex flex-col h-full border-t-4 border-t-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-500" />
                Hàng đợi Khám bệnh
              </CardTitle>
              <CardDescription>Danh sách chờ khám lâm sàng</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
              <Link href="/doctor/examination">
                Vào phòng khám <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {examQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-white hover:shadow-md transition-shadow gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center justify-center min-w-[50px] bg-slate-100 rounded-md p-1">
                        <span className="text-xs text-muted-foreground font-medium">Giờ hẹn</span>
                        <span className="text-sm font-bold text-slate-900">{item.time}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">{item.pet}</span>
                        <span className="text-xs text-muted-foreground">({item.type})</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <User className="w-3 h-3" /> {item.customer}
                      </div>
                      <div className="text-sm text-slate-700 mt-1 font-medium">
                        Lý do: {item.reason}
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    {renderStatusBadge(item.status)}
                    {item.status === 'waiting' && (
                        <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50" asChild>
                            <Link href="/doctor/examination">Gọi khám</Link>
                        </Button>
                    )}
                  </div>
                </div>
              ))}
              {examQueue.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">Hiện không có ca chờ khám</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* CỘT 2: HÀNG ĐỢI TIÊM PHÒNG */}
        <Card className="flex flex-col h-full border-t-4 border-t-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-emerald-500" />
                Hàng đợi Tiêm phòng
              </CardTitle>
              <CardDescription>Danh sách chờ tiêm vaccine</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
              <Link href="/doctor/vaccination">
                Vào phòng tiêm <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {vaccineQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-white hover:shadow-md transition-shadow gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center justify-center min-w-[50px] bg-slate-100 rounded-md p-1">
                        <span className="text-xs text-muted-foreground font-medium">Giờ hẹn</span>
                        <span className="text-sm font-bold text-slate-900">{item.time}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">{item.pet}</span>
                        <span className="text-xs text-muted-foreground">({item.type})</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <User className="w-3 h-3" /> {item.customer}
                      </div>
                      <div className="text-sm text-emerald-700 mt-1 font-medium flex items-center gap-1">
                        <Syringe className="w-3.5 h-3.5" />
                        {item.vaccine}
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">Đang chờ</Badge>
                    <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50" asChild>
                        <Link href="/doctor/vaccination">Gọi tiêm</Link>
                    </Button>
                  </div>
                </div>
              ))}
               {vaccineQueue.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">Hiện không có ca chờ tiêm</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Notes */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            Lưu ý quan trọng trong ngày
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 ml-6 list-disc text-sm text-amber-900">
            {notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}