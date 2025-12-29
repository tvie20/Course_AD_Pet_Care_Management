"use client"

import { useState, useMemo } from "react"
import { 
  Search, Plus, FileText, MoreHorizontal, 
  UserCheck, UserX, Building2, 
  Download, Calculator, CreditCard, Banknote, Calendar, Printer,
  History, Save, User, Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// --- TYPES & INTERFACES ---
type Role = "Quản lý" | "Bác sĩ" | "Tiếp tân" | "Sales"
type Status = "Active" | "Leave" | "Resigned"

// Mô phỏng bảng SQL: LichSuCongTac (MaNV, MaCN, NgayVaoLam, NgayChuyenCT, ChucVu, LuongCoBan)
interface WorkHistory {
  branch: string      // MaCN
  role: Role          // ChucVu
  startDate: string   // NgayVaoLam
  endDate: string | null // NgayChuyenCT (null = đang làm)
  baseSalary: number  // LuongCoBan (lúc đó)
}

interface Employee {
  id: string
  name: string
  role: Role
  branch: string
  phone: string
  joinDate: string // Ngày vào làm (tổng thể)
  status: Status
  salary: {
    base: number
    allowance: number
    bonus: number
    deduction: number
  }
  workHistory: WorkHistory[] // Danh sách lịch sử điều động
}

// --- MOCK DATA ---
const BRANCHES = ["PetCareX Quận 1", "PetCareX Quận 3", "PetCareX Quận 5", "PetCareX Quận 7", "PetCareX Quận 10", "PetCareX Bình Thạnh", "PetCareX Phú Nhuận", "PetCareX Tân Bình", "PetCareX Gò Vấp", "PetCareX Thủ Đức"]
const ROLES: Role[] = ["Quản lý", "Bác sĩ", "Tiếp tân", "Sales"]

const generateEmployees = (): Employee[] => {
  const firstNames = ["An", "Bình", "Cường", "Dũng", "Giang", "Hương", "Khánh", "Lan"]
  const lastNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng"]

  const employees: Employee[] = []
  
  // Tạo dữ liệu mẫu
  BRANCHES.forEach((branch, bIdx) => {
    employees.push(createEmp(bIdx, 0, "Quản lý", branch, firstNames, lastNames))
    for(let i=0; i<2; i++) employees.push(createEmp(bIdx, i+1, "Bác sĩ", branch, firstNames, lastNames))
  })
  return employees
}

const createEmp = (bIdx: number, idx: number, role: Role, branch: string, f: string[], l: string[]): Employee => {
  const baseSalaries = { "Quản lý": 25000000, "Bác sĩ": 18000000, "Tiếp tân": 8000000, "Sales": 9000000 }
  const baseSalary = baseSalaries[role] + Math.floor(Math.random() * 2000000)
  const joinDate = "2023-01-15"

  return {
    id: `NV${(bIdx * 10 + idx + 1).toString().padStart(3, '0')}`,
    name: `${l[Math.floor(Math.random()*l.length)]} ${f[Math.floor(Math.random()*f.length)]}`,
    role: role,
    branch: branch,
    phone: `09${Math.floor(Math.random()*100000000)}`,
    joinDate: joinDate,
    status: "Active",
    salary: {
      base: baseSalary,
      allowance: role === "Bác sĩ" ? 2000000 : 1000000,
      bonus: 2123606, // Số lẻ cho giống thật
      deduction: 1000000
    },
    // Khởi tạo lịch sử công tác ban đầu
    workHistory: [
        {
            branch: branch,
            role: role,
            startDate: joinDate,
            endDate: null,
            baseSalary: baseSalary
        }
    ]
  }
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

export default function HRAndPayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>(generateEmployees())
  const [searchTerm, setSearchTerm] = useState("")
  const [branchFilter, setBranchFilter] = useState("all")
  
  // States cho Modal
  const [isPayslipOpen, setIsPayslipOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false) // True = Sửa, False = Thêm mới
  
  // Selected Employee cho Payslip
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  // Form Data state
  const [formData, setFormData] = useState<Employee | null>(null)

  // --- FILTER ---
  const filteredData = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchBranch = branchFilter === "all" || emp.branch === branchFilter
      return matchSearch && matchBranch
    })
  }, [employees, searchTerm, branchFilter])

  const totalPayroll = filteredData.reduce((sum, emp) => sum + (emp.salary.base + emp.salary.allowance + emp.salary.bonus - emp.salary.deduction), 0)
  const avgSalary = totalPayroll / (filteredData.length || 1)

  // --- HANDLERS ---

  // 1. Mở form Thêm mới
  const handleOpenAdd = () => {
    setIsEditMode(false)
    const newId = `NV${(employees.length + 1).toString().padStart(3, '0')}`
    const today = new Date().toISOString().split('T')[0]
    setFormData({
        id: newId,
        name: "",
        phone: "",
        branch: BRANCHES[0],
        role: "Bác sĩ",
        joinDate: today,
        status: "Active",
        salary: { base: 15000000, allowance: 0, bonus: 0, deduction: 0 },
        workHistory: [] // Sẽ được tạo khi save
    })
    setIsEditOpen(true)
  }

  // 2. Mở form Sửa (Điều động)
  const handleOpenEdit = (emp: Employee) => {
    setIsEditMode(true)
    // Clone object để tránh mutate state trực tiếp
    setFormData(JSON.parse(JSON.stringify(emp))) 
    setIsEditOpen(true)
  }

  // 3. Lưu (Thêm mới hoặc Cập nhật Điều động)
  const handleSaveEmployee = () => {
    if (!formData) return;

    if (isEditMode) {
        // --- LOGIC ĐIỀU ĐỘNG (TRANSFER LOGIC) ---
        const originalEmp = employees.find(e => e.id === formData.id)
        if (originalEmp) {
            // Kiểm tra xem có thay đổi Chi nhánh hoặc Chức vụ không
            const isTransfer = (originalEmp.branch !== formData.branch) || (originalEmp.role !== formData.role)
            
            let updatedHistory = [...formData.workHistory]
            
            if (isTransfer) {
                const today = new Date().toISOString().split('T')[0]
                
                // 1. Kết thúc công tác cũ (Cập nhật NgayChuyenCT cho record đang active)
                updatedHistory = updatedHistory.map(h => {
                    if (h.endDate === null) {
                        return { ...h, endDate: today }
                    }
                    return h
                })

                // 2. Thêm công tác mới (Điều động)
                updatedHistory.push({
                    branch: formData.branch,
                    role: formData.role,
                    startDate: today,
                    endDate: null,
                    baseSalary: formData.salary.base
                })
            } else {
                // Nếu không điều động, chỉ cập nhật lương/thông tin cho record hiện tại
                updatedHistory = updatedHistory.map(h => {
                    if (h.endDate === null) {
                        return { ...h, baseSalary: formData.salary.base }
                    }
                    return h
                })
            }

            const updatedEmp = { ...formData, workHistory: updatedHistory }
            setEmployees(employees.map(e => e.id === formData.id ? updatedEmp : e))
        }
    } else {
        // --- LOGIC THÊM MỚI ---
        const newEmp = { ...formData }
        // Tạo history record đầu tiên
        newEmp.workHistory = [{
            branch: newEmp.branch,
            role: newEmp.role,
            startDate: newEmp.joinDate,
            endDate: null,
            baseSalary: newEmp.salary.base
        }]
        setEmployees([...employees, newEmp])
    }
    setIsEditOpen(false)
  }

  // Helper cho PDF/Excel
  const handleExportExcel = () => { alert("Đang xuất file Excel...") }
  const handlePrintPayslip = () => { window.print() }

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nhân sự & Điều động</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý hồ sơ, lịch sử công tác và tiền lương.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-white" onClick={handleExportExcel}>
                <Download className="w-4 h-4" /> Xuất Excel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2" onClick={handleOpenAdd}>
                <Plus className="w-4 h-4" /> Thêm nhân viên
            </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng nhân sự</CardTitle>
            <UserCheck className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{filteredData.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quỹ lương tháng</CardTitle>
            <Banknote className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-700">{formatCurrency(totalPayroll)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lương trung bình</CardTitle>
            <Calculator className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(avgSalary)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kỳ trả lương</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">05/02/2025</div></CardContent>
        </Card>
      </div>

      {/* MAIN TABLE */}
      <Card>
        <CardHeader className="px-6 py-4 border-b">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
             <div className="relative w-full md:w-72">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Tìm tên hoặc mã NV..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
             
             <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-[200px]"><Building2 className="w-4 h-4 mr-2 text-muted-foreground"/><SelectValue placeholder="Chi nhánh" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                    {BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
             </Select>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="pl-10">Nhân viên</TableHead>
                        <TableHead>Chức vụ & Nơi làm</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Lương cơ bản</TableHead>
                        <TableHead className="text-right">Thực lãnh (Net)</TableHead>
                        <TableHead className="text-right pr-10">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.slice(0, 10).map((emp) => {
                        const netSalary = emp.salary.base + emp.salary.allowance + emp.salary.bonus - emp.salary.deduction
                        return (
                            <TableRow key={emp.id}>
                                <TableCell>
                                    <div className="flex flex-col pl-10">
                                        <div className="font-medium text-slate-900">{emp.name}</div>
                                        <div className="text-xs text-muted-foreground">{emp.id} • {emp.phone}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <Badge variant="outline" className="w-fit">{emp.role}</Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Building2 className="w-3 h-3"/> {emp.branch}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${emp.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {emp.status === 'Active' ? 'Đang làm việc' : 'Đã nghỉ'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-medium text-slate-600">{formatCurrency(emp.salary.base)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="font-bold text-emerald-700">{formatCurrency(netSalary)}</div>
                                </TableCell>
                                <TableCell className="text-right pr-10">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => { setSelectedEmployee(emp); setIsPayslipOpen(true); }}>
                                                <FileText className="mr-2 h-4 w-4" /> Xem phiếu lương
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleOpenEdit(emp)}>
                                                <UserCheck className="mr-2 h-4 w-4" /> Sửa hồ sơ & Điều động
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">
                                                <UserX className="mr-2 h-4 w-4" /> Cho nghỉ việc
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* MODAL THÊM / SỬA NHÂN VIÊN */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
                <DialogTitle>{isEditMode ? "Chỉnh sửa hồ sơ & Điều động" : "Thêm nhân viên mới"}</DialogTitle>
                <DialogDescription>
                    {isEditMode ? "Thay đổi Chi nhánh hoặc Chức vụ sẽ tự động lưu vào Lịch sử công tác." : "Nhập thông tin nhân viên mới vào hệ thống."}
                </DialogDescription>
            </DialogHeader>

            {formData && (
                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="info">Thông tin & Công tác</TabsTrigger>
                        {isEditMode && <TabsTrigger value="history">Lịch sử công tác</TabsTrigger>}
                    </TabsList>

                    {/* TAB 1: THÔNG TIN CHÍNH */}
                    <TabsContent value="info" className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Mã nhân viên</Label>
                                <Input value={formData.id} disabled className="bg-slate-100 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label>Họ và tên</Label>
                                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Số điện thoại</Label>
                                <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Ngày vào làm</Label>
                                <Input type="date" value={formData.joinDate} onChange={(e) => setFormData({...formData, joinDate: e.target.value})} disabled={isEditMode} />
                            </div>
                        </div>

                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 space-y-4">
                            <h4 className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
                                <Briefcase className="w-4 h-4"/> Thông tin công tác (Hiện tại)
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Chi nhánh làm việc</Label>
                                    <Select value={formData.branch} onValueChange={(v) => setFormData({...formData, branch: v})}>
                                        <SelectTrigger className="bg-white"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            {BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Chức vụ / Vị trí</Label>
                                    <Select value={formData.role} onValueChange={(v: Role) => setFormData({...formData, role: v})}>
                                        <SelectTrigger className="bg-white"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-700">Cấu hình lương & Phụ cấp</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Lương cơ bản</Label>
                                    <Input type="number" value={formData.salary.base} onChange={(e) => setFormData({...formData, salary: {...formData.salary, base: Number(e.target.value)}})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phụ cấp</Label>
                                    <Input type="number" value={formData.salary.allowance} onChange={(e) => setFormData({...formData, salary: {...formData.salary, allowance: Number(e.target.value)}})} />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB 2: LỊCH SỬ CÔNG TÁC (Tương ứng SQL: LichSuCongTac) */}
                    {isEditMode && (
                        <TabsContent value="history" className="py-4">
                            <div className="border rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead>Chi nhánh</TableHead>
                                            <TableHead>Chức vụ</TableHead>
                                            <TableHead>Ngày bắt đầu</TableHead>
                                            <TableHead>Ngày kết thúc</TableHead>
                                            <TableHead className="text-right">Lương CB</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {formData.workHistory && formData.workHistory.length > 0 ? (
                                            [...formData.workHistory].reverse().map((h, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium text-xs">{h.branch}</TableCell>
                                                    <TableCell className="text-xs">{h.role}</TableCell>
                                                    <TableCell className="text-xs text-green-600">{h.startDate}</TableCell>
                                                    <TableCell className="text-xs text-red-500">
                                                        {h.endDate ? h.endDate : <Badge variant="secondary" className="text-[10px]">Hiện tại</Badge>}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs">{formatCurrency(h.baseSalary)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-4">Chưa có lịch sử điều động</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            )}

            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>Hủy bỏ</Button>
                <Button onClick={handleSaveEmployee} className="bg-indigo-600 hover:bg-indigo-700">
                    <Save className="w-4 h-4 mr-2"/> {isEditMode ? "Lưu thay đổi" : "Tạo nhân viên"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL PHIẾU LƯƠNG (GIỮ NGUYÊN GIAO DIỆN CŨ) */}
      <Dialog open={isPayslipOpen} onOpenChange={setIsPayslipOpen}>
        <DialogContent className="sm:max-w-[600px] print:max-w-full print:shadow-none print:border-none">
          {selectedEmployee && (
             <>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-indigo-600"/> Phiếu Lương Chi Tiết</DialogTitle>
                    <DialogDescription>Kỳ lương Tháng 01/2025</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="flex justify-between items-start bg-slate-50 p-4 rounded-lg border">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">{selectedEmployee.name}</h3>
                            <p className="text-sm text-slate-500">{selectedEmployee.id} - {selectedEmployee.role}</p>
                            <p className="text-xs text-slate-400 mt-1">{selectedEmployee.branch}</p>
                        </div>
                        <div className="text-right">
                            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Chính thức</Badge>
                            <p className="text-xs text-slate-400 mt-2">Ngày công: 26/26</p> 
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-emerald-600 border-b pb-1">KHOẢN THU NHẬP</h4>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Lương cơ bản:</span>
                                <span className="font-medium">{formatCurrency(selectedEmployee.salary.base)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Phụ cấp trách nhiệm:</span>
                                <span className="font-medium">{formatCurrency(selectedEmployee.salary.allowance)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Thưởng doanh số/ca:</span>
                                <span className="font-medium">{formatCurrency(selectedEmployee.salary.bonus)}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t font-bold">
                                <span>Tổng thu nhập:</span>
                                <span>{formatCurrency(selectedEmployee.salary.base + selectedEmployee.salary.allowance + selectedEmployee.salary.bonus)}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-red-600 border-b pb-1">KHOẢN KHẤU TRỪ</h4>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">BHXH (8%):</span>
                                <span className="font-medium text-red-600">-{formatCurrency(selectedEmployee.salary.deduction * 0.6)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">BHYT (1.5%):</span>
                                <span className="font-medium text-red-600">-{formatCurrency(selectedEmployee.salary.deduction * 0.3)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Thuế TNCN:</span>
                                <span className="font-medium text-red-600">-{formatCurrency(selectedEmployee.salary.deduction * 0.1)}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t font-bold">
                                <span>Tổng khấu trừ:</span>
                                <span className="text-red-600">-{formatCurrency(selectedEmployee.salary.deduction)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-lg flex justify-between items-center border border-indigo-100">
                        <div><span className="text-sm font-semibold text-indigo-800 block">THỰC LÃNH (NET)</span>
                        <span className="text-xs text-indigo-500">Đã chuyển khoản vào Techcombank</span></div>
                        <div className="text-2xl font-bold text-indigo-700">
                            {formatCurrency(selectedEmployee.salary.base + selectedEmployee.salary.allowance + selectedEmployee.salary.bonus - selectedEmployee.salary.deduction)}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPayslipOpen(false)}>Đóng</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handlePrintPayslip}><Printer className="w-4 h-4 mr-2"/> In phiếu lương</Button>
                </DialogFooter>
             </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}