"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  Eye,
  Loader2
} from "lucide-react"

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

export default function ReceptionPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [search, setSearch] = useState("")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0])

  const [walkInOpen, setWalkInOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchAppointments = async () => {
    setLoading(true)
    try {
        const token = localStorage.getItem("staffAccessToken")
        const userStr = localStorage.getItem("staffUser")
        
        if (!token || !userStr) return;
        const user = JSON.parse(userStr);

        const params = new URLSearchParams({
            date: dateFilter,
            service: serviceFilter,
            search: search
        });

        const res = await fetch(`http://localhost:3055/api/staff/appointments?${params.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                "authorization": token,
                "x-client-id": user.MaNV
            }
        })

        if (res.ok) {
            const data = await res.json()
            const list = data.metadata || []

            const mappedList = list.map((item: any, index: number) => {
                let statusKey = item.status || 'booked';
                const sttDB = item.TrangThaiPD || item.status;
                
                if (sttDB === 'Đã đặt') statusKey = 'booked';
                else if (sttDB === 'Đã duyệt') statusKey = 'confirmed';
                else if (sttDB === 'Đang khám') statusKey = 'in-progress';
                else if (sttDB === 'Hoàn thành') statusKey = 'completed';
                else if (sttDB === 'Đã hủy') statusKey = 'cancelled';
                else if (sttDB === 'Hết hạn') statusKey = 'expired';

                return {
                    ...item,
                    id: item.id || `${item.MaKH}_${item.MaTC}_${index}`,
                    
                    status: statusKey,

                    MaKH: item.MaKH,
                    MaTC: item.MaTC,
                    fullDateTime: item.ThoiGianHen || item.fullDateTime
                }
            })

            setAppointments(mappedList)
        }
    } catch (error) {
        console.error("Lỗi tải lịch hẹn:", error)
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchAppointments()
    }, 500)
    return () => clearTimeout(timer)
  }, [dateFilter, serviceFilter, search])

  const handleStatusChange = async (id: string, nextStatus: string) => {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return;

    if (nextStatus === "confirmed") {
        setProcessingId(id);
        try {
            const token = localStorage.getItem("staffAccessToken")
            const userStr = localStorage.getItem("staffUser")
            if (!token || !userStr) return;
            const user = JSON.parse(userStr);

            const res = await fetch("http://localhost:3055/api/staff/check-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": token,
                    "x-client-id": user.MaNV
                },
                body: JSON.stringify({
                    maKH: appointment.MaKH,
                    maTC: appointment.MaTC,
                    thoiGianHen: appointment.fullDateTime 
                })
            });

            if (res.ok) {
                setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: nextStatus } : apt))
            } else {
                const errData = await res.json();
                alert(errData.message || "Lỗi khi check-in");
            }
        } catch (error) {
            console.error("Lỗi API check-in:", error);
            alert("Lỗi kết nối");
        } finally {
            setProcessingId(null);
        }
    } else {
        setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: nextStatus } : apt))
    }
  }

  const handleCancel = (id: string) => {
    if(confirm("Xác nhận hủy lịch hẹn này?")) {
      handleStatusChange(id, "cancelled")
    }
  }

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
              <Input 
                placeholder="Tìm theo tên, SĐT, mã phiếu..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="pl-9 h-9" 
              />
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
              <Input 
                type="date" 
                className="w-40 h-9" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách lịch hẹn</CardTitle>
          <CardDescription>
             {loading ? "Đang tải dữ liệu..." : `Tổng cộng ${appointments.length} lịch hẹn`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-600" /></div>
          ) : (
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
                    {appointments.map((apt) => {
                    const config = statusConfig[apt.status] || statusConfig.booked
                    const StatusIcon = config.icon
                    const isProcessing = processingId === apt.id

                    return (
                        <tr key={apt.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                            {apt.order !== null ? (
                               <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">{apt.order}</div>
                            ) : <span className="text-muted-foreground pl-2">-</span>}
                        </td>
                        <td className="py-3 px-4 font-medium">{apt.time}</td>
                        <td className="py-3 px-4"><code className="text-[11px] bg-muted px-1.5 py-0.5 rounded border">{apt.code}</code></td>
                        <td className="py-3 px-4">
                            <div className="font-medium text-sm">{apt.customer}</div>
                            <div className="text-xs text-muted-foreground">{apt.pet} ({apt.petType})</div>
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
                            
                            {config.actionLabel && (
                                <Button 
                                    size="sm" 
                                    disabled={isProcessing}
                                    className={`h-8 min-w-20 shadow-sm text-xs font-medium ${config.actionClass}`}
                                    onClick={() => handleStatusChange(apt.id, config.nextStatus)}
                                >
                                    {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : config.actionLabel}
                                </Button>
                            )}

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
                    {appointments.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-center py-8 text-muted-foreground">Không tìm thấy lịch hẹn nào</td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
          )}
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