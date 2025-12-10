"use client"

import { useState } from "react"
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

// 1. Định nghĩa tỷ lệ quy đổi điểm ở một nơi duy nhất để dễ quản lý
const POINTS_CONVERSION_RATE = 50000;

const invoices = [
  {
    id: "HD-2025-001234",
    date: "10/12/2025",
    time: "15:30",
    branch: "PetCareX Quận 1",
    staff: "Nguyễn Thị D",
    total: 850000,
    discount: 42500,
    finalTotal: 807500,
    paymentMethod: "cash",
    status: "paid",
    reviewed: false,
    pet: "Mochi",
    items: [
      { type: "service", name: "Khám bệnh tổng quát", quantity: 1, price: 200000, subtotal: 200000 },
      { type: "product", name: "Apoquel 5.4mg x14", quantity: 1, price: 420000, subtotal: 420000 },
      { type: "product", name: "Dầu tắm trị nấm", quantity: 1, price: 230000, subtotal: 230000 },
    ],
  },
  {
    id: "HD-2025-001198",
    date: "01/12/2025",
    time: "10:15",
    branch: "PetCareX Quận 1",
    staff: "Trần Văn E",
    total: 350000,
    discount: 17500,
    finalTotal: 332500,
    paymentMethod: "transfer",
    status: "paid",
    reviewed: true,
    pet: "Mochi",
    items: [{ type: "service", name: "Tiêm vắc-xin 5 bệnh", quantity: 1, price: 350000, subtotal: 350000 }],
  },
  {
    id: "HD-2025-001156",
    date: "15/11/2025",
    time: "14:00",
    branch: "PetCareX Quận 1",
    staff: "Nguyễn Thị D",
    total: 500000,
    discount: 25000,
    finalTotal: 475000,
    paymentMethod: "card",
    status: "paid",
    reviewed: true,
    pet: "Luna",
    items: [
      { type: "service", name: "Khám sức khỏe định kỳ", quantity: 1, price: 150000, subtotal: 150000 },
      { type: "service", name: "Tiêm vắc-xin 4 bệnh mèo", quantity: 1, price: 350000, subtotal: 350000 },
    ],
  },
]

const paymentIcons = {
  cash: Banknote,
  transfer: QrCode,
  card: CreditCard,
}

const paymentLabels = {
  cash: "Tiền mặt",
  transfer: "Chuyển khoản",
  card: "Thẻ",
}

export default function InvoicesPage() {
  const [search, setSearch] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<(typeof invoices)[0] | null>(null)

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.id.toLowerCase().includes(search.toLowerCase()) || inv.pet.toLowerCase().includes(search.toLowerCase()),
  )

  // Hàm tính điểm (Helper function)
  const calculatePoints = (amount: number) => {
    return Math.floor(amount / POINTS_CONVERSION_RATE);
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
            placeholder="Tìm theo mã hóa đơn hoặc thú cưng..."
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
            {filteredInvoices.map((invoice) => {
              const PaymentIcon = paymentIcons[invoice.paymentMethod as keyof typeof paymentIcons]

              // 2. Tính toán điểm suy diễn ngay tại đây
              const pointsEarned = calculatePoints(invoice.finalTotal);

              return (
                <div
                  key={invoice.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Receipt className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-semibold">{invoice.id}</code>
                        <Badge variant="secondary">{invoice.status === "paid" ? "Đã thanh toán" : "Chưa TT"}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {invoice.date} {invoice.time} • {invoice.pet} • {invoice.branch}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <PaymentIcon className="w-4 h-4" />
                          <span>{paymentLabels[invoice.paymentMethod as keyof typeof paymentLabels]}</span>
                        </div>
                        <span className="text-sm text-primary">+{pointsEarned} điểm</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <div className="text-right">
                      {invoice.discount > 0 && (
                        <p className="text-xs text-muted-foreground line-through">{invoice.total.toLocaleString()}đ</p>
                      )}
                      <p className="font-semibold text-lg">{invoice.finalTotal.toLocaleString()}đ</p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 bg-transparent"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Eye className="w-4 h-4" />
                            Chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Chi tiết hóa đơn</DialogTitle>
                            <DialogDescription>{invoice.id}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Ngày lập</p>
                                <p className="font-medium">
                                  {invoice.date} {invoice.time}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Chi nhánh</p>
                                <p className="font-medium">{invoice.branch}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Nhân viên</p>
                                <p className="font-medium">{invoice.staff}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Thú cưng</p>
                                <p className="font-medium">{invoice.pet}</p>
                              </div>
                            </div>
                            <div className="border rounded-lg overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-muted">
                                  <tr>
                                    <th className="text-left p-2 font-medium">Mô tả</th>
                                    <th className="text-right p-2 font-medium">SL</th>
                                    <th className="text-right p-2 font-medium">Đơn giá</th>
                                    <th className="text-right p-2 font-medium">T.Tiền</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {invoice.items.map((item, idx) => (
                                    <tr key={idx} className="border-t">
                                      <td className="p-2">
                                        <Badge variant="outline" className="text-xs mr-2">
                                          {item.type === "service" ? "DV" : "SP"}
                                        </Badge>
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
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Tổng tiền hàng</span>
                                <span>{invoice.total.toLocaleString()}đ</span>
                              </div>
                              {invoice.discount > 0 && (
                                <div className="flex justify-between text-chart-2">
                                  <span>Giảm giá (5% Thân thiết)</span>
                                  <span>-{invoice.discount.toLocaleString()}đ</span>
                                </div>
                              )}
                              <div className="flex justify-between font-semibold text-base pt-2 border-t">
                                <span>Tổng thanh toán</span>
                                <span>{invoice.finalTotal.toLocaleString()}đ</span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Điểm tích lũy</span>
                                <span className="text-primary">+{pointsEarned} điểm</span>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {!invoice.reviewed && (
                        <Button size="sm" className="gap-1">
                          <Star className="w-4 h-4" />
                          Đánh giá
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
