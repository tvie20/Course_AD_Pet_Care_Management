"use client"

import { useState } from "react"
import Link from "next/link"
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/cart-provider"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const router = useRouter()
  const { items, removeFromCart, updateQuantity } = useCart()
  const [selectedItems, setSelectedItems] = useState<number[]>([])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map((item) => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id])
    } else {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id))
    }
  }

  const handleDelete = (id: number) => {
    removeFromCart(id)
    setSelectedItems(selectedItems.filter((itemId) => itemId !== id))
  }

  const subtotal = items
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0)

  const isAllSelected = items.length > 0 && selectedItems.length === items.length

  const handleCheckout = () => {
    localStorage.setItem('checkout_selected_ids', JSON.stringify(selectedItems))
    router.push('/customer/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Giỏ hàng trống</h2>
        <p className="text-muted-foreground">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
        <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700">
          <Link href="/customer/shop">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/customer/shop">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Giỏ hàng của bạn ({items.length})</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-4 px-4 pb-2">
            <Checkbox checked={isAllSelected} onCheckedChange={(checked) => handleSelectAll(checked as boolean)} id="select-all"/>
            <label htmlFor="select-all" className="font-medium cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors">
              Chọn tất cả ({items.length} sản phẩm)
            </label>
          </div>
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4 flex gap-4">
                  <div className="flex items-center"><Checkbox checked={selectedItems.includes(item.id)} onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}/></div>
                  <div className="w-24 h-24 bg-muted rounded-md shrink-0 flex items-center justify-center text-xs text-muted-foreground">Image</div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="font-medium line-clamp-2 pr-4">{item.name}</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-500 -mt-1 -mr-2" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <div className="font-bold text-emerald-600">{item.price.toLocaleString()}đ</div>
                        <div className="flex items-center border rounded-md">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}><Minus className="w-3 h-3" /></Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="w-3 h-3" /></Button>
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Tổng cộng</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Tạm tính ({selectedItems.length} sản phẩm):</span><span className="font-medium">{subtotal.toLocaleString()}đ</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Giảm giá:</span><span className="font-medium">0đ</span></div>
              </div>
              <Separator />
              <div className="flex justify-between items-end"><span className="font-bold">Tổng thanh toán:</span><span className="text-2xl font-bold text-emerald-600">{subtotal.toLocaleString()}đ</span></div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-base" disabled={selectedItems.length === 0} onClick={handleCheckout}>Mua hàng ({selectedItems.length})</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}