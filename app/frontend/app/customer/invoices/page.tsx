"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Receipt, Eye, Star, Search, CreditCard, Banknote, QrCode, Loader2, PackageSearch } from "lucide-react"

const POINTS_CONVERSION_RATE = 50000;

const paymentIcons: any = {
  cash: Banknote,
  transfer: QrCode,
  card: CreditCard,
}

// Định nghĩa kiểu dữ liệu cho hóa đơn
interface InvoiceItem {
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface InvoiceUI {
    id: string;
    date: string;
    time: string;
    total: number;
    discount: number;
    finalTotal: number;
    paymentMethod: string;
    paymentMethodKey: string; // 'cash' | 'transfer' | 'card'
    status: 'paid' | 'pending';
    pet: string;
    staff: string;
    branch: string;
    items: InvoiceItem[];
    note?: string;
    reviewed?: boolean;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceUI[]>([])
  const [search, setSearch] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceUI | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Helper: Format tiền tệ
  const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  // Helper: Detect phương thức thanh toán để chọn icon
  const detectPaymentMethodKey = (method: string): string => {
      if (!method) return 'cash';
      const m = method.toLowerCase();
      if (m.includes('chuyển khoản') || m.includes('qr')) return 'transfer';
      if (m.includes('thẻ') || m.includes('card')) return 'card';
      return 'cash';
  }

  useEffect(() => {
    const fetchInvoices = async () => {
        try {
            const token = localStorage.getItem("accessToken")
            const userStr = localStorage.getItem("user")
            
            if (!token || !userStr) return;
            const user = JSON.parse(userStr)

            // GỌI API BACKEND
            const res = await fetch("http://localhost:3055/api/invoices", {
                headers: {
                    "Content-Type": "application/json",
                    "authorization": token,
                    "x-client-id": user.MaKH
                }
            })

            if (res.ok) {
                const data = await res.json()
                
                const formattedData: InvoiceUI[] = data.map((inv: any) => {
                    const dateObj = new Date(inv.date);
                    return {
                        id: inv.id,
                        date: dateObj.toLocaleDateString('en-GB'),
                        time: dateObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}),
                        total: inv.total,
                        discount: inv.discount,
                        finalTotal: inv.finalTotal,
                        paymentMethod: inv.paymentMethod,
                        paymentMethodKey: detectPaymentMethodKey(inv.paymentMethod),
                        status: inv.status,
                        pet: inv.pet,
                        staff: inv.staff,
                        branch: inv.branch,
                        items: inv.items,
                        reviewed: false // DB chưa có cột đánh giá, mặc định false
                    }
                })
                setInvoices(formattedData)
            }
        } catch (error) {
            console.error("Lỗi tải hóa đơn:", error)
        } finally {
            setIsLoading(false)
        }
    }

    fetchInvoices()
  }, [])

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.id?.toLowerCase().includes(search.toLowerCase()) || 
      inv.pet?.toLowerCase().includes(search.toLowerCase())
  )

  const calculatePoints = (amount: number) => {
    return Math.floor(amount / POINTS_CONVERSION_RATE);
  }

  if (isLoading) {
      return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lịch sử mua hàng</h1>
        <p className="text-muted-foreground">Xem lại các hóa đơn đã thanh toán</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã hóa đơn, tên thú cưng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách hóa đơn</CardTitle>
          <CardDescription>Tổng cộng {invoices.length} hóa đơn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => {
                const PaymentIcon = paymentIcons[invoice.paymentMethodKey] || Banknote
                const pointsEarned = calculatePoints(invoice.finalTotal);

                return (
                    <div
                    key={invoice.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border hover:bg-slate-50 transition-colors"
                    >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <Receipt className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                        <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-semibold">{invoice.id}</code>
                            <Badge variant={invoice.status === 'paid' ? "default" : "outline"} className={invoice.status === 'paid' ? "bg-emerald-600 hover:bg-emerald-700" : "text-yellow-600 border-yellow-600"}>
                                {invoice.status === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {invoice.date} • {invoice.time} • {invoice.pet}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <PaymentIcon className="w-4 h-4" />
                            <span>{invoice.paymentMethod}</span>
                            </div>
                            <span className="text-sm text-emerald-600 font-medium">+{pointsEarned} điểm</span>
                        </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <div className="text-right">
                        {invoice.discount > 0 && (
                            <p className="text-xs text-muted-foreground line-through">{formatCurrency(invoice.total)}</p>
                        )}
                        <p className="font-bold text-lg text-slate-900">{formatCurrency(invoice.finalTotal)}</p>
                        </div>
                        <div className="flex gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 bg-white hover:bg-slate-100"
                                onClick={() => setSelectedInvoice(invoice)}
                            >
                                <Eye className="w-4 h-4" />
                                Chi tiết
                            </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Chi tiết hóa đơn</DialogTitle>
                                <DialogDescription>Mã đơn: {invoice.id}</DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Ngày lập</p>
                                    <p className="font-medium">{invoice.date} {invoice.time}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Chi nhánh</p>
                                    <p className="font-medium">{invoice.branch}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Thú cưng</p>
                                    <p className="font-medium">{invoice.pet}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Nhân viên</p>
                                    <p className="font-medium">{invoice.staff}</p>
                                </div>
                                </div>
                                
                                <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                    <tr>
                                        <th className="text-left p-2 font-medium">Sản phẩm/Dịch vụ</th>
                                        <th className="text-right p-2 font-medium">SL</th>
                                        <th className="text-right p-2 font-medium">Đơn giá</th>
                                        <th className="text-right p-2 font-medium">T.Tiền</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {invoice.items.map((item, idx) => (
                                        <tr key={idx} className="border-t">
                                        <td className="p-2 max-w-[150px] truncate" title={item.name}>
                                            {item.name}
                                        </td>
                                        <td className="p-2 text-right">{item.quantity}</td>
                                        <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                                        <td className="p-2 text-right">{formatCurrency(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between font-semibold text-base pt-2 border-t">
                                        <span>Tổng thanh toán</span>
                                        <span className="text-emerald-600">{formatCurrency(invoice.finalTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Điểm tích lũy</span>
                                        <span className="text-emerald-600">+{pointsEarned} điểm</span>
                                    </div>
                                    {invoice.note && (
                                        <div className="pt-2 text-xs text-muted-foreground italic border-t mt-2">
                                            Ghi chú: {invoice.note}
                                        </div>
                                    )}
                                </div>
                            </div>
                            </DialogContent>
                        </Dialog>
                        
                        {invoice.status === 'paid' && !invoice.reviewed && (
                            <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                            <Star className="w-4 h-4" />
                            Đánh giá
                            </Button>
                        )}
                        </div>
                    </div>
                    </div>
                )
                })
            ) : (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <PackageSearch className="w-16 h-16 mb-2 opacity-20" />
                    <p>Bạn chưa có đơn hàng nào.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}