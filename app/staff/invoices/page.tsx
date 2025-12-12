"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Search, 
  Filter, 
  Eye, 
  ArrowUpDown,
  Calendar as CalendarIcon,
  Download,
  Printer,
  CreditCard, // Icon thanh toán
  Trash2      // Icon hủy
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// --- DỮ LIỆU GIẢ LẬP BAN ĐẦU ---
const initialInvoices = [
  {
    id: "HD243",
    customer: "Hồ Nguyễn Nam Phương",
    phone: "0336726684",
    pet: "Mochi",
    date: "17/08/2025 10:14",
    total: 543000,
    status: "paid",
    paymentMethod: "Tiền mặt + CK",
    items: [
        { name: "Tắm chó 2.1-5kg", qty: 1, price: 280000 },
        { name: "Vắc-xin 4 bệnh Mèo", qty: 1, price: 350000 },
        { name: "Pate Whiskas", qty: 5, price: 13000 }
    ]
  },
  {
    id: "HD240",
    customer: "Trần Văn B",
    phone: "0987654321",
    pet: "Lu",
    date: "17/08/2025 09:30",
    total: 120000,
    status: "unpaid",
    paymentMethod: "-",
    items: [
        { name: "Khám lâm sàng", qty: 1, price: 100000 },
        { name: "Thuốc nhỏ mắt", qty: 1, price: 20000 }
    ]
  },
  {
    id: "HD238",
    customer: "Lê Thị C",
    phone: "0912345678",
    pet: "Mimi",
    date: "16/08/2025 15:45",
    total: 850000,
    status: "paid",
    paymentMethod: "Chuyển khoản",
    items: [
        { name: "Thức ăn Royal Canin 2kg", qty: 1, price: 450000 },
        { name: "Vắc-xin 7 bệnh", qty: 1, price: 400000 }
    ]
  },
]

