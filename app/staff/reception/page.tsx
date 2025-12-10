"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Filter, QrCode, CheckCircle, XCircle, Clock, UserPlus } from "lucide-react"

const appointments = [
  {
    id: 1,
    order: 1,
    code: "APT-001",
    time: "09:00",
    customer: "Nguyễn Văn A",
    phone: "0901234567",
    pet: "Mochi",
    petType: "Chó Poodle",
    service: "Khám bệnh",
    doctor: "BS. Trần Văn B",
    status: "waiting",
  },
  {
    id: 2,
    order: 2,
    code: "APT-002",
    time: "09:30",
    customer: "Trần Thị B",
    phone: "0912345678",
    pet: "Luna",
    petType: "Mèo British",
    service: "Tiêm phòng",
    doctor: "BS. Nguyễn Thị C",
    status: "booked",
  },
  {
    id: 3,
    order: 3,
    code: "APT-003",
    time: "10:00",
    customer: "Lê Văn C",
    phone: "0923456789",
    pet: "Buddy",
    petType: "Chó Golden",
    service: "Khám bệnh",
    doctor: "BS. Trần Văn B",
    status: "in-progress",
  },
  {
    id: 4,
    order: 4,
    code: "APT-004",
    time: "10:30",
    customer: "Phạm Thị D",
    phone: "0934567890",
    pet: "Max",
    petType: "Chó Husky",
    service: "Tiêm phòng",
    doctor: "BS. Nguyễn Thị C",
    status: "completed",
  },
]

const statusConfig = {
  booked: { label: "Đã đặt", variant: "secondary" as const, icon: Clock },
  waiting: { label: "Đang chờ", variant: "default" as const, icon: Clock },
  "in-progress": { label: "Đang khám", variant: "outline" as const, icon: CheckCircle },
  completed: { label: "Hoàn thành", variant: "secondary" as const, icon: CheckCircle },
  cancelled: { label: "Đã hủy", variant: "destructive" as const, icon: XCircle },
}

export default function ReceptionPage() {
  const [search, setSearch] = useState("")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [walkInOpen, setWalkInOpen] = useState(false)

  const filteredAppointments = appointments.filter((apt) => {
    const matchSearch =
      apt.customer.toLowerCase().includes(search.toLowerCase()) ||
      apt.pet.toLowerCase().includes(search.toLowerCase()) ||
      apt.code.toLowerCase().includes(search.toLowerCase())
    const matchService = serviceFilter === "all" || apt.service === serviceFilter
    return matchSearch && matchService
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tiếp nhận & Đặt lịch</h1>
          <p className="text-muted-foreground">Quản lý lịch hẹn và tiếp nhận khách hàng</p>
        </div>
        <Dialog open={walkInOpen} onOpenChange={setWalkInOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Tiếp nhận khách vãng lai
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Tiếp nhận khách vãng lai</DialogTitle>
              <DialogDescription>Tạo phiếu tiếp nhận cho khách không đặt lịch trước</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tìm khách hàng (SĐT)</Label>
                <div className="flex gap-2">
                  <Input placeholder="Nhập số điện thoại" />
                  <Button variant="outline">Tìm</Button>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
                Nhập SĐT để tìm khách hàng hoặc tạo mới
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loại dịch vụ</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn dịch vụ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exam">Khám bệnh</SelectItem>
                      <SelectItem value="vaccine">Tiêm phòng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bác sĩ</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Không yêu cầu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Không yêu cầu</SelectItem>
                      <SelectItem value="1">BS. Trần Văn B</SelectItem>
                      <SelectItem value="2">BS. Nguyễn Thị C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full">Tạo phiếu & đưa vào hàng chờ</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, SĐT, mã phiếu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả dịch vụ</SelectItem>
                  <SelectItem value="Khám bệnh">Khám bệnh</SelectItem>
                  <SelectItem value="Tiêm phòng">Tiêm phòng</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" className="w-40" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách lịch hẹn hôm nay</CardTitle>
          <CardDescription>Tổng cộng {filteredAppointments.length} lịch hẹn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">STT</th>
                  <th className="pb-3 font-medium">Giờ</th>
                  <th className="pb-3 font-medium">Mã phiếu</th>
                  <th className="pb-3 font-medium">Khách hàng</th>
                  <th className="pb-3 font-medium">Thú cưng</th>
                  <th className="pb-3 font-medium">Dịch vụ</th>
                  <th className="pb-3 font-medium">Bác sĩ</th>
                  <th className="pb-3 font-medium">Trạng thái</th>
                  <th className="pb-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredAppointments.map((apt) => {
                  const status = statusConfig[apt.status as keyof typeof statusConfig]
                  return (
                    <tr key={apt.id} className="border-b last:border-0">
                      <td className="py-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {apt.order}
                        </div>
                      </td>
                      <td className="py-4 font-medium">{apt.time}</td>
                      <td className="py-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{apt.code}</code>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="font-medium">{apt.customer}</p>
                          <p className="text-xs text-muted-foreground">{apt.phone}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="font-medium">{apt.pet}</p>
                          <p className="text-xs text-muted-foreground">{apt.petType}</p>
                        </div>
                      </td>
                      <td className="py-4">{apt.service}</td>
                      <td className="py-4 text-muted-foreground">{apt.doctor}</td>
                      <td className="py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="Xem QR">
                            <QrCode className="w-4 h-4" />
                          </Button>
                          {apt.status === "booked" && <Button size="sm">Check-in</Button>}
                          {apt.status === "waiting" && (
                            <Button size="sm" variant="outline">
                              Gọi khám
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
