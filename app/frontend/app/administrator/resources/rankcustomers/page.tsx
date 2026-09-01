"use client"

import { useState, useEffect } from "react"
import { 
  Search, Filter, User, Crown, Star, 
  Gift, MoreHorizontal, Eye, ShieldCheck, AlertCircle,
  ChevronLeft, ChevronRight, Loader2, MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// --- TYPES ---
type Tier = "Cơ bản" | "Thân thiết" | "VIP"

interface Customer {
  id: string
  name: string
  phone: string
  branch: string
  totalSpendingYear: number
  loyaltyPoints: number
  lastVisit: string
  tier: Tier
}

// --- HELPER: FORMAT CURRENCY ---
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

// --- MOCK DATA GENERATOR ---
const generateLargeData = (count: number): Customer[] => {
  const firstNames = ["An", "Bình", "Chi", "Dũng", "Giang", "Hương", "Khánh", "Lan", "Minh", "Nga", "Oanh", "Phúc", "Quân", "Thảo", "Uyên", "Vinh", "Yến"]
  const lastNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng"]
  const branches = ["Quận 1", "Quận 3", "Quận 5", "Quận 7", "Quận 10", "Bình Thạnh", "Phú Nhuận", "Tân Bình", "Gò Vấp", "Thủ Đức"]
  
  return Array.from({ length: count }).map((_, i) => {
    // Random chi tiêu rộng hơn để test các trường hợp "Đủ tiêu chí"
    const spending = Math.floor(Math.random() * 20000000)
    
    // Logic tạo hạng ngẫu nhiên để có trường hợp hạng thấp nhưng tiền nhiều (chờ lên hạng)
    const randomTier = Math.random();
    let tier: Tier = "Cơ bản";
    if (randomTier > 0.85) tier = "VIP";
    else if (randomTier > 0.6) tier = "Thân thiết";
    else tier = "Cơ bản";

    return {
      id: `KH${(i + 1).toString().padStart(5, '0')}`,
      name: `${lastNames[Math.floor(Math.random() * lastNames.length)]} ${firstNames[Math.floor(Math.random() * firstNames.length)]}`,
      phone: `09${Math.floor(Math.random() * 90000000 + 10000000)}`,
      branch: `PetCareX ${branches[Math.floor(Math.random() * branches.length)]}`,
      totalSpendingYear: spending,
      loyaltyPoints: Math.floor(spending / 50000), 
      lastVisit: `2025-01-${Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0')}`,
      tier: tier
    }
  })
}

const DATABASE = generateLargeData(2500)

export default function CustomerMembershipPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [tierFilter, setTierFilter] = useState("all")
  const [branchFilter, setBranchFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [currentData, setCurrentData] = useState<Customer[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const itemsPerPage = 20

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      let filtered = DATABASE

      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase()
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(lowerTerm) || 
          c.phone.includes(lowerTerm) || 
          c.id.toLowerCase().includes(lowerTerm)
        )
      }

      if (tierFilter !== "all") {
        filtered = filtered.filter(c => c.tier === tierFilter)
      }

      if (branchFilter !== "all") {
        filtered = filtered.filter(c => c.branch === `PetCareX ${branchFilter}`)
      }

      setTotalItems(filtered.length)

      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      setCurrentData(filtered.slice(startIndex, endIndex))
      
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, tierFilter, branchFilter, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, tierFilter, branchFilter])

  // --- LOGIC TIẾN ĐỘ & GIỮ HẠNG (UPDATED) ---
  const getTierProgress = (spending: number, currentTier: Tier) => {
    // 1. VIP (Cao nhất) -> Chỉ cần giữ hạng
    if (currentTier === "VIP") {
      const maintainTarget = 8000000 
      
      if (spending >= maintainTarget) {
          return { percent: 100, message: "Đã đạt giữ hạng", color: "bg-green-500", status: "ok" }
      } else {
          const percent = (spending / maintainTarget) * 100
          return { percent: percent, message: `Thiếu ${formatCurrency(maintainTarget - spending)} giữ hạng`, color: "bg-yellow-500", status: "warning" }
      }
    } 
    
    // 2. Thân thiết -> Có 2 mốc: Giữ hạng & Lên VIP
    else if (currentTier === "Thân thiết") {
      const maintainTarget = 3000000
      const upgradeTarget = 12000000

      // Case 1: Nguy cơ rớt hạng
      if (spending < maintainTarget) {
          const percent = (spending / maintainTarget) * 100
          return { percent: percent, message: `Thiếu ${formatCurrency(maintainTarget - spending)} giữ hạng`, color: "bg-red-500", status: "danger" }
      } 
      // Case 2: Đã đủ điểm lên VIP (nhưng hệ thống chưa cập nhật hạng)
      else if (spending >= upgradeTarget) {
          return { percent: 100, message: "Đã đủ tiêu chí lên hạng VIP", color: "bg-green-500", status: "ok" }
      }
      // Case 3: Đang phấn đấu lên VIP
      else {
          const percent = (spending / upgradeTarget) * 100
          return { percent: percent, message: `Thiếu ${formatCurrency(upgradeTarget - spending)} lên VIP`, color: "bg-indigo-600", status: "ok" }
      }
    } 
    
    // 3. Cơ bản -> Lên Thân thiết
    else {
      const nextTarget = 5000000
      
      // Case: Đã đủ tiền lên Thân thiết
      if (spending >= nextTarget) {
          return { percent: 100, message: "Đã đủ tiêu chí lên hạng Thân thiết", color: "bg-green-500", status: "ok" }
      }
      
      // Case: Chưa đủ
      const percent = (spending / nextTarget) * 100
      return { percent: percent, message: `Thiếu ${formatCurrency(nextTarget - spending)} lên Thân thiết`, color: "bg-slate-600", status: "normal" }
    }
  }

  const renderTierBadge = (tier: Tier) => {
    switch(tier) {
      case "VIP": return <Badge className="bg-yellow-500 hover:bg-yellow-600 gap-1 min-w-[90px] justify-center"><Crown className="w-3 h-3"/> VIP</Badge>
      case "Thân thiết": return <Badge className="bg-blue-500 hover:bg-blue-600 gap-1 min-w-[90px] justify-center"><ShieldCheck className="w-3 h-3"/> Thân thiết</Badge>
      default: return <Badge variant="secondary" className="gap-1 min-w-[90px] justify-center">Cơ bản</Badge>
    }
  }

  const totalVIP = DATABASE.filter(c => c.tier === "VIP").length
  const totalLoyal = DATABASE.filter(c => c.tier === "Thân thiết").length

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hội viên & Khách hàng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý {DATABASE.length.toLocaleString()} khách hàng trên 10 chi nhánh.
          </p>
        </div>
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white">
                    <AlertCircle className="w-4 h-4" /> Chính sách hội viên
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Chính sách Hạng thẻ</DialogTitle></DialogHeader>
                <div className="space-y-4 text-sm">
                    <p>• <strong>Điểm Loyalty:</strong> 50.000đ = 1 điểm.</p>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 bg-slate-100 rounded"><strong>Cơ bản</strong><br/>Mặc định</div>
                        <div className="p-2 bg-blue-50 rounded text-blue-700">
                            <strong>Thân thiết</strong><br/>
                            Lên: ≥ 5Tr<br/>
                            <span className="text-red-600 font-semibold">Giữ: ≥ 3Tr</span>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded text-yellow-700">
                            <strong>VIP</strong><br/>
                            Lên: ≥ 12Tr<br/>
                            <span className="text-red-600 font-semibold">Giữ: ≥ 8Tr</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng Data KH</CardTitle>
            <User className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{DATABASE.length.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">VIP</CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{totalVIP.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Thân thiết</CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{totalLoyal.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng điểm cấp</CardTitle>
            <Gift className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">
                {DATABASE.reduce((acc, curr) => acc + curr.loyaltyPoints, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN CONTENT */}
      <Card>
        <CardHeader className="px-6 py-4 border-b">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
             <div className="relative w-full lg:w-96">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Tìm tên, SĐT, Mã KH..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
             </div>
             
             <div className="flex gap-2 w-full lg:w-auto overflow-x-auto">
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger className="w-[180px]">
                        <MapPin className="w-4 h-4 mr-2 text-muted-foreground"/>
                        <SelectValue placeholder="Chi nhánh" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                        <SelectItem value="Quận 1">Quận 1</SelectItem>
                        <SelectItem value="Quận 7">Quận 7</SelectItem>
                        <SelectItem value="Bình Thạnh">Bình Thạnh</SelectItem>
                        <SelectItem value="Gò Vấp">Gò Vấp</SelectItem>
                        <SelectItem value="Thủ Đức">Thủ Đức</SelectItem>
                        {/* Thêm các chi nhánh khác */}
                    </SelectContent>
                </Select>

                <Select value={tierFilter} onValueChange={setTierFilter}>
                    <SelectTrigger className="w-40">
                        <Filter className="w-4 h-4 mr-2 text-muted-foreground"/>
                        <SelectValue placeholder="Hạng thẻ" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả hạng</SelectItem>
                        <SelectItem value="Cơ bản">Cơ bản</SelectItem>
                        <SelectItem value="Thân thiết">Thân thiết</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                    </SelectContent>
                </Select>
             </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 relative min-h-[400px]">
            {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            ) : (
                <>
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="min-w-[200px] pl-10">Khách hàng</TableHead>
                            <TableHead className="min-w-[180px]">Chi nhánh</TableHead>
                            <TableHead className="text-center">Hạng</TableHead>
                            <TableHead className="text-right">Chi tiêu (Năm)</TableHead>
                            <TableHead className="w-[200px] text-center">Tiến độ</TableHead>
                            <TableHead className="text-center">Điểm</TableHead>
                            <TableHead className="text-center">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentData.length > 0 ? currentData.map((customer) => {
                            const progress = getTierProgress(customer.totalSpendingYear, customer.tier)
                            return (
                                <TableRow key={customer.id}>
                                    <TableCell className="pl-10">
                                        <div className="flex flex-col">
                                            <div className="font-medium text-slate-900">{customer.name}</div>
                                            <div className="text-xs text-muted-foreground">{customer.id} • {customer.phone}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-600 flex items-center gap-1">
                                                <MapPin className="w-3 h-3"/> {customer.branch}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center">
                                            {renderTierBadge(customer.tier)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(customer.totalSpendingYear)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col items-center space-y-1">
                                            <Progress 
                                                value={progress.percent} 
                                                className={`h-1.5 w-full [&>div]:${progress.color}`} 
                                            />
                                            <p className={`text-[10px] text-center truncate w-full ${progress.status === 'danger' ? 'text-red-600 font-bold' : progress.status === 'warning' ? 'text-yellow-600 font-medium' : 'text-muted-foreground'}`} title={progress.message}>
                                                {progress.message}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="font-bold text-pink-600">{customer.loyaltyPoints}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => {setSelectedCustomer(customer); setIsDialogOpen(true)}}>
                                                        <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem><Gift className="mr-2 h-4 w-4" /> Đổi điểm</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        }) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">Không tìm thấy khách hàng nào.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <div className="p-4 border-t flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                        Hiển thị <strong>{currentData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> - <strong>{Math.min(currentPage * itemsPerPage, totalItems)}</strong> trên <strong>{totalItems}</strong> khách hàng
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" size="sm" 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1"/> Trước
                        </Button>
                        <Button 
                            variant="outline" size="sm" 
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage * itemsPerPage >= totalItems}
                        >
                            Sau <ChevronRight className="w-4 h-4 ml-1"/>
                        </Button>
                    </div>
                </div>
                </>
            )}
        </CardContent>
      </Card>

      {/* MODAL CHI TIẾT */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
            {selectedCustomer && (
                <>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        {selectedCustomer.name} {renderTierBadge(selectedCustomer.tier)}
                    </DialogTitle>
                    <div className="text-sm text-slate-500 space-y-1">
                        <p>Mã KH: {selectedCustomer.id} | SĐT: {selectedCustomer.phone}</p>
                        <p className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {selectedCustomer.branch}</p>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="p-4 bg-slate-50 rounded border">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Tổng chi tiêu (Năm)</h4>
                        <div className="text-2xl font-bold text-slate-800">{formatCurrency(selectedCustomer.totalSpendingYear)}</div>
                        <div className={`mt-2 text-xs ${getTierProgress(selectedCustomer.totalSpendingYear, selectedCustomer.tier).status === 'danger' ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                            {getTierProgress(selectedCustomer.totalSpendingYear, selectedCustomer.tier).message}
                        </div>
                    </div>
                    <div className="p-4 bg-pink-50 rounded border border-pink-100">
                        <h4 className="text-xs font-semibold text-pink-600 mb-1 uppercase">Điểm thưởng</h4>
                        <div className="text-2xl font-bold text-pink-700">{selectedCustomer.loyaltyPoints}</div>
                        <div className="mt-2 text-xs text-pink-600">
                            ~ {formatCurrency(selectedCustomer.loyaltyPoints * 50000)} doanh số
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="history" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="history">Lịch sử chi tiêu</TabsTrigger>
                        <TabsTrigger value="points">Lịch sử điểm</TabsTrigger>
                    </TabsList>
                    <TabsContent value="history" className="mt-2 border rounded-md h-[200px] overflow-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Ngày</TableHead><TableHead>Dịch vụ</TableHead><TableHead className="text-right">Giá trị</TableHead></TableRow></TableHeader>
                            <TableBody>
                                <TableRow><TableCell className="text-xs">{selectedCustomer.lastVisit}</TableCell><TableCell className="text-xs">Dịch vụ Spa (Gói VIP)</TableCell><TableCell className="text-right text-xs">{formatCurrency(1200000)}</TableCell></TableRow>
                                <TableRow><TableCell className="text-xs">2024-12-20</TableCell><TableCell className="text-xs">Mua thức ăn hạt</TableCell><TableCell className="text-right text-xs">{formatCurrency(550000)}</TableCell></TableRow>
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="points" className="mt-2 border rounded-md h-[200px] overflow-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Ngày</TableHead><TableHead>Nội dung</TableHead><TableHead className="text-right">Thay đổi</TableHead></TableRow></TableHeader>
                            <TableBody>
                                <TableRow><TableCell className="text-xs">{selectedCustomer.lastVisit}</TableCell><TableCell className="text-xs">Tích điểm HĐ #999</TableCell><TableCell className="text-right text-xs text-green-600 font-bold">+24</TableCell></TableRow>
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>
                </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  )
}