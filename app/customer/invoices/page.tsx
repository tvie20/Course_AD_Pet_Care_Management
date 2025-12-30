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
import { Receipt, Eye, Star, Search, CreditCard, Banknote, QrCode } from "lucide-react"

const POINTS_CONVERSION_RATE = 50000;

const paymentIcons: any = {
  cash: Banknote,
  transfer: QrCode,
  card: CreditCard,
}

const paymentLabels: any = {
  cash: "Tiền mặt (COD)",
  transfer: "Chuyển khoản",
  card: "Thẻ tín dụng",
}

export default function InvoicesPage() {
  // 1. Thay đổi state: Khởi tạo mảng rỗng
  const [invoices, setInvoices] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)

  // 2. Dùng useEffect để lấy dữ liệu từ LocalStorage khi trang vừa tải
  useEffect(() => {
    const storedData = localStorage.getItem('mockInvoices')
    
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      
      // 3. Chuẩn hóa dữ liệu:
      // Dữ liệu từ Checkout có thể thiếu vài trường (như pet, branch...) so với giao diện Invoices
      // Ta cần điền giá trị mặc định vào để không bị lỗi.
      const formattedData = parsedData.map((inv: any) => ({
        ...inv,
        // Giữ lại các trường ID, Date, Status từ checkout
        
        // Điền thêm các trường hiển thị nếu thiếu
        time: inv.time || inv.date.split(',')[1] || "00:00", // Lấy giờ từ chuỗi date nếu có
        branch: inv.branch || "Online Store", // Đơn online
        staff: inv.staff || "Hệ thống",
        total: inv.total || 0,
        discount: inv.discount || 0,
        finalTotal: inv.total, // Với đơn online, tổng tiền là final
        reviewed: false,
        pet: "Chưa cập nhật", // Đơn hàng online thường chưa gắn với pet cụ thể ngay
        
        // Map lại items vì bên Checkout dùng 'qty' còn bên này dùng 'quantity'
        items: inv.items.map((item: any) => ({
            type: "product", // Mặc định là sản phẩm
            name: item.name,
            quantity: item.qty || item.quantity, // Lấy qty từ checkout đổi thành quantity
            price: item.price,
            subtotal: item.price * (item.qty || item.quantity)
        }))
      }))

      setInvoices(formattedData)
    }
  }, [])

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.id?.toLowerCase().includes(search.toLowerCase()) || 
      inv.pet?.toLowerCase().includes(search.toLowerCase())
  )

  const calculatePoints = (amount: number) => {
    return Math.floor(amount / POINTS_CONVERSION_RATE);
  }

  // Helper để lấy icon an toàn (tránh lỗi nếu key không tồn tại)
  const getPaymentIcon = (method: string) => {
      // Chuẩn hóa key về dạng cash/transfer/card
      let key = 'cash';
      if (method?.includes('Chuyển khoản') || method === 'transfer') key = 'transfer';
      if (method?.includes('Thẻ') || method === 'card') key = 'card';
      return paymentIcons[key] || Banknote;
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
            placeholder="Tìm theo mã hóa đơn..."
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
                const PaymentIcon = getPaymentIcon(invoice.paymentMethod)
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
                            {invoice.date} {invoice.time !== "00:00" ? `• ${invoice.time}` : ""} • {invoice.branch}
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
                            <p className="text-xs text-muted-foreground line-through">{invoice.total.toLocaleString()}đ</p>
                        )}
                        <p className="font-bold text-lg text-slate-900">{invoice.finalTotal.toLocaleString()}đ</p>
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
                            
                            {/* Nội dung chi tiết Dialog */}
                            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Ngày lập</p>
                                    <p className="font-medium">{invoice.date}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Chi nhánh</p>
                                    <p className="font-medium">{invoice.branch}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Người nhận</p>
                                    <p className="font-medium">{invoice.customer || "Khách lẻ"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Số điện thoại</p>
                                    <p className="font-medium">{invoice.phone || "--"}</p>
                                </div>
                                </div>
                                
                                <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                    <tr>
                                        <th className="text-left p-2 font-medium">Sản phẩm</th>
                                        <th className="text-right p-2 font-medium">SL</th>
                                        <th className="text-right p-2 font-medium">Đơn giá</th>
                                        <th className="text-right p-2 font-medium">T.Tiền</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {invoice.items.map((item: any, idx: number) => (
                                        <tr key={idx} className="border-t">
                                        <td className="p-2 max-w-[150px] truncate" title={item.name}>
                                            {item.name}
                                        </td>
                                        <td className="p-2 text-right">{item.quantity}</td>
                                        <td className="p-2 text-right">{item.price.toLocaleString()}</td>
                                        <td className="p-2 text-right">{item.subtotal.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between font-semibold text-base pt-2 border-t">
                                        <span>Tổng thanh toán</span>
                                        <span className="text-emerald-600">{invoice.finalTotal.toLocaleString()}đ</span>
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
                <div className="text-center py-10 text-muted-foreground">
                    Bạn chưa có đơn hàng nào.
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}