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
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle,      
  Clock,        
  AlertCircle,  
  UserPlus,
  Hourglass,    
  CalendarCheck,
  Stethoscope,
  MoreHorizontal, 
  Trash2,
  Eye
} from "lucide-react"

// Cấu hình Visual (Giữ nguyên màu sắc)
const statusConfig: any = {
  booked: { 
    label: "Đã đặt", 
    className: "bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200",
    icon: Clock,
    actionLabel: "Duyệt",
    actionClass: "bg-white border-blue-500 text-blue-600 border hover:bg-blue-50",
    nextStatus: "confirmed"
  },
  confirmed: { 
    label: "Đã duyệt", 
    className: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200", 
    icon: CalendarCheck,
    actionLabel: "Check-in",
    actionClass: "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent",
    nextStatus: "waiting"
  },
  waiting: { 
    label: "Đang chờ", 
    className: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100", 
    icon: Hourglass,
    actionLabel: "Gọi khám",
    actionClass: "bg-white border-emerald-500 text-emerald-600 border hover:bg-emerald-50",
    nextStatus: "in-progress"
  },
  "in-progress": { 
    label: "Đang khám", 
    className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100", 
    icon: Stethoscope,
    actionLabel: "Hoàn thành",
    actionClass: "bg-purple-600 hover:bg-purple-700 text-white",
    nextStatus: "completed"
  },
  completed: { 
    label: "Hoàn thành", 
    className: "bg-emerald-100 text-emerald-700 border-emerald-200", 
    icon: CheckCircle2,
    actionLabel: null,
    nextStatus: null
  },
  expired: { 
    label: "Hết hạn", 
    className: "bg-slate-50 text-slate-500 border-dashed border-slate-300", 
    icon: AlertCircle,
    actionLabel: "Đặt lại",
    actionClass: "text-white hover:text-slate-900 hover:bg-yellow-100 bg-yellow-500 border-transparent",
    nextStatus: "booked"
  },
  cancelled: { 
    label: "Đã hủy", 
    className: "bg-red-600 text-white border-transparent hover:bg-red-700", 
    icon: XCircle,
    actionLabel: null,
    nextStatus: null
  },
}

const initialAppointments = [
  { id: 1, order: 1, code: "APT-001", time: "08:30", customer: "Nguyễn Văn A", phone: "0901234567", pet: "Mochi", petType: "Chó Poodle", service: "Khám bệnh", doctor: "BS. Trần Văn B", status: "waiting", note: "Bé bỏ ăn 2 ngày nay" },
  { id: 2, order: 2, code: "APT-002", time: "09:00", customer: "Trần Thị B", phone: "0912345678", pet: "Luna", petType: "Mèo British", service: "Tiêm phòng", doctor: "BS. Nguyễn Thị C", status: "confirmed", note: "Tiêm mũi 3" },
  { id: 3, order: "-", code: "APT-003", time: "09:30", customer: "Lê Văn C", phone: "0923456789", pet: "Buddy", petType: "Chó Golden", service: "Khám bệnh", doctor: "BS. Trần Văn B", status: "booked", note: "" },
  { id: 4, order: "-", code: "APT-004", time: "08:00", customer: "Phạm Thị D", phone: "0934567890", pet: "Max", petType: "Chó Husky", service: "Tiêm phòng", doctor: "BS. Nguyễn Thị C", status: "expired", note: "Gọi không nghe máy" },
  { id: 5, order: "-", code: "APT-005", time: "10:00", customer: "Hoàng Văn E", phone: "0945678901", pet: "Nala", petType: "Mèo Ta", service: "Cấp cứu", doctor: "BS. Trần Văn B", status: "cancelled", note: "Khách hủy" },
]

