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
  Eye,
  User,
  History,
  PlusCircle
} from "lucide-react"

// --- CẤU HÌNH VISUAL ---
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
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  
  // --- STATE CHO FORM TIẾP NHẬN ---
  const [walkInOpen, setWalkInOpen] = useState(false)
  const [customerType, setCustomerType] = useState<"new" | "old">("new") // Loại khách: Mới / Cũ
  
  // Form Data tổng hợp
  const [formData, setFormData] = useState({
    // 1. Service Info (Đã bỏ MaNV)
    LoaiDichVu: "",
    // 2. Customer Info
    HoTenKH: "",
    SDT: "",
    CCCD: "",
    GioiTinhKH: "",
    NgaySinhKH: "",
    EmailKH: "",
    // 3. Pet Info
    TenTC: "",
    LoaiTC: "",
    GiongTC: "",
    GioiTinhTC: "",
    NgaySinhTC: "",
  })

  // State xử lý riêng cho Khách cũ
  const [checkCCCD, setCheckCCCD] = useState("")
  const [foundCustomer, setFoundCustomer] = useState<any>(null) // Lưu thông tin khách tìm thấy
  const [existingPets, setExistingPets] = useState<any[]>([]) // List thú cưng của khách cũ
  const [selectedPetId, setSelectedPetId] = useState<string>("new_pet") // ID thú cưng được chọn (hoặc 'new_pet')

  const handleStatusChange = (id: number, nextStatus: string) => {
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: nextStatus } : apt))
  }

  const handleCancel = (id: number) => {
    if(confirm("Xác nhận hủy lịch hẹn này?")) {
      handleStatusChange(id, "cancelled")
    }
  }

  // Giả lập check CCCD (Backend sẽ xử lý sau)
  const handleCheckCCCD = () => {
    // Demo: Nhập 079090000001 sẽ tìm thấy
    if (checkCCCD === "079090000001") {
        setFoundCustomer({
            HoTenKH: "Nguyễn Văn A",
            SDT: "0901234567",
            EmailKH: "nguyenvana@gmail.com"
        })
        setExistingPets([
            { id: "p1", TenTC: "Mochi", LoaiTC: "Chó", GiongTC: "Poodle" },
            { id: "p2", TenTC: "Lu", LoaiTC: "Mèo", GiongTC: "Mướp" }
        ])
        setSelectedPetId("p1") // Mặc định chọn bé đầu tiên
    } else {
        alert("Không tìm thấy khách hàng với CCCD này!")
        setFoundCustomer(null)
        setExistingPets([])
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateTicket = () => {
    // Logic tạo phiếu (gọi API)
    console.log("Dữ liệu gửi đi:", {
        type: customerType,
        customer: customerType === 'old' ? foundCustomer : { ...formData }, // Lấy formData phần khách hàng
        pet: customerType === 'old' && selectedPetId !== 'new_pet' ? selectedPetId : { ...formData }, // Lấy formData phần thú cưng
        service: { LoaiDichVu: formData.LoaiDichVu } // Chỉ còn Loại Dịch Vụ
    })
    alert("Đã tạo phiếu tiếp nhận thành công!")
    setWalkInOpen(false)
    // Reset form...
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
        
        {/* --- DIALOG TIẾP NHẬN KHÁCH VÃNG LAI --- */}
        <Dialog open={walkInOpen} onOpenChange={setWalkInOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-9 text-sm">
              <UserPlus className="w-4 h-4" />
              Tiếp nhận khách vãng lai
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tiếp nhận khách vãng lai</DialogTitle>
              <DialogDescription>Nhập thông tin để tạo phiếu khám ngay lập tức.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-2">
                
                {/* 1. CHỌN LOẠI KHÁCH HÀNG */}
                <div className="flex p-1 bg-slate-100 rounded-lg">
                    <button 
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${customerType === 'new' ? 'bg-white shadow text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setCustomerType("new")}
                    >
                        <UserPlus className="w-4 h-4 inline-block mr-2" />
                        Khách hàng mới
                    </button>
                    <button 
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${customerType === 'old' ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setCustomerType("old")}
                    >
                        <History className="w-4 h-4 inline-block mr-2" />
                        Khách hàng cũ
                    </button>
                </div>

                {/* 2. THÔNG TIN DỊCH VỤ (ĐÃ BỎ CHỌN BÁC SĨ) */}
                <div className="p-4 border rounded-lg bg-slate-50/50">
                    <div className="space-y-2">
                        <Label>Loại dịch vụ <span className="text-red-500">*</span></Label>
                        <Select onValueChange={(val) => handleInputChange("LoaiDichVu", val)}>
                            <SelectTrigger><SelectValue placeholder="Chọn dịch vụ" /></SelectTrigger>
                            <SelectContent>
                                {/* Chỉ còn 2 loại dịch vụ này */}
                                <SelectItem value="Khám bệnh">Khám bệnh</SelectItem>
                                <SelectItem value="Tiêm phòng">Tiêm phòng</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 3. LOGIC KHÁCH HÀNG */}
                {customerType === 'new' ? (
                    // --- FORM KHÁCH MỚI ---
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <User className="w-4 h-4 text-emerald-600" />
                            <h3 className="font-semibold text-sm">Thông tin khách hàng</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Họ tên <span className="text-red-500">*</span></Label>
                                <Input placeholder="Nguyễn Văn A" onChange={(e) => handleInputChange("HoTenKH", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>SĐT <span className="text-red-500">*</span></Label>
                                <Input placeholder="09..." onChange={(e) => handleInputChange("SDT", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>CCCD/CMND</Label>
                                <Input placeholder="12 số..." onChange={(e) => handleInputChange("CCCD", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input placeholder="example@mail.com" onChange={(e) => handleInputChange("EmailKH", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Giới tính</Label>
                                <Select onValueChange={(val) => handleInputChange("GioiTinhKH", val)}>
                                    <SelectTrigger><SelectValue placeholder="Chọn giới tính" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Nam">Nam</SelectItem>
                                        <SelectItem value="Nữ">Nữ</SelectItem>
                                        <SelectItem value="Khác">Khác</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Ngày sinh</Label>
                                <Input type="date" onChange={(e) => handleInputChange("NgaySinhKH", e.target.value)} />
                            </div>
                        </div>
                    </div>
                ) : (
                    // --- FORM KHÁCH CŨ (CHECK CCCD) ---
                    <div className="space-y-4">
                        <div className="flex items-end gap-3">
                            <div className="space-y-2 flex-1">
                                <Label>Nhập CCCD khách hàng</Label>
                                <Input 
                                    placeholder="Nhập CCCD để tìm kiếm..." 
                                    value={checkCCCD}
                                    onChange={(e) => setCheckCCCD(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleCheckCCCD} className="bg-blue-600 hover:bg-blue-700">
                                <Search className="w-4 h-4 mr-2" /> Kiểm tra
                            </Button>
                        </div>

                        {foundCustomer && (
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-sm space-y-1">
                                <p><strong>Khách hàng:</strong> {foundCustomer.HoTenKH}</p>
                                <p><strong>SĐT:</strong> {foundCustomer.SDT}</p>
                                <p className="text-muted-foreground text-xs">Email: {foundCustomer.EmailKH}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. LOGIC THÚ CƯNG */}
                {(customerType === 'new' || foundCustomer) && (
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <div className="bg-emerald-100 p-1 rounded-full"><PlusCircle className="w-4 h-4 text-emerald-600" /></div>
                            <h3 className="font-semibold text-sm">Thông tin thú cưng</h3>
                        </div>

                        {/* Nếu là khách cũ -> Cho chọn thú cưng có sẵn */}
                        {customerType === 'old' && existingPets.length > 0 && (
                            <div className="space-y-2 mb-4">
                                <Label>Chọn thú cưng cần khám</Label>
                                <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                                    <SelectTrigger className="bg-white border-blue-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {existingPets.map(pet => (
                                            <SelectItem key={pet.id} value={pet.id}>
                                                {pet.TenTC} ({pet.LoaiTC} - {pet.GiongTC})
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="new_pet" className="font-semibold text-emerald-600">
                                            + Thêm thú cưng mới
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Form nhập thú cưng (Hiện khi là Khách mới HOẶC Khách cũ chọn "Thêm mới") */}
                        {(customerType === 'new' || selectedPetId === 'new_pet') && (
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
                                <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase">Nhập thông tin thú cưng mới</div>
                                <div className="space-y-2">
                                    <Label>Tên thú cưng <span className="text-red-500">*</span></Label>
                                    <Input placeholder="Vd: Mochi" onChange={(e) => handleInputChange("TenTC", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Loài</Label>
                                    <Select onValueChange={(val) => handleInputChange("LoaiTC", val)}>
                                        <SelectTrigger><SelectValue placeholder="Chó/Mèo..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Chó">Chó</SelectItem>
                                            <SelectItem value="Mèo">Mèo</SelectItem>
                                            <SelectItem value="Khác">Khác</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Giống (Breed)</Label>
                                    <Input placeholder="Vd: Poodle, Mướp..." onChange={(e) => handleInputChange("GiongTC", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Giới tính</Label>
                                    <Select onValueChange={(val) => handleInputChange("GioiTinhTC", val)}>
                                        <SelectTrigger><SelectValue placeholder="Đực/Cái" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Đực">Đực</SelectItem>
                                            <SelectItem value="Cái">Cái</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ngày sinh (ước lượng)</Label>
                                    <Input type="date" onChange={(e) => handleInputChange("NgaySinhTC", e.target.value)} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setWalkInOpen(false)}>Hủy bỏ</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreateTicket}>
                    Tạo phiếu tiếp nhận
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- CÁC PHẦN DƯỚI GIỮ NGUYÊN (BẢNG DANH SÁCH & DIALOG CHI TIẾT) --- */}
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
                          
                          {config.actionLabel && (
                            <Button 
                                size="sm" 
                                className={`h-8 min-w-20 shadow-sm text-xs font-medium ${config.actionClass}`}
                                onClick={() => handleStatusChange(apt.id, config.nextStatus)}
                            >
                                {config.actionLabel}
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