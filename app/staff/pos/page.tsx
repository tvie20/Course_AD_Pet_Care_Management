"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, QrCode, User, Cat } from "lucide-react"

const pendingServices = [
  { id: 1, type: "service", name: "Khám bệnh - Mochi", price: 200000, pet: "Mochi" },
  { id: 2, type: "service", name: "Tiêm phòng dại - Luna", price: 150000, pet: "Luna" },
]

const products = [
  { id: 1, name: "Thức ăn Royal Canin 2kg", price: 450000, stock: 25 },
  { id: 2, name: "Vắc-xin 5 bệnh", price: 350000, stock: 50 },
  { id: 3, name: "Thuốc giun Nexgard", price: 180000, stock: 100 },
  { id: 4, name: "Shampoo trị nấm", price: 220000, stock: 30 },
]

interface CartItem {
  id: number
  type: "service" | "product"
  name: string
  price: number
  quantity: number
}

export default function POSPage() {
  const [customerPhone, setCustomerPhone] = useState("")
  const [customer, setCustomer] = useState<{ name: string; tier: string; points: number } | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")

  const searchCustomer = () => {
    if (customerPhone === "0901234567") {
      setCustomer({ name: "Nguyễn Văn A", tier: "Thân thiết", points: 125 })
    }
  }

  const addToCart = (item: { id: number; type: "service" | "product"; name: string; price: number }) => {
    const existing = cart.find((c) => c.id === item.id && c.type === item.type)
    if (existing) {
      setCart(cart.map((c) => (c.id === item.id && c.type === item.type ? { ...c, quantity: c.quantity + 1 } : c)))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const updateQuantity = (id: number, type: string, delta: number) => {
    setCart(
      cart
        .map((c) => (c.id === id && c.type === type ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c))
        .filter((c) => c.quantity > 0),
    )
  }

  const removeFromCart = (id: number, type: string) => {
    setCart(cart.filter((c) => !(c.id === id && c.type === type)))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = customer?.tier === "VIP" ? subtotal * 0.1 : customer?.tier === "Thân thiết" ? subtotal * 0.05 : 0
  const total = subtotal - discount
  const pointsEarned = Math.floor(total / 50000)

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bán hàng & Thanh toán</h1>
        <p className="text-muted-foreground">Tạo hóa đơn và thanh toán cho khách hàng</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel - Customer & Products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Search */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập số điện thoại khách hàng"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
                <Button onClick={searchCustomer}>Tìm</Button>
              </div>
              {customer && (
                <div className="mt-4 p-4 rounded-lg bg-muted flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customerPhone}</p>
                  </div>
                  <div className="text-right">
                    <Badge>{customer.tier}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">{customer.points} điểm</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Services */}
          {customer && pendingServices.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Cat className="w-4 h-4" />
                  Dịch vụ chưa thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pendingServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          onCheckedChange={(checked) => {
                            if (checked) {
                              addToCart({ id: service.id, type: "service", name: service.name, price: service.price })
                            } else {
                              removeFromCart(service.id, "service")
                            }
                          }}
                        />
                        <div>
                          <p className="font-medium text-sm">{service.name}</p>
                        </div>
                      </div>
                      <p className="font-semibold">{service.price.toLocaleString()}đ</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Thêm sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm sản phẩm theo tên hoặc mã..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() =>
                      addToCart({ id: product.id, type: "product", name: product.name, price: product.price })
                    }
                  >
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">Tồn: {product.stock}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{product.price.toLocaleString()}đ</p>
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Cart */}
        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Giỏ hàng</CardTitle>
              <CardDescription>{cart.length} sản phẩm/dịch vụ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Chưa có sản phẩm trong giỏ hàng</div>
              ) : (
                <>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={`${item.type}-${item.id}`} className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.price.toLocaleString()}đ</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 bg-transparent"
                            onClick={() => updateQuantity(item.id, item.type, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 bg-transparent"
                            onClick={() => updateQuantity(item.id, item.type, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeFromCart(item.id, item.type)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span>{subtotal.toLocaleString()}đ</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-chart-2">
                        <span>Giảm giá ({customer?.tier})</span>
                        <span>-{discount.toLocaleString()}đ</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-base">
                      <span>Tổng cộng</span>
                      <span>{total.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Điểm tích lũy</span>
                      <span>+{pointsEarned} điểm</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-sm">Phương thức thanh toán</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="grid grid-cols-3 gap-2"
                    >
                      <Label
                        htmlFor="cash"
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer text-center ${
                          paymentMethod === "cash" ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <RadioGroupItem value="cash" id="cash" className="sr-only" />
                        <Banknote className="w-5 h-5" />
                        <span className="text-xs">Tiền mặt</span>
                      </Label>
                      <Label
                        htmlFor="transfer"
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer text-center ${
                          paymentMethod === "transfer" ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <RadioGroupItem value="transfer" id="transfer" className="sr-only" />
                        <QrCode className="w-5 h-5" />
                        <span className="text-xs">Chuyển khoản</span>
                      </Label>
                      <Label
                        htmlFor="card"
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer text-center ${
                          paymentMethod === "card" ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <RadioGroupItem value="card" id="card" className="sr-only" />
                        <CreditCard className="w-5 h-5" />
                        <span className="text-xs">Thẻ</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  <Button className="w-full" size="lg">
                    Thanh toán {total.toLocaleString()}đ
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
