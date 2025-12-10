"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Search, 
  Filter, 
  MoreVertical, 
  QrCode, 
  CalendarPlus,
  History
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Dữ liệu giả lập phong phú hơn
const allAppointments = [
  {
    id: "APT-001",
    petName: "Mochi",
    petImage: "/cute-poodle.png",
    service: "Khám định kỳ",
    date: "15/12/2025",
    time: "09:00",
    branch: "PetCareX Quận 1",
    doctor: "BSTY. Nguyễn Văn A",
    status: "confirmed", // confirmed, pending, completed, cancelled
  },
  {
    id: "APT-002",
    petName: "Luna",
    petImage: "/cute-british-shorthair-cat.jpg",
    service: "Tiêm phòng",
    date: "20/12/2025",
    time: "14:30",
    branch: "PetCareX Quận 1",
    doctor: "BSTY. Trần Thị B",
    status: "pending",
  },
  {
    id: "APT-003",
    petName: "Mochi",
    petImage: "/cute-poodle.png",
    service: "Spa - Cắt tỉa lông",
    date: "01/11/2025",
    time: "10:00",
    branch: "PetCareX Quận 7",
    doctor: "KTV. Lê Văn C",
    status: "completed",
  },
  {
    id: "APT-004",
    petName: "Luna",
    petImage: "/cute-british-shorthair-cat.jpg",
    service: "Cấp cứu",
    date: "10/10/2025",
    time: "22:00",
    branch: "PetCareX Quận 1",
    doctor: "BSTY. Nguyễn Văn A",
    status: "cancelled",
  }
]

// Hàm map màu sắc cho trạng thái
const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed": return "default"; // Xanh đậm (mặc định)
    case "pending": return "secondary"; // Xám/Vàng nhạt
    case "completed": return "outline"; // Viền
    case "cancelled": return "destructive"; // Đỏ
    default: return "secondary";
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "confirmed": return "Đã xác nhận";
    case "pending": return "Chờ xác nhận";
    case "completed": return "Hoàn thành";
    case "cancelled": return "Đã hủy";
    default: return status;
  }
}

export default function AppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Lọc danh sách dựa trên tìm kiếm
  const filteredApps = allAppointments.filter(app => 
    app.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.service.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const upcomingApps = filteredApps.filter(app => ["confirmed", "pending"].includes(app.status))
  const historyApps = filteredApps.filter(app => ["completed", "cancelled"].includes(app.status))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý lịch hẹn</h1>
          <p className="text-muted-foreground">Theo dõi tất cả lịch khám và chăm sóc thú cưng</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/customer/appointments/new">
            <CalendarPlus className="w-4 h-4" />
            Đặt lịch mới
          </Link>
        </Button>
      </div>

      {/* Tabs & Filter */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-2">
            <TabsTrigger value="upcoming">Sắp tới ({upcomingApps.length})</TabsTrigger>
            <TabsTrigger value="history">Lịch sử ({historyApps.length})</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên thú cưng, dịch vụ..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tab Content: Sắp tới */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingApps.length > 0 ? (
            upcomingApps.map((apt) => (
              <AppointmentItem key={apt.id} appointment={apt} />
            ))
          ) : (
            <EmptyState message="Bạn không có lịch hẹn nào sắp tới." />
          )}
        </TabsContent>

        {/* Tab Content: Lịch sử */}
        <TabsContent value="history" className="space-y-4">
          {historyApps.length > 0 ? (
            historyApps.map((apt) => (
              <AppointmentItem key={apt.id} appointment={apt} />
            ))
          ) : (
            <EmptyState message="Chưa có lịch sử khám bệnh." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Component hiển thị từng item lịch hẹn (tái sử dụng)
function AppointmentItem({ appointment }: { appointment: any }) {
  return (
    <Card className="hover:shadow-md transition-all overflow-hidden border-l-4 border-l-transparent hover:border-l-primary">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          
          {/* Cột 1: Ngày giờ (Giữ nguyên) */}
          <div className="p-6 flex items-center gap-4 md:w-[250px] border-b md:border-b-0 md:border-r bg-muted/10">
            <div className="flex flex-col items-center justify-center w-16 h-16 bg-background rounded-2xl border shadow-sm shrink-0">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Tháng {appointment.date.split("/")[1]}
              </span>
              <span className="text-2xl font-bold text-primary">
                {appointment.date.split("/")[0]}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Clock className="w-4 h-4 text-primary" />
                {appointment.time}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{appointment.date}</p>
            </div>
          </div>

          {/* Cột 2: Thông tin chi tiết & Actions */}
          <div className="flex-1 p-6 flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <Badge variant={getStatusColor(appointment.status) as any} className="px-2.5 py-0.5">
                  {getStatusLabel(appointment.status)}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">#{appointment.id}</span>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-foreground">{appointment.service}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="w-6 h-6 border">
                    <AvatarImage src={appointment.petImage} />
                    <AvatarFallback>{appointment.petName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">Thú cưng: {appointment.petName}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 opacity-70" />
                  {appointment.branch}
                </div>
                {appointment.doctor && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 opacity-70" />
                    {appointment.doctor}
                  </div>
                )}
              </div>
            </div>

            {/* Cột 3: Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 pt-4 md:pt-0 border-t md:border-t-0 md:w-40 shrink-0">
              {/* 1. Nút QR Code (Hiện cho Pending/Confirmed) */}
              {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                <Button variant="outline" className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary">
                  <QrCode className="w-4 h-4" />
                  QR Code
                </Button>
              )}

              {/* 2. Nút Xem chi tiết (Luôn hiện) */}
              <Button variant="secondary" className="w-full bg-muted/50 hover:bg-muted">
                Xem chi tiết
              </Button>
              
              {/* 3. Nút Hủy (Chỉ hiện khi Pending) */}
              {appointment.status === 'pending' && (
                <Button variant="ghost" className="w-full bg-red-100 text-destructive hover:bg-destructive/10 hover:text-destructive">
                  Hủy lịch hẹn
                </Button>
              )}

              {/* 4. Nút Đặt lại (Hiện khi đã Xong/Hủy) */}
              {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                <Button variant="outline" className="w-full">
                  Đặt lại
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/30">
      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
        <History className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}

// Icon helper (nếu chưa import User từ lucide)
function UserIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}