"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Filter, Star, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCart } from "@/components/cart-provider" // Import hook vừa tạo

const products = [
  {
    id: 1,
    name: "Hạt Royal Canin cho Poodle",
    category: "Thức ăn",
    price: 185000,
    originalPrice: 203500,
    rating: 4.8,
    sold: 120,
    discount: "-10%",
    image: "/images/royal-canin.png", // Thay bằng ảnh thật của bạn
  },
  {
    id: 2,
    name: "Cát vệ sinh Ciao Nhật Bản",
    category: "Phụ kiện",
    price: 65000,
    rating: 5,
    sold: 850,
    image: "/images/cat-litter.png",
  },
  {
    id: 3,
    name: "Gel dinh dưỡng Virbac Nutri-plus",
    category: "Thuốc & TPCN",
    price: 210000,
    rating: 4.9,
    sold: 200,
    image: "/images/gel-virbac.png",
  },
  {
    id: 4,
    name: "Súp thưởng Ciao Churu (Gói 4 thanh)",
    category: "Thức ăn",
    price: 22000,
    originalPrice: 23100,
    rating: 5,
    sold: 2100,
    discount: "-5%",
    image: "/images/ciao-churu.png",
  },
]

export default function ShopPage() {
  const { addToCart, cartCount } = useCart()
  const [activeTab, setActiveTab] = useState("Tất cả")

  return (
    <div className="space-y-6">
      {/* Header Search & Cart */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative flex-1 w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm sản phẩm cho thú cưng..." className="pl-10 bg-background" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" /> Bộ lọc
            </Button>
            <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Link href="/customer/cart">
                    <ShoppingCart className="w-4 h-4" /> 
                    Giỏ hàng ({cartCount})
                </Link>
            </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["Tất cả", "Thức ăn", "Phụ kiện", "Thuốc & TPCN"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden flex flex-col group border-none shadow-sm hover:shadow-md transition-all">
            <div className="relative aspect-square bg-muted/20 p-4 flex items-center justify-center">
              {product.discount && (
                 <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">{product.discount}</Badge>
              )}
              {/* Placeholder Image */}
              <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-muted-foreground text-xs">
                {product.name} Image
              </div>
            </div>
            
            <CardContent className="p-4 flex-1">
                <div className="text-xs text-muted-foreground mb-1">{product.category}</div>
                <h3 className="font-medium line-clamp-2 min-h-[40px] mb-2 group-hover:text-emerald-600 transition-colors">
                    {product.name}
                </h3>
                <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.sold} đã bán)</span>
                </div>
                <div className="flex items-end gap-2">
                    <span className="font-bold text-lg">{product.price.toLocaleString()}đ</span>
                    {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through mb-1">
                            {product.originalPrice.toLocaleString()}đ
                        </span>
                    )}
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button 
                    className="w-full bg-emerald-50/50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-none"
                    onClick={() => addToCart(product)}
                >
                    <Plus className="w-4 h-4 mr-2" /> Thêm vào giỏ
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}