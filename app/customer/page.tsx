import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Crown, Calendar, Bell, Plus, ArrowRight, QrCode } from "lucide-react"

const pets = [
  {
    id: 1,
    name: "Mochi",
    species: "Chó",
    breed: "Poodle",
    age: "2 tuổi",
    status: "Khỏe mạnh",
    image: "/cute-poodle.png",
  },
  {
    id: 2,
    name: "Luna",
    species: "Mèo",
    breed: "British Shorthair",
    age: "1 tuổi",
    status: "Khỏe mạnh",
    image: "/cute-british-shorthair-cat.jpg",
  },
]

const appointments = [
  {
    id: 1,
    date: "15/12/2025",
    time: "09:00",
    branch: "PetCareX Quận 1",
    service: "Khám định kỳ",
    pet: "Mochi",
    status: "confirmed",
  },
  {
    id: 2,
    date: "20/12/2025",
    time: "14:30",
    branch: "PetCareX Quận 1",
    service: "Tiêm phòng",
    pet: "Luna",
    status: "pending",
  },
]

const notifications = [
  { id: 1, message: "Nhắc lịch tiêm phòng mũi 2 cho Luna vào 20/12", type: "vaccination" },
  { id: 2, message: "Mochi cần tái khám vào 25/12", type: "checkup" },
  { id: 3, message: "Ưu đãi 20% dịch vụ spa cuối năm!", type: "promo" },
]

export default function CustomerDashboard() {
  const currentSpend = 3500000
  const nextTierSpend = 5000000
  const progress = (currentSpend / nextTierSpend) * 100

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

      {/* Membership Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-accent" />
              Thông tin hội viên
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="text-sm px-3 py-1">Thân thiết</Badge>
                <span className="text-sm text-muted-foreground">Đạt cấp từ 01/06/2025</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">125 điểm</p>
                <p className="text-xs text-muted-foreground">Điểm tích lũy</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Chi tiêu 12 tháng</span>
                <span className="font-medium">
                  {currentSpend.toLocaleString()}đ / {nextTierSpend.toLocaleString()}đ
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Còn {(nextTierSpend - currentSpend).toLocaleString()}đ để lên hạng VIP
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Thông báo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {notifications.map((notif) => (
                <li key={notif.id} className="flex items-start gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span className="text-muted-foreground">{notif.message}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Pets */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Thú cưng của bạn</CardTitle>
            <CardDescription>Quản lý hồ sơ thú cưng</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-2 bg-transparent">
            <Link href="/customer/pets/new">
              <Plus className="w-4 h-4" />
              Thêm thú cưng
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet) => (
              <Link
                key={pet.id}
                href={`/customer/pets/${pet.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors"
              >
                <Avatar className="w-16 h-16 rounded-xl">
                  <AvatarImage src={pet.image || "/placeholder.svg"} />
                  <AvatarFallback>{pet.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{pet.name}</p>
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
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Lịch hẹn sắp tới</CardTitle>
            <CardDescription>Các cuộc hẹn đã đặt</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link href="/customer/appointments/new">
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs text-primary font-medium">
                      {apt.date.split("/")[1]}/{apt.date.split("/")[2]}
                    </span>
                    <span className="text-lg font-bold text-primary">{apt.date.split("/")[0]}</span>
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
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <QrCode className="w-4 h-4" />
                    QR Code
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
