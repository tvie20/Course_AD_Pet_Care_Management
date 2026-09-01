"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Calendar, MapPin, Clock, Search, Filter, QrCode, CalendarPlus, 
  History, Loader2, User as UserIconSVG 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// --- TYPES ---
interface Appointment {
  id: string
  petName: string
  petType: string
  service: string
  date: string
  time: string
  branch: string
  address: string
  doctor: string 
  status: "confirmed" | "pending" | "completed" | "cancelled"
  originalStatus: string
}

// --- HELPER FUNCTIONS ---
const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed": return "default"; 
    case "pending": return "secondary"; 
    case "completed": return "outline"; 
    case "cancelled": return "destructive"; 
    default: return "secondary";
  }
}

const getStatusLabel = (status: string, originalStatus: string) => {
  return originalStatus || status;
}

const getPetImage = (type: string) => {
    // Thêm check an toàn để tránh lỗi nếu type bị null/undefined
    const t = (type || "").toLowerCase();
    
    if (t.includes("mèo") || t.includes("meo")) return "/cute-british-shorthair-cat.jpg";
    if (t.includes("chó") || t.includes("cho")) return "/cute-poodle.png";
    return "/default-pet.png"; 
}

export default function AppointmentsPage() {
  // Khởi tạo mảng rỗng để tránh lỗi undefined khi render lần đầu
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // --- API CALL ---
  useEffect(() => {
    const fetchAppointments = async () => {
        // Ưu tiên token khách hàng
        const token = localStorage.getItem("accessToken") 
        const userStr = localStorage.getItem("user") 
        
        if (!userStr || !token) {
            setLoading(false)
            return
        }
        
        const user = JSON.parse(userStr)

        try {
            const res = await fetch("http://localhost:3055/api/appointments", {
                headers: {
                    "Content-Type": "application/json",
                    "authorization": token,
                    "x-client-id": user.MaKH // Gửi Mã Khách Hàng
                }
            })
            
            if (res.ok) {
                const data = await res.json()
                // 👇 QUAN TRỌNG: Thêm "|| []" để đảm bảo luôn là mảng
                setAppointments(data.metadata || [])
            } else {
                console.error("Lỗi tải dữ liệu:", await res.text())
            }
        } catch (error) {
            console.error("Failed to fetch appointments", error)
        } finally {
            setLoading(false)
        }
    }

    fetchAppointments()
  }, [])

  // Lọc danh sách (Cần đảm bảo appointments là mảng trước khi filter)
  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  const filteredApps = safeAppointments.filter(app => 
    (app.petName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.service || "").toLowerCase().includes(searchQuery.toLowerCase())
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

        {/* LOADING STATE */}
        {loading ? (
            <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ) : (
            <>
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
            </>
        )}
      </Tabs>
    </div>
  )
}

// Component hiển thị từng item lịch hẹn
function AppointmentItem({ appointment }: { appointment: Appointment }) {
  return (
    <Card className="hover:shadow-md transition-all overflow-hidden border-l-4 border-l-transparent hover:border-l-primary">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          
          {/* Cột 1: Ngày giờ */}
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
                  {getStatusLabel(appointment.status, appointment.originalStatus)}
                </Badge>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-foreground">{appointment.service}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="w-6 h-6 border">
                    <AvatarImage src={getPetImage(appointment.petType)} />
                    <AvatarFallback>{appointment.petName?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">Thú cưng: {appointment.petName}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 opacity-70" />
                  {appointment.branch} 
                </div>
                {/* HIỂN THỊ BÁC SĨ */}
                <div className="flex items-center gap-2 text-indigo-600 font-medium">
                    <UserIconSVG className="w-4 h-4 opacity-70" />
                    {appointment.doctor}
                </div>
              </div>
            </div>

            {/* Cột 3: Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 pt-4 md:pt-0 border-t md:border-t-0 md:w-40 shrink-0">
              {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                <Button variant="outline" className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary">
                  <QrCode className="w-4 h-4" />
                  QR Code
                </Button>
              )}

              <Button variant="secondary" className="w-full bg-muted/50 hover:bg-muted">
                Xem chi tiết
              </Button>
              
              {appointment.status === 'pending' && (
                <Button variant="ghost" className="w-full bg-red-100 text-destructive hover:bg-destructive/10 hover:text-destructive">
                  Hủy lịch hẹn
                </Button>
              )}

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