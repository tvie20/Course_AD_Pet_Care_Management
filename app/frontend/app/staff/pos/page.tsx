"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  CreditCard, Banknote, QrCode, User, PawPrint, Loader2, ArrowLeft
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Interface
interface CartItem {
  id: string | number
  code: string
  type: "product" | "vaccine" | "service"
  name: string
  price: number
  unit: string
  quantity: number
}

interface Customer {
  id: string
  name: string
  phone: string
  pets: { id: string; name: string }[]
}

interface InvoiceState {
  id: string
  cart: CartItem[]
  customer: Customer | null
  selectedPetId: string | null
  cashAmount: number      
  transferAmount: number  
  note: string
  status: string          
}

export default function POSPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invoiceIdParam = searchParams.get("invoiceId")

  const [isLoading, setIsLoading] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceState | null>(null)
  
  // URL Backend (Nên đưa vào file config/env)
  const API_URL = "http://localhost:3055"; 

  // 1. FETCH DATA
  useEffect(() => {
    console.log("Invoice ID from URL:", invoiceIdParam);

    if (!invoiceIdParam) return;

    const fetchInvoice = async () => {
        console.log("Bắt đầu gọi API...");
        setIsLoading(true)
        try {
            const token = localStorage.getItem("staffAccessToken")
            const userStr = localStorage.getItem("staffUser")
            if (!token || !userStr) return;
            const user = JSON.parse(userStr);

            const res = await fetch(`${API_URL}/api/staff/invoices/${invoiceIdParam}/detail`, {
                headers: {
                    "Content-Type": "application/json",
                    "authorization": token,
                    "x-client-id": user.MaNV
                }
            })

            if (res.ok) {
                const data = await res.json()
                const info = data.metadata.info;
                const items = data.metadata.items;

                setCurrentInvoice({
                    id: info.MaHD,
                    status: 'unpaid',
                    cart: items.map((i: any, idx: number) => ({
                        id: i.code, // Dùng mã SP làm ID luôn
                        code: i.code,
                        name: i.name,
                        price: i.price,
                        quantity: i.quantity,
                        unit: i.unit,
                        type: i.type
                    })),
                    customer: info.MaKH ? {
                        id: info.MaKH,
                        name: info.HoTenKH,
                        phone: info.SDTKH,
                        pets: info.MaTC ? [{ id: info.MaTC, name: info.TenTC }] : []
                    } : null,
                    selectedPetId: info.MaTC || null,
                    cashAmount: 0,
                    transferAmount: 0,
                    note: ""
                })
            } else {
                alert("Không tìm thấy hóa đơn hoặc lỗi tải dữ liệu")
                router.back()
            }
        } catch (error) {
            console.error(error)
            alert("Lỗi kết nối")
        } finally {
            setIsLoading(false)
        }
    }

    fetchInvoice()
  }, [invoiceIdParam])

  const updateCurrentInvoice = (updates: Partial<InvoiceState>) => {
    if (!currentInvoice) return;
    setCurrentInvoice({ ...currentInvoice, ...updates })
  }

  // --- LOGIC TÍNH TOÁN ---
  const totalAmount = currentInvoice ? currentInvoice.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0
  const finalTotal = totalAmount 
  const totalPaid = (currentInvoice?.cashAmount || 0) + (currentInvoice?.transferAmount || 0)
  const changeDue = totalPaid - finalTotal

  // Tính năng tiện ích: Tự động điền đủ tiền mặt
  const fillFullCash = () => {
      if(!currentInvoice) return;
      const remaining = Math.max(0, finalTotal - currentInvoice.transferAmount);
      updateCurrentInvoice({ cashAmount: remaining });
  }

  // --- XỬ LÝ THANH TOÁN ---
  const handlePayment = async () => {
      if (!currentInvoice) return;
      
      if (totalPaid < finalTotal) {
          alert(`Khách còn thiếu ${(finalTotal - totalPaid).toLocaleString()}đ`);
          return;
      }
      if (!currentInvoice.customer) {
          alert("Thiếu thông tin khách hàng (để tích điểm).");
          return;
      }

      setIsLoading(true);
      try {
          const token = localStorage.getItem("staffAccessToken")
          const userStr = localStorage.getItem("staffUser")
          if (!token || !userStr) return;
          const user = JSON.parse(userStr);

          let method = "Tiền mặt";
          if (currentInvoice.transferAmount > 0 && currentInvoice.cashAmount === 0) method = "Chuyển khoản";
          else if (currentInvoice.transferAmount > 0 && currentInvoice.cashAmount > 0) method = "Tiền mặt + Chuyển khoản";

          const res = await fetch(`${API_URL}/api/staff/payment`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "authorization": token,
                  "x-client-id": user.MaNV
              },
              body: JSON.stringify({
                  maHD: currentInvoice.id,
                  maKH: currentInvoice.customer.id,
                  hinhThucTT: method
              })
          });

          if (res.ok) {
              alert(`Thanh toán thành công!`);
              router.push("/staff/invoices"); 
          } else {
              const err = await res.json();
              alert(err.message || "Lỗi thanh toán");
          }

      } catch (error) {
          console.error(error);
          alert("Lỗi kết nối server");
      } finally {
          setIsLoading(false);
      }
  }

  if (!invoiceIdParam || isLoading && !currentInvoice) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600"/></div>
  }

  if (!currentInvoice) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-white p-3 rounded-t-lg border-b">
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5"/>
            </Button>
            <span className="font-bold text-lg">Thanh toán hóa đơn</span>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-base px-3 py-1">
                {currentInvoice.id}
            </Badge>
         </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        
        {/* --- LEFT: DANH SÁCH MÓN (READ ONLY) --- */}
        <div className="flex-1 bg-white rounded-lg border shadow-sm flex flex-col min-h-0">
            <div className="p-3 bg-slate-50 border-b text-sm font-medium text-muted-foreground flex justify-between">
                <span>Chi tiết dịch vụ & đơn thuốc</span>
                <span>{currentInvoice.cart.length} mục</span>
            </div>
            
            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-white sticky top-0 z-10 border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium w-10">#</th>
                            <th className="px-4 py-3 font-medium">Tên</th>
                            <th className="px-4 py-3 font-medium text-center w-20">SL</th>
                            <th className="px-4 py-3 font-medium text-center w-20">ĐVT</th>
                            <th className="px-4 py-3 font-medium text-right">Đơn giá</th>
                            <th className="px-4 py-3 font-medium text-right">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {currentInvoice.cart.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                                <td className="px-4 py-3 font-medium">
                                    <div className="flex flex-col">
                                        <span>{item.name}</span>
                                        <span className="text-xs text-muted-foreground font-mono">{item.code}</span>
                                    </div>
                                    {item.type === 'vaccine' && <Badge variant="secondary" className="mt-1 text-[10px] h-4 px-1 w-fit">Vacxin</Badge>}
                                </td>
                                <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
                                <td className="px-4 py-3 text-center text-muted-foreground">{item.unit}</td>
                                <td className="px-4 py-3 text-right text-muted-foreground">{item.price.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right font-bold text-slate-700">{(item.price * item.quantity).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Totals */}
            <div className="p-4 border-t bg-emerald-50/30">
                <div className="flex justify-end gap-12 text-lg">
                    <span className="font-semibold text-slate-700">Tổng tiền hàng</span>
                    <span className="font-bold w-40 text-right text-emerald-700">{finalTotal.toLocaleString()} đ</span>
                </div>
            </div>
        </div>

        {/* --- RIGHT: PAYMENT & CUSTOMER --- */}
        <div className="w-full lg:w-[400px] flex flex-col gap-4 shrink-0 overflow-y-auto pb-10">
            
            {/* Customer Info */}
            <Card className="shadow-sm border">
                <CardContent className="p-4 space-y-3">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <User className="w-4 h-4"/> Thông tin khách hàng
                    </h3>
                    
                    {currentInvoice.customer ? (
                        <div className="bg-slate-50 rounded-md border border-slate-100 p-3 space-y-1">
                            <div className="font-bold text-emerald-900 text-base">{currentInvoice.customer.name}</div>
                            <div className="text-sm text-slate-600">SĐT: {currentInvoice.customer.phone}</div>
                            {currentInvoice.selectedPetId && currentInvoice.customer.pets.length > 0 && (
                                <div className="pt-2 mt-2 border-t border-slate-200 text-xs flex items-center gap-1 text-emerald-600 font-medium">
                                    <PawPrint className="w-3 h-3"/> {currentInvoice.customer.pets[0].name}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-red-500 italic p-2 border border-red-100 bg-red-50 rounded">Chưa xác định khách hàng</div>
                    )}
                </CardContent>
            </Card>

            {/* Payment Inputs */}
            <Card className="shadow-sm border flex-1 flex flex-col ring-1 ring-emerald-100">
                <CardContent className="p-4 space-y-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 border-b pb-2">
                        <h3 className="font-bold text-emerald-800 text-sm uppercase tracking-wider">Thanh toán</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Tiền mặt */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <Banknote className="w-4 h-4 text-emerald-600"/> Tiền mặt
                                </div>
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-600" onClick={fillFullCash}>
                                    Nhập đủ tiền
                                </Button>
                            </div>
                            <Input 
                                className="h-11 text-right font-bold text-lg" 
                                value={currentInvoice.cashAmount === 0 ? '' : currentInvoice.cashAmount} 
                                placeholder="0"
                                type="number"
                                onChange={(e) => updateCurrentInvoice({ cashAmount: Number(e.target.value) })}
                            />
                        </div>

                        {/* Chuyển khoản */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <CreditCard className="w-4 h-4 text-blue-600"/> Chuyển khoản
                            </div>
                            <div className="flex gap-2">
                                <Input 
                                    className="h-11 text-right font-bold text-lg flex-1" 
                                    value={currentInvoice.transferAmount === 0 ? '' : currentInvoice.transferAmount}
                                    placeholder="0"
                                    type="number"
                                    onChange={(e) => updateCurrentInvoice({ transferAmount: Number(e.target.value) })}
                                />
                                <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" title="QR Code">
                                    <QrCode className="w-5 h-5 text-slate-600"/>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-2"/>

                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Phải thanh toán:</span>
                            <span className="font-bold text-lg text-slate-800">{finalTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-muted-foreground">Khách đưa:</span>
                            <span className={`font-medium ${totalPaid < finalTotal ? 'text-orange-600' : 'text-blue-600'}`}>
                                {totalPaid.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-base border-t pt-3 mt-1">
                            <span className="font-bold text-slate-700">Tiền thừa:</span>
                            <span className={`font-bold text-xl ${changeDue < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {changeDue < 0 ? "Thiếu " + Math.abs(changeDue).toLocaleString() : changeDue.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Ghi chú hóa đơn (In lên bill)</Label>
                        <Textarea 
                            className="min-h-[60px] resize-none text-sm" 
                            placeholder="..."
                            value={currentInvoice.note}
                            onChange={(e) => updateCurrentInvoice({ note: e.target.value })}
                        />
                    </div>

                    <div className="mt-auto pt-4">
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700 w-full h-14 text-lg font-bold shadow-md uppercase"
                            onClick={handlePayment}
                            disabled={isLoading || totalPaid < finalTotal}
                        >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin"/> : "Hoàn tất & In hóa đơn"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}