export default function ReceptionPage() {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [search, setSearch] = useState("")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [walkInOpen, setWalkInOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)

  const handleStatusChange = (id: number, nextStatus: string) => {
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: nextStatus } : apt))
  }

  const handleCancel = (id: number) => {
    if(confirm("Xác nhận hủy lịch hẹn này?")) {
      handleStatusChange(id, "cancelled")
    }
  }

  const filteredAppointments = appointments.filter((apt) => {
    const matchSearch = apt.customer.toLowerCase().includes(search.toLowerCase()) || apt.code.toLowerCase().includes(search.toLowerCase())
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
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-9 text-sm">
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
               <div className="space-y-2"><Label>SĐT Khách</Label><Input placeholder="09..." /></div>
               <Button className="w-full" onClick={() => setWalkInOpen(false)}>Tạo phiếu</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Tìm theo tên, SĐT, mã phiếu..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <div className="flex gap-2">
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-40 h-9"><Filter className="w-3.5 h-3.5 mr-2" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Khám bệnh">Khám bệnh</SelectItem>
                  <SelectItem value="Tiêm phòng">Tiêm phòng</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" className="w-40 h-9" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách lịch hẹn hôm nay</CardTitle>
          <CardDescription>Tổng cộng {filteredAppointments.length} lịch hẹn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground bg-slate-50/50">
                  <th className="py-3 px-4 font-medium">STT</th>
                  <th className="py-3 px-4 font-medium">Giờ</th>
                  <th className="py-3 px-4 font-medium">Mã</th>
                  <th className="py-3 px-4 font-medium">Khách hàng</th>
                  <th className="py-3 px-4 font-medium">Dịch vụ</th>
                  <th className="py-3 px-4 font-medium">Trạng thái</th>
                  <th className="py-3 px-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredAppointments.map((apt) => {
                  const config = statusConfig[apt.status] || statusConfig.booked
                  const StatusIcon = config.icon

                  return (
                    <tr key={apt.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        {apt.order !== "-" ? (
                           <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">{apt.order}</div>
                        ) : <span className="text-muted-foreground pl-2">-</span>}
                      </td>
                      <td className="py-3 px-4 font-medium">{apt.time}</td>
                      <td className="py-3 px-4"><code className="text-[11px] bg-muted px-1.5 py-0.5 rounded border">{apt.code}</code></td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-sm">{apt.customer}</div>
                        <div className="text-xs text-muted-foreground">{apt.pet}</div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                          <div>{apt.service}</div>
                          <div className="text-xs text-muted-foreground">{apt.doctor}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`gap-1 pr-2.5 py-0.5 rounded-full font-normal border text-xs ${config.className}`}>
                           <StatusIcon className="w-3 h-3" />
                           {config.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* NÚT THAO TÁC CHÍNH (Đã thu nhỏ: h-8, text-xs) */}
                          {config.actionLabel && (
                            <Button 
                                size="sm" 
                                className={`h-8 min-w-[80px] shadow-sm text-xs font-medium ${config.actionClass}`}
                                onClick={() => handleStatusChange(apt.id, config.nextStatus)}
                            >
                                {config.actionLabel}
                            </Button>
                          )}

                          {/* MENU 3 CHẤM (Đã thu nhỏ: h-8 w-8) */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-slate-900">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Tùy chọn</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem onClick={() => setSelectedAppointment(apt)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              
                              {['booked', 'confirmed', 'waiting', 'expired'].includes(apt.status) && (
                                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleCancel(apt.id)}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Hủy phiếu
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>

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

      <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Chi tiết phiếu {selectedAppointment?.code}</DialogTitle>
                <DialogDescription>Thông tin chi tiết lịch hẹn</DialogDescription>
            </DialogHeader>
            {selectedAppointment && (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label className="text-muted-foreground">Khách hàng</Label><div className="font-medium">{selectedAppointment.customer}</div></div>
                        <div><Label className="text-muted-foreground">SĐT</Label><div className="font-medium">{selectedAppointment.phone}</div></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label className="text-muted-foreground">Thú cưng</Label><div className="font-medium">{selectedAppointment.pet} ({selectedAppointment.petType})</div></div>
                        <div><Label className="text-muted-foreground">Giờ hẹn</Label><div className="font-medium">{selectedAppointment.time}</div></div>
                    </div>
                    <div className="border-t pt-4 mt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label className="text-muted-foreground">Dịch vụ</Label><div className="font-medium text-emerald-600">{selectedAppointment.service}</div></div>
                            <div><Label className="text-muted-foreground">Bác sĩ</Label><div className="font-medium">{selectedAppointment.doctor}</div></div>
                        </div>
                    </div>
                    <div>
                        <Label className="text-muted-foreground">Ghi chú</Label>
                        <div className="mt-1 p-3 bg-slate-50 rounded-md text-sm italic border">{selectedAppointment.note || "Không có ghi chú"}</div>
                    </div>
                </div>
            )}
            <DialogFooter><Button variant="outline" onClick={() => setSelectedAppointment(null)}>Đóng</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}