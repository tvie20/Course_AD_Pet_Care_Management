"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Search, Filter, Eye, ArrowUpDown, Calendar as CalendarIcon, 
  Download, Printer, CreditCard, Trash2, Loader2,
  ChevronLeft, ChevronRight 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const getStatusBadge = (status: string) => {
    switch (status) {
        case "paid": return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Đã thanh toán</Badge>;
        case "unpaid": return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">Chưa thanh toán</Badge>;
        case "cancelled": return <Badge variant="outline" className="text-muted-foreground bg-slate-100">Đã hủy</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const LIMIT = 20

  // Detail Modal
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [invoiceItems, setInvoiceItems] = useState<any[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)

  const getAuthHeader = () => {
    const token = localStorage.getItem("staffAccessToken")
    const userStr = localStorage.getItem("staffUser")
    if (!token || !userStr) return null
    const user = JSON.parse(userStr)
    return {
      "Content-Type": "application/json",
      "authorization": token,
      "x-client-id": user.MaNV
    }
  }

  const fetchInvoices = async (currentPage: number) => {
    setLoading(true)
    const headers = getAuthHeader()
    if (!headers) return

    try {
        const queryParams = new URLSearchParams({
            search: searchTerm,
            status: statusFilter,
            page: currentPage.toString(),
            limit: LIMIT.toString()
        })

        const res = await fetch(`http://localhost:3055/api/staff/invoices?${queryParams.toString()}`, { headers })
        
        if (res.ok) {
            const data = await res.json()
            const { list, total } = data.metadata
            setInvoices(list)
            setTotalPages(Math.ceil(total / LIMIT))
        }
    } catch (error) {
        console.error(error)
    } finally {
        setLoading(false)
    }
  }

  const fetchInvoiceItems = async (invoiceId: string) => {
      setItemsLoading(true)
      setInvoiceItems([])
      const headers = getAuthHeader()
      if (!headers) return

      try {
          const res = await fetch(`http://localhost:3055/api/staff/invoices/${invoiceId}/items`, { headers })
          if (res.ok) {
              const data = await res.json()
              setInvoiceItems(data.metadata)
          }
      } catch (error) {
          console.error(error)
      } finally {
          setItemsLoading(false)
      }
  }

  // Effect load data
  useEffect(() => {
      const timer = setTimeout(() => {
          setPage(1)
          fetchInvoices(1)
      }, 500)
      return () => clearTimeout(timer)
  }, [searchTerm, statusFilter])

  // Pagination Handler
  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setPage(newPage)
          fetchInvoices(newPage)
      }
  }

  // View Detail Handler
  const handleViewDetail = (invoice: any) => {
      setSelectedInvoice(invoice)
      fetchInvoiceItems(invoice.id)
  }

  // --- Tính toán thống kê nhanh (Trên trang hiện tại) ---
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const pendingCount = invoices.filter(i => i.status === 'unpaid').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý hóa đơn</h1>
            <p className="text-muted-foreground">Theo dõi lịch sử giao dịch và trạng thái thanh toán.</p>
        </div>
        <div className="flex gap-4">
            <Card className="p-3 flex items-center gap-3 shadow-sm border bg-emerald-50/50">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">$</div>
                <div>
                    <p className="text-xs text-muted-foreground">Doanh thu (trang này)</p>
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

      <Card className="shadow-sm border">
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="w-[120px] font-semibold">Mã HĐ</TableHead>
                        <TableHead className="font-semibold">Khách hàng</TableHead>
                        <TableHead className="font-semibold">Thời gian</TableHead>
                        <TableHead className="text-right font-semibold">Tổng tiền</TableHead>
                        <TableHead className="text-center font-semibold">Trạng thái</TableHead>
                        <TableHead className="text-right font-semibold">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center"><Loader2 className="animate-spin inline-block" /></TableCell>
                        </TableRow>
                    ) : invoices.length > 0 ? (
                        invoices.map((invoice) => (
                            <TableRow key={invoice.id} className="hover:bg-slate-50/50">
                                <TableCell className="font-medium text-primary font-mono text-xs">
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
                                        {/* VIEW DETAIL */}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button 
                                                    variant="ghost" size="icon" 
                                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => handleViewDetail(invoice)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-lg">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center justify-between">
                                                        <span>Chi tiết hóa đơn {selectedInvoice?.id}</span>
                                                        {selectedInvoice && getStatusBadge(selectedInvoice.status)}
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Ngày tạo: {selectedInvoice?.date}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                
                                                <div className="space-y-4 py-4">
                                                    {/* INFO */}
                                                    <div className="grid grid-cols-2 gap-4 text-sm p-3 bg-slate-50 rounded-lg border">
                                                        <div><span className="text-muted-foreground text-xs uppercase block">Khách hàng</span><span className="font-medium">{selectedInvoice?.customer}</span></div>
                                                        <div><span className="text-muted-foreground text-xs uppercase block">SĐT</span><span>{selectedInvoice?.phone}</span></div>
                                                        <div><span className="text-muted-foreground text-xs uppercase block">Thú cưng</span><span>{selectedInvoice?.pet}</span></div>
                                                        <div><span className="text-muted-foreground text-xs uppercase block">Thanh toán</span><span>{selectedInvoice?.paymentMethod}</span></div>
                                                    </div>

                                                    {/* ITEMS */}
                                                    <div className="border rounded-lg overflow-hidden max-h-[200px] overflow-y-auto">
                                                        <Table>
                                                            <TableHeader className="bg-slate-50">
                                                                <TableRow className="h-9">
                                                                    <TableHead className="text-xs">Tên hàng</TableHead>
                                                                    <TableHead className="text-xs text-center w-12">SL</TableHead>
                                                                    <TableHead className="text-xs text-right">Đ.Giá</TableHead>
                                                                    <TableHead className="text-xs text-right">T.Tiền</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {itemsLoading ? (
                                                                    <TableRow><TableCell colSpan={4} className="text-center py-4"><Loader2 className="animate-spin inline-block w-4 h-4" /></TableCell></TableRow>
                                                                ) : invoiceItems.map((item, idx) => (
                                                                    <TableRow key={idx} className="h-10">
                                                                        <TableCell className="text-sm py-1">{item.name}</TableCell>
                                                                        <TableCell className="text-sm text-center py-1">{item.qty}</TableCell>
                                                                        <TableCell className="text-sm text-right py-1">{item.price?.toLocaleString()}</TableCell>
                                                                        <TableCell className="text-sm text-right font-medium py-1">{(item.price * item.qty).toLocaleString()}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>

                                                    {/* TOTAL */}
                                                    <div className="flex justify-between items-center pt-2 border-t">
                                                        <span className="font-bold text-lg">Tổng cộng</span>
                                                        <span className="font-bold text-xl text-primary">{selectedInvoice?.total?.toLocaleString()}đ</span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-3">
                                                    <Button variant="outline" className="gap-2"><Printer className="w-4 h-4" /> In hóa đơn</Button>
                                                    {selectedInvoice?.status === 'unpaid' && (
                                                        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                                                            <Link href={`/staff/pos?invoiceId=${selectedInvoice.id}`}>Thanh toán ngay</Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        {/* ACTION BUTTONS */}
                                        {invoice.status === 'unpaid' && (
                                            <>
                                                <Button asChild variant="outline" size="icon" className="h-8 w-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                                                    <Link href={`/staff/pos?invoiceId=${invoice.id}`}><CreditCard className="w-4 h-4" /></Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Không tìm thấy hóa đơn nào.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 py-4 px-4 border-t bg-slate-50/50">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page === 1 || loading}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Trước
                </Button>
                <span className="text-sm font-medium">Trang {page} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages || loading}>
                    Sau <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        )}
      </Card>
    </div>
  )
}