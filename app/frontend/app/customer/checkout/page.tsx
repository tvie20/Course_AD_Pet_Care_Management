"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, User, Phone, FileText, CreditCard, Banknote, QrCode, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/components/cart-provider"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, removeFromCart } = useCart()
  
  const [checkoutItems, setCheckoutItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  
  // Thông tin khách hàng
  const [formData, setFormData] = useState({
    name: "Nguyễn Văn A",
    phone: "0909123456",
    address: "",
    note: ""
  })
  
  const [paymentMethod, setPaymentMethod] = useState("cod")

  // 1. Lấy dữ liệu sản phẩm cần thanh toán khi mới vào trang
  useEffect(() => {
    // Lấy danh sách ID đã chọn từ localStorage (được lưu bên trang Cart)
    const selectedIds = JSON.parse(localStorage.getItem('checkout_selected_ids') || '[]')
    
    if (selectedIds.length === 0) {
      // Nếu không có sản phẩm nào được chọn, quay về giỏ hàng
      router.push('/customer/cart')
      return
    }

    // Lọc ra các sản phẩm chi tiết từ giỏ hàng dựa trên ID
    const productsToCheckout = items.filter(item => selectedIds.includes(item.id))
    setCheckoutItems(productsToCheckout)
    setIsLoading(false)
  }, [items, router])

  // Tính toán tiền
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalAmount = subtotal 

  // Xử lý đặt hàng
  const handlePlaceOrder = () => {
    setIsLoading(true)

    // Tạo đơn hàng giả lập
    const newOrder = {
      id: `ORD-${Math.floor(Math.random() * 100000)}`,
      customer: formData.name,
      phone: formData.phone,
      address: formData.address,
      note: formData.note,
      date: new Date().toLocaleString('en-GB'),
      total: totalAmount,
      status: paymentMethod === 'transfer' ? "paid" : "unpaid",
      paymentMethod: paymentMethod === 'cod' ? "Tiền mặt (COD)" : "Chuyển khoản",
      items: checkoutItems.map(item => ({
        name: item.name,
        qty: item.quantity,
        price: item.price
      })),
      type: "online_order"
    }

    // Lưu vào "Database" (LocalStorage) để nhân viên thấy
    const existingInvoices = JSON.parse(localStorage.getItem('mockInvoices') || '[]')
    localStorage.setItem('mockInvoices', JSON.stringify([newOrder, ...existingInvoices]))

    // Xóa các sản phẩm đã mua khỏi giỏ hàng thật
    checkoutItems.forEach(item => removeFromCart(item.id))
    
    // Xóa session checkout tạm
    localStorage.removeItem('checkout_selected_ids')

    // Giả lập delay mạng
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
    }, 1500)
  }

  // --- GIAO DIỆN THÀNH CÔNG ---
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center pt-10 pb-6 shadow-lg border-emerald-100">
          <CardContent className="space-y-6">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-800">Đặt hàng thành công!</h2>
              <p className="text-muted-foreground mt-2">Cảm ơn bạn đã mua sắm tại PetCareX.</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg text-sm border text-left space-y-2 mx-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Người nhận:</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng thanh toán:</span>
                <span className="font-bold text-emerald-600">{totalAmount.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hình thức:</span>
                <span>{paymentMethod === 'cod' ? 'Thanh toán khi nhận' : 'Chuyển khoản'}</span>
              </div>
            </div>

            <div className="flex gap-3 px-4 pt-4">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/customer/history">Xem đơn hàng</Link>
              </Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" asChild>
                <Link href="/customer/shop">Tiếp tục mua</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading && checkoutItems.length === 0) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>
  }

  // --- GIAO DIỆN CHÍNH ---
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb / Header */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" asChild className="pl-0 hover:bg-transparent hover:text-emerald-600">
            <Link href="/customer/cart">
              <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại giỏ hàng
            </Link>
          </Button>
          <span className="text-slate-300">/</span>
          <h1 className="text-xl font-bold text-slate-900">Thanh toán</h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI: THÔNG TIN & THANH TOÁN */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Thông tin giao hàng */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" /> 
                  Thông tin giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Họ và tên</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        className="pl-9" 
                        placeholder="Nhập họ tên"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                        className="pl-9" 
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ nhận hàng</Label>
                  <Input 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ghi chú (Tùy chọn)</Label>
                  <Textarea 
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                    placeholder="Ví dụ: Giao hàng giờ hành chính, gọi trước khi giao..."
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. Phương thức thanh toán */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" /> 
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  
                  {/* Option COD */}
                  <Label 
                    htmlFor="cod"
                    className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600' : 'hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <RadioGroupItem value="cod" id="cod" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-semibold text-slate-900">
                        <Banknote className="w-4 h-4 text-emerald-600" /> Thanh toán khi nhận hàng (COD)
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Thanh toán bằng tiền mặt trực tiếp cho shipper khi nhận hàng.</p>
                    </div>
                  </Label>

                  {/* Option Transfer */}
                  <Label 
                    htmlFor="transfer"
                    className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'transfer' ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600' : 'hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <RadioGroupItem value="transfer" id="transfer" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-semibold text-slate-900">
                        <QrCode className="w-4 h-4 text-emerald-600" /> Chuyển khoản ngân hàng (QR)
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Quét mã QR để thanh toán nhanh chóng.</p>
                      
                      {/* Hiển thị QR Code khi chọn */}
                      {paymentMethod === 'transfer' && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-emerald-100 flex flex-col sm:flex-row gap-6 items-center animate-in slide-in-from-top-2">
                          <div className="w-32 h-32 bg-white border flex items-center justify-center rounded-lg shadow-sm">
                            <QrCode className="w-20 h-20 text-slate-800" />
                          </div>
                          <div className="text-sm space-y-2 flex-1">
                            <p className="font-medium text-slate-900">Ngân hàng Vietcombank</p>
                            <div className="flex justify-between border-b border-dashed pb-1">
                              <span className="text-muted-foreground">Số tài khoản:</span>
                              <span className="font-mono font-bold">999888666</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed pb-1">
                              <span className="text-muted-foreground">Chủ tài khoản:</span>
                              <span className="font-bold">PETCAREX VN</span>
                            </div>
                            <div className="flex justify-between items-center bg-yellow-50 p-2 rounded text-orange-700">
                              <span>Nội dung:</span>
                              <span className="font-mono font-bold">TT {formData.phone}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* CỘT PHẢI: TỔNG QUAN ĐƠN HÀNG */}
          <div className="lg:col-span-5">
            <Card className="border-none shadow-md ring-1 ring-slate-200 sticky top-6">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Đơn hàng của bạn</span>
                  <span className="text-sm font-normal text-muted-foreground">{checkoutItems.length} sản phẩm</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Danh sách sản phẩm scrollable */}
                <div className="max-h-[350px] overflow-y-auto p-5 space-y-4">
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-white border rounded-md flex items-center justify-center text-xs text-muted-foreground shrink-0 shadow-sm">
                        {/* Thay bằng <Image /> thật */}
                        IMG
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 line-clamp-2">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">x{item.quantity}</span>
                          <span className="font-medium text-sm">{(item.price * item.quantity).toLocaleString()}đ</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Tính toán tiền */}
                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span className="font-medium">{subtotal.toLocaleString()}đ</span>
                  </div>
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-lg text-slate-900">Tổng thanh toán:</span>
                    <span className="text-2xl font-bold text-emerald-600">{totalAmount.toLocaleString()}đ</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-0 bg-slate-50 border-t">
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base shadow-lg shadow-emerald-200"
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...
                    </>
                  ) : (
                    "Đặt hàng ngay"
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <p className="text-center text-xs text-muted-foreground mt-4 px-4">
              Bằng việc đặt hàng, bạn đồng ý với <Link href="#" className="underline">Điều khoản dịch vụ</Link> và <Link href="#" className="underline">Chính sách bảo mật</Link> của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}