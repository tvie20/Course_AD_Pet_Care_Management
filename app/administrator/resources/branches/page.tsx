"use client"

import { useState } from "react"
import { 
  MapPin, Phone, User, Users, Building2, Plus, Search, MoreHorizontal, 
  Edit, Trash2, CheckCircle2, AlertCircle, Stethoscope, Briefcase, Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// --- TYPES ---
type BranchStatus = "Active" | "Maintenance" | "Closed"

interface Branch {
  id: string
  name: string
  address: string
  phone: string
  manager: string 
  staffDetail: {
    doctors: number
    reception: number
    sales: number
    manager: number
  }
  status: BranchStatus
}

// --- MOCK DATA ---
const generateBranches = (): Branch[] => {
  const locations = [
    { name: "Quận 1", addr: "123 Nguyễn Huệ" },
    { name: "Quận 3", addr: "45 Võ Văn Tần" },
    { name: "Quận 5", addr: "100 Nguyễn Trãi" },
    { name: "Quận 7", addr: "456 Nguyễn Thị Thập" },
    { name: "Quận 10", addr: "789 Đường 3/2" },
    { name: "Bình Thạnh", addr: "24 Xô Viết Nghệ Tĩnh" },
    { name: "Phú Nhuận", addr: "15 Phan Xích Long" },
    { name: "Tân Bình", addr: "88 Cộng Hòa" },
    { name: "Gò Vấp", addr: "30 Quang Trung" },
    { name: "Thủ Đức", addr: "12 Võ Văn Ngân" },
  ]

  return locations.map((loc, index) => {
    // Random số lượng để mô phỏng thực tế (Dữ liệu này được đồng bộ từ HR)
    const doctors = Math.floor(Math.random() * 3) + 5 // 5-7 bác sĩ
    const sales = Math.floor(Math.random() * 2) + 2   // 2-3 sales
    
    return {
      id: `CN${(index + 1).toString().padStart(2, '0')}`,
      name: `PetCareX ${loc.name}`,
      address: loc.addr,
      phone: `028 3823 00${index}`,
      manager: `Nguyễn Văn ${String.fromCharCode(65 + index)}`,
      staffDetail: {
        doctors: doctors,
        reception: 2, 
        sales: sales,
        manager: 1 
      },
      status: index === 5 ? "Maintenance" : "Active"
    }
  })
}

export default function BranchManagementPage() {
  const [branches, setBranches] = useState<Branch[]>(generateBranches())
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // State form chỉnh sửa (Không còn chứa staffDetail để sửa nữa)
  const [formData, setFormData] = useState<Branch>({
    id: "", name: "", address: "", phone: "", manager: "",
    staffDetail: { doctors: 0, reception: 0, sales: 0, manager: 0 }, // Chỉ để giữ type, không hiển thị input
    status: "Active"
  })
  const [isEditing, setIsEditing] = useState(false)

  const getTotalStaff = (b: Branch) => 
    b.staffDetail.doctors + b.staffDetail.reception + b.staffDetail.sales + b.staffDetail.manager

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // --- HANDLERS ---
  const handleAddNew = () => {
    setIsEditing(false)
    setFormData({
      id: `CN${branches.length + 1}`,
      name: "", address: "", phone: "", manager: "",
      staffDetail: { doctors: 0, reception: 0, sales: 0, manager: 0 }, // Mặc định 0, chờ HR tuyển dụng
      status: "Active"
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (branch: Branch) => {
    setIsEditing(true)
    setFormData({ ...branch })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Xóa chi nhánh này?")) {
      setBranches(branches.filter(b => b.id !== id))
    }
  }

  const handleSave = () => {
    if (isEditing) {
      setBranches(branches.map(b => b.id === formData.id ? formData : b))
    } else {
      setBranches([...branches, formData])
    }
    setIsDialogOpen(false)
  }

  const renderStatus = (status: BranchStatus) => {
    switch (status) {
      case "Active": return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 gap-1"><CheckCircle2 className="w-3 h-3"/> Hoạt động</Badge>
      case "Maintenance": return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 gap-1"><AlertCircle className="w-3 h-3"/> Bảo trì</Badge>
      case "Closed": return <Badge variant="destructive" className="gap-1">Đóng cửa</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Chi nhánh</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tổng hệ thống: {branches.length} chi nhánh. Tổng nhân sự: {branches.reduce((sum, b) => sum + getTotalStaff(b), 0)} người.
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Thêm chi nhánh mới
        </Button>
      </div>

      {/* Cards thống kê */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng chi nhánh</CardTitle>
            <Building2 className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.length}</div>
            <p className="text-xs text-muted-foreground">Active: {branches.filter(b => b.status === 'Active').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng nhân sự</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.reduce((sum, b) => sum + getTotalStaff(b), 0)}</div>
            <p className="text-xs text-muted-foreground">Đồng bộ từ hệ thống HR</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bác sĩ</CardTitle>
            <Stethoscope className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.reduce((sum, b) => sum + b.staffDetail.doctors, 0)}</div>
            <p className="text-xs text-muted-foreground">Đội ngũ chuyên môn</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vận hành</CardTitle>
            <Briefcase className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.reduce((sum, b) => sum + (b.staffDetail.manager + b.staffDetail.sales + b.staffDetail.reception), 0)}</div>
            <p className="text-xs text-muted-foreground">Sales, Tiếp tân, Quản lý</p>
          </CardContent>
        </Card>
      </div>

      {/* Bảng dữ liệu */}
      <Card>
        <CardHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách cơ sở</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Tìm kiếm..." 
                className="pl-8 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
            <TooltipProvider>
                <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                    {/* Căn giữa Header Mã CN */}
                    <TableHead className="w-20 text-center">Mã CN</TableHead>
                    
                    {/* Tên & Liên hệ giữ căn trái cho dễ đọc */}
                    <TableHead className="min-w-[200px]">Tên & Địa chỉ</TableHead>
                    <TableHead className="min-w-[200px]">Liên hệ</TableHead>
                    
                    {/* Căn giữa các cột còn lại */}
                    <TableHead className="text-center">Nhân sự (Hiện tại)</TableHead>
                    <TableHead className="text-center">Chi tiết NS</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-center">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredBranches.map((branch) => (
                    <TableRow key={branch.id}>
                        {/* 1. Mã CN: Căn giữa */}
                        <TableCell className="font-medium text-slate-600 text-center">{branch.id}</TableCell>
                        
                        {/* 2. Tên & Địa chỉ: Giữ nguyên (Căn trái) */}
                        <TableCell>
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-800">{branch.name}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {branch.address}
                            </span>
                        </div>
                        </TableCell>
                        
                        {/* 3. Liên hệ: Giữ nguyên (Căn trái) */}
                        <TableCell>
                        <div className="flex flex-col gap-1.5 text-sm">
                            <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center">
                                <Phone className="w-3.5 h-3.5 text-slate-600"/>
                            </div>
                            <span className="font-medium text-slate-700">{branch.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded bg-indigo-50 flex items-center justify-center">
                                <User className="w-3.5 h-3.5 text-indigo-600"/>
                            </div>
                            <span className="text-indigo-700 font-semibold text-xs">{branch.manager}</span>
                            </div>
                        </div>
                        </TableCell>

                        {/* 4. Tổng nhân sự: Căn giữa */}
                        <TableCell className="text-center">
                            <div className="flex justify-center">
                                <Badge variant="secondary" className="text-sm font-bold h-7 w-12 justify-center">
                                    {getTotalStaff(branch)}
                                </Badge>
                            </div>
                        </TableCell>

                        {/* 5. Chi tiết NS: Căn giữa */}
                        <TableCell className="text-center">
                            <div className="flex justify-center">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="text-xs text-muted-foreground flex gap-1 cursor-help justify-center">
                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border">{branch.staffDetail.doctors} BS</span>
                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border">{branch.staffDetail.reception} TT</span>
                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border">{branch.staffDetail.sales} Sale</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-semibold mb-1">{branch.name}</p>
                                        <ul className="text-xs space-y-1 text-left">
                                            <li>Quản lý: {branch.staffDetail.manager}</li>
                                            <li>Bác sĩ: {branch.staffDetail.doctors}</li>
                                            <li>Tiếp tân: {branch.staffDetail.reception}</li>
                                            <li>Sales: {branch.staffDetail.sales}</li>
                                        </ul>
                                        <p className="text-[10px] text-muted-foreground mt-2 italic">*Số liệu từ phòng Nhân sự</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </TableCell>

                        {/* 6. Trạng thái: Căn giữa */}
                        <TableCell className="text-center">
                            <div className="flex justify-center">
                                {renderStatus(branch.status)}
                            </div>
                        </TableCell>

                        {/* 7. Hành động: Căn giữa */}
                        <TableCell className="text-center">
                        <div className="flex justify-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEdit(branch)}>
                                    <Edit className="mr-2 h-4 w-4" /> Cập nhật thông tin
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(branch.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Xóa chi nhánh
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TooltipProvider>
        </CardContent>
      </Card>

      {/* DIALOG CHỈNH SỬA CHI TIẾT */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Cập nhật thông tin chi nhánh" : "Thêm chi nhánh mới"}</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cơ sở vật chất và liên hệ. Số lượng nhân sự được quản lý bởi phòng Nhân sự (HR).
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Thông tin chung */}
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Tên chi nhánh</Label>
                        <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    {/* Ô NHẬP TÊN NGƯỜI QUẢN LÝ */}
                    <div className="space-y-1">
                        <Label>Họ tên Quản lý</Label>
                        <div className="relative">
                            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9" value={formData.manager} onChange={(e) => setFormData({...formData, manager: e.target.value})} placeholder="VD: Nguyễn Văn A" />
                        </div>
                    </div>
                    <div className="space-y-1 col-span-2">
                        <Label>Địa chỉ</Label>
                        <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <Label>Số điện thoại</Label>
                        <div className="relative">
                            <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label>Trạng thái</Label>
                        <Select value={formData.status} onValueChange={(v: BranchStatus) => setFormData({...formData, status: v})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Đang hoạt động</SelectItem>
                                <SelectItem value="Maintenance">Bảo trì</SelectItem>
                                <SelectItem value="Closed">Đóng cửa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Thông báo về Nhân sự */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-start gap-3">
                <Users className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="text-sm">
                    <span className="font-semibold text-slate-700 block mb-1">Quản lý nhân sự</span>
                    <p className="text-slate-500">
                        Số lượng và điều chuyển nhân sự được thực hiện tại module 
                        <span className="font-medium text-indigo-600"> Quản lý Nhân sự (HR)</span>. 
                        Thông tin tại đây chỉ mang tính chất hiển thị và đồng bộ.
                    </p>
                </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy bỏ</Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                <Save className="w-4 h-4 mr-2" /> Lưu thông tin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}