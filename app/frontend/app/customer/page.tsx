"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Crown, Calendar, ArrowRight, QrCode, Loader2 } from "lucide-react"

interface PetUI {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  status: string;
  image: string;
}

interface AppointmentUI {
  id: string;
  date: string;
  time: string;
  branch: string;
  service: string;
  pet: string;
  status: "confirmed" | "pending" | "completed" | "cancelled"; // Cập nhật thêm status
}

interface MembershipUI {
  rank: string;
  joinDate: string;
  points: number;
  currentSpend: number;
  nextTierSpend: number;
  nextTierName: string;
}

export default function CustomerDashboard() {
  const [pets, setPets] = useState<PetUI[]>([])
  const [appointments, setAppointments] = useState<AppointmentUI[]>([])
  const [membership, setMembership] = useState<MembershipUI>({
    rank: "Thành viên",
    joinDate: new Date().toISOString(),
    points: 0,
    currentSpend: 0,
    nextTierSpend: 1000000,
    nextTierName: "VIP"
  })
  
  const [isLoading, setIsLoading] = useState(true)

  const progress = Math.min((membership.currentSpend / membership.nextTierSpend) * 100, 100)

  const calculateAge = (dateString: string) => {
    if (!dateString) return "Không rõ";
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? `${age} tuổi` : "Dưới 1 tuổi";
  }

  const formatDate = (dateString: string) => {
      if(!dateString) return ""
      return new Date(dateString).toLocaleDateString('en-GB')
  }

  const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        const userStr = localStorage.getItem("user")
        
        if (!token || !userStr) return;

        const user = JSON.parse(userStr)
        const headers = {
            "Content-Type": "application/json",
            "authorization": token,
            "x-client-id": user.MaKH
        }

        // 1. FETCH PETS
        const resPets = await fetch("http://localhost:3055/api/pets", { headers })
        if (resPets.ok) {
            const data = await resPets.json()
            // Xử lý linh hoạt: Data có thể là mảng hoặc nằm trong metadata
            const rawPets = Array.isArray(data) ? data : (data.metadata || [])
            
            const mappedPets: PetUI[] = rawPets.map((item: any) => ({
              id: item.id || item.MaTC, // Fallback nếu tên trường thay đổi
              name: item.name || item.TenTC,
              species: item.species || item.Loai,
              breed: item.breed || item.Giong,
              age: calculateAge(item.birthDate || item.NgaySinhTC),
              status: item.status || item.TinhTrangSucKhoe,
              image: (item.species || item.Loai) === "Mèo" ? "/cute-british-shorthair-cat-portrait.jpg" : "/cute-poodle-dog-portrait.jpg"
            }))
            setPets(mappedPets)
        }

        // 2. FETCH APPOINTMENTS (Đã sửa lỗi map)
        const resApt = await fetch("http://localhost:3055/api/appointments", { headers })
        if (resApt.ok) {
            const dataApt = await resApt.json()
            
            // 👇 FIX: Lấy dataApt.metadata thay vì dataApt
            const rawAppointments = dataApt.metadata || []

            const mappedApt: AppointmentUI[] = rawAppointments.map((item: any) => {
                // Vì AppointmentService đã format sẵn dữ liệu (date, time, branch...)
                // Nên ta chỉ cần map trực tiếp, không cần parse lại Date
                return {
                    id: item.id,
                    date: item.date,   // Backend trả về "dd/mm/yyyy"
                    time: item.time,   // Backend trả về "HH:mm"
                    branch: item.branch,
                    service: item.service,
                    pet: item.petName, // Backend trả về petName
                    status: item.status
                }
            })
            setAppointments(mappedApt)
        }

        // 3. FETCH MEMBERSHIP
        const resMember = await fetch("http://localhost:3055/api/membership", { headers })
        if (resMember.ok) {
            const data = await resMember.json()
            const memberData = data.metadata || data // Fallback
            if(memberData) {
                setMembership(memberData)
            }
        }

      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tổng quan</h1>
          <p className="text-muted-foreground">Quản lý thông tin và lịch hẹn của bạn</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/customer/appointments/new">
            <Calendar className="w-4 h-4" />
            Đặt lịch hẹn
          </Link>
        </Button>
      </div>

      <Card className="bg-linear-to-r from-background to-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Thông tin hội viên
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge className="text-sm px-3 py-1 bg-primary text-primary-foreground hover:bg-primary/90">
                {membership.rank}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Đạt cấp từ {formatDate(membership.joinDate)}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-3xl font-bold text-primary">{membership.points} điểm</p>
              <p className="text-xs text-muted-foreground">Điểm tích lũy</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Chi tiêu 12 tháng</span>
              <span className="font-medium">
                {formatCurrency(membership.currentSpend)} / {formatCurrency(membership.nextTierSpend)}
              </span>
            </div>
            <Progress value={progress} className="h-2.5" />
            <p className="text-xs text-muted-foreground">
              {membership.currentSpend >= membership.nextTierSpend 
                ? "Bạn đã đạt cấp độ cao nhất!"
                : `Còn ${formatCurrency(membership.nextTierSpend - membership.currentSpend)} để lên hạng ${membership.nextTierName}`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Thú cưng của bạn</CardTitle>
            <CardDescription>Quản lý hồ sơ thú cưng</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-2 bg-transparent">
            <Link href="/customer/pets">
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
             </div>
          ) : pets.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">
                Bạn chưa thêm thú cưng nào.
             </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/customer/pets/${pet.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors group"
                >
                  <Avatar className="w-16 h-16 rounded-xl border">
                    <AvatarImage src={pet.image} />
                    <AvatarFallback>{pet.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate group-hover:text-primary transition-colors">{pet.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {pet.species} • {pet.breed}
                    </p>
                    <p className="text-sm text-muted-foreground">{pet.age}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {pet.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Lịch hẹn sắp tới</CardTitle>
            <CardDescription>Các cuộc hẹn đã đặt</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link href="/customer/appointments">
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    Bạn chưa có lịch hẹn nào sắp tới.
                </div>
            ) : (
              <div className="space-y-4">
                {appointments.slice(0, 3).map((apt) => ( // Chỉ hiện 3 cái mới nhất
                  <div
                    key={apt.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs text-primary font-medium">
                          {/* Xử lý an toàn nếu date không đúng định dạng */}
                          {apt.date.includes('/') ? `${apt.date.split("/")[1]}/${apt.date.split("/")[2]}` : "--"}
                        </span>
                        <span className="text-lg font-bold text-primary">
                           {apt.date.includes('/') ? apt.date.split("/")[0] : "--"}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{apt.service}</p>
                        <p className="text-sm text-muted-foreground">
                          {apt.pet} • {apt.time}
                        </p>
                        <p className="text-sm text-muted-foreground">{apt.branch}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <Badge variant={apt.status === "confirmed" ? "default" : "secondary"}>
                        {apt.status === "confirmed" ? "Đã xác nhận" : "Chờ xác nhận"}
                      </Badge>
                      <Button variant="outline" size="sm" className="gap-1 bg-transparent h-8">
                        <QrCode className="w-3.5 h-3.5" />
                        QR Code
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}