// Helper function map trạng thái sang UI
const getStatusBadge = (status: string) => {
    switch (status) {
        case "paid":
            return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Đã thanh toán</Badge>;
        case "unpaid":
            return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">Chưa thanh toán</Badge>;
        case "cancelled":
            return <Badge variant="outline" className="text-muted-foreground bg-slate-100">Đã hủy</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Load dữ liệu từ LocalStorage khi vào trang
  useEffect(() => {
      // 1. Lấy dữ liệu từ bộ nhớ trình duyệt
      const storedInvoices = localStorage.getItem('mockInvoices')
      
      if (storedInvoices) {
          const parsedInvoices = JSON.parse(storedInvoices)
          
          // 2. Gộp dữ liệu mới (từ POS) với dữ liệu mẫu (initialInvoices)
          // Lọc bỏ những hóa đơn trùng ID trong initialInvoices để ưu tiên dữ liệu mới nhất
          const combinedInvoices = [
              ...parsedInvoices, 
              ...initialInvoices.filter(init => !parsedInvoices.find((p: any) => p.id === init.id))
          ]
          
          setInvoices(combinedInvoices)
      }
  }, [])

  // Hàm xử lý hủy hóa đơn
  const handleCancelInvoice = (id: string) => {
    if (confirm(`Bạn có chắc chắn muốn hủy hóa đơn ${id}?`)) {
      const updatedList = invoices.map(inv => 
        inv.id === id ? { ...inv, status: "cancelled" } : inv
      )
      setInvoices(updatedList)
      
      // Cập nhật vào localStorage để đồng bộ
      const storedInvoices = JSON.parse(localStorage.getItem('mockInvoices') || '[]')
      const newStored = storedInvoices.map((inv: any) => inv.id === id ? { ...inv, status: "cancelled" } : inv)
      
      // Nếu hóa đơn này chưa có trong storage (là data mẫu), ta thêm vào
      if (!newStored.find((inv: any) => inv.id === id)) {
         const targetInv = updatedList.find(i => i.id === id)
         if(targetInv) newStored.push(targetInv)
      }
      
      localStorage.setItem('mockInvoices', JSON.stringify(newStored))
    }
  }
  
  // Logic lọc
  const filteredInvoices = invoices.filter(inv => {
      const matchSearch = 
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        inv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.phone.includes(searchTerm);
      
      const matchStatus = statusFilter === "all" || inv.status === statusFilter;

      return matchSearch && matchStatus;
  })

  // Tính toán nhanh
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const pendingCount = invoices.filter(i => i.status === 'unpaid').length;

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý hóa đơn</h1>
            <p className="text-muted-foreground">Theo dõi lịch sử giao dịch và trạng thái thanh toán.</p>
        </div>
        <div className="flex gap-4">
            <Card className="p-3 flex items-center gap-3 shadow-sm border bg-emerald-50/50">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">$</div>
                <div>
                    <p className="text-xs text-muted-foreground">Doanh thu tạm tính</p>
                    <p className="font-bold text-emerald-700">{totalRevenue.toLocaleString()}đ</p>
                </div>
            </Card>
            <Card className="p-3 flex items-center gap-3 shadow-sm border bg-orange-50/50">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">!</div>
                <div>
                    <p className="text-xs text-muted-foreground">Chưa thanh toán</p>
                    <p className="font-bold text-orange-700">{pendingCount} hóa đơn</p>
                </div>
            </Card>
        </div>
      </div>

      {/* 2. Filters & Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
         <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Tìm theo Mã HĐ, Tên KH, SĐT..." 
                    className="pl-9 bg-slate-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground"/>
                        <SelectValue placeholder="Trạng thái" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="paid">Đã thanh toán</SelectItem>
                    <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
            </Select>
         </div>
         
         <div className="flex items-center gap-2">
             <Button variant="outline" className="gap-2">
                 <CalendarIcon className="w-4 h-4"/>
                 Hôm nay
             </Button>
             <Button variant="outline" size="icon">
                 <Download className="w-4 h-4"/>
             </Button>
         </div>
      </div>

      {/* 3. Table Data */}
      <Card className="shadow-sm border">
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="w-[100px] font-semibold">Mã HĐ</TableHead>
                        <TableHead className="font-semibold">Khách hàng</TableHead>
                        <TableHead className="font-semibold">Thời gian</TableHead>
                        <TableHead className="text-right font-semibold">Tổng tiền</TableHead>
                        <TableHead className="text-center font-semibold">Trạng thái</TableHead>
                        <TableHead className="text-right font-semibold">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((invoice) => (
                            <TableRow key={invoice.id} className="hover:bg-slate-50/50">
                                <TableCell className="font-medium text-primary cursor-pointer hover:underline">
                                    {invoice.id}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{invoice.customer}</span>
                                        <span className="text-xs text-muted-foreground">{invoice.phone} • {invoice.pet}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {invoice.date}
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                    {invoice.total.toLocaleString()}đ
                                </TableCell>
                                <TableCell className="text-center">
                                    {getStatusBadge(invoice.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end items-center gap-2">
                                        {/* 1. BUTTON XEM CHI TIẾT (Luôn hiện) */}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Xem chi tiết">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-lg">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center justify-between">
                                                        <span>Chi tiết hóa đơn {invoice.id}</span>
                                                        {getStatusBadge(invoice.status)}
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Ngày tạo: {invoice.date}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                
                                                <div className="space-y-4 py-4">
                                                    {/* Thông tin khách */}
                                                    <div className="grid grid-cols-2 gap-4 text-sm p-3 bg-slate-50 rounded-lg border">
                                                        <div>
                                                            <span className="text-muted-foreground block text-xs uppercase mb-1">Khách hàng</span>
                                                            <span className="font-medium">{invoice.customer}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground block text-xs uppercase mb-1">Số điện thoại</span>
                                                            <span>{invoice.phone}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground block text-xs uppercase mb-1">Thú cưng</span>
                                                            <span>{invoice.pet}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground block text-xs uppercase mb-1">Thanh toán</span>
                                                            <span>{invoice.paymentMethod}</span>
                                                        </div>
                                                    </div>

                                                    {/* List Items */}
                                                    <div className="border rounded-lg overflow-hidden">
                                                        <Table>
                                                            <TableHeader className="bg-slate-50">
                                                                <TableRow className="h-9">
                                                                    <TableHead className="text-xs">Tên hàng</TableHead>
                                                                    <TableHead className="text-xs text-center w-12">SL</TableHead>
                                                                    <TableHead className="text-xs text-right">Đơn giá</TableHead>
                                                                    <TableHead className="text-xs text-right">Thành tiền</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {invoice.items.map((item, idx) => (
                                                                    <TableRow key={idx} className="h-10">
                                                                        <TableCell className="text-sm py-1">{item.name}</TableCell>
                                                                        <TableCell className="text-sm text-center py-1">{item.qty}</TableCell>
                                                                        <TableCell className="text-sm text-right py-1">{item.price.toLocaleString()}</TableCell>
                                                                        <TableCell className="text-sm text-right font-medium py-1">{(item.price * item.qty).toLocaleString()}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>

                                                    {/* Total */}
                                                    <div className="flex justify-between items-center pt-2 border-t">
                                                        <span className="font-bold text-lg">Tổng cộng</span>
                                                        <span className="font-bold text-xl text-primary">{invoice.total.toLocaleString()}đ</span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-3">
                                                    <Button variant="outline" className="gap-2">
                                                        <Printer className="w-4 h-4" /> In hóa đơn
                                                    </Button>
                                                    {invoice.status === 'unpaid' && (
                                                        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                                                            <Link href={`/staff/pos?invoiceId=${invoice.id}`}>
                                                                Thanh toán ngay
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        {/* 2. BUTTON THANH TOÁN (Chỉ hiện khi chưa thanh toán) */}
                                        {invoice.status === 'unpaid' && (
                                            <Button asChild variant="outline" size="icon" className="h-8 w-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700" title="Thanh toán">
                                                <Link href={`/staff/pos?invoiceId=${invoice.id}`}>
                                                    <CreditCard className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                        )}

                                        {/* 3. BUTTON HỦY HÓA ĐƠN (Chỉ hiện khi chưa thanh toán) */}
                                        {invoice.status === 'unpaid' && (
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" 
                                                title="Hủy hóa đơn"
                                                onClick={() => handleCancelInvoice(invoice.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                Không tìm thấy hóa đơn nào phù hợp.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}