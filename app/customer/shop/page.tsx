"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ShoppingCart, Filter, Star, Plus, ShoppingBag } from "lucide-react"

// Dữ liệu giả lập
const categories = ["Thức ăn", "Phụ kiện", "Thuốc & TPCN"]

const products = [
  {
    id: 1,
    name: "Hạt Royal Canin cho Poodle",
    category: "Thức ăn",
    price: 185000,
    rating: 4.8,
    sold: 120,
    image: "/images/royal-canin.png",
    discount: 10,
  },
  {
    id: 2,
    name: "Cát vệ sinh Ciao Nhật Bản",
    category: "Phụ kiện",
    price: 65000,
    rating: 5.0,
    sold: 850,
    image: "/images/cat-litter.png",
    discount: 0,
  },
  {
    id: 3,
    name: "Gel dinh dưỡng Virbac Nutri-plus",
    category: "Thuốc & TPCN",
    price: 210000,
    rating: 4.9,
    sold: 200,
    image: "/images/gel-virbac.png",
    discount: 0,
  },
  {
    id: 4,
    name: "Súp thưởng Ciao Churu (Gói 4 thanh)",
    category: "Thức ăn",
    price: 22000,
    rating: 5.0,
    sold: 2100,
    image: "/images/ciao-churu.png",
    discount: 5,
  },
  {
    id: 5,
    name: "Vòng cổ chống liếm",
    category: "Phụ kiện",
    price: 45000,
    rating: 4.5,
    sold: 80,
    image: "/images/elizabeth-collar.png",
    discount: 0,
  },
]

export default function ShopPage() {
  const [search, setSearch] = useState("")

  // Hàm lọc sản phẩm chung cho các tab
  // Logic: Lọc theo Category (nếu không phải 'all') VÀ theo từ khóa tìm kiếm
  const getFilteredProducts = (category: string) => {
    return products.filter((product) => {
      const matchCategory = category === "all" ? true : product.category === category
      const matchSearch = product.name.toLowerCase().includes(search.toLowerCase())
      return matchCategory && matchSearch
    })
  }

  // Component hiển thị danh sách sản phẩm (để tái sử dụng code render)
  const ProductGrid = ({ items }: { items: typeof products }) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground col-span-full">
          Không tìm thấy sản phẩm nào trong danh mục này.
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => (
          <Card
            key={product.id}
            className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all flex flex-col"
          >
            <div className="relative aspect-square bg-muted rounded-t-xl overflow-hidden">
              {/* Ảnh sản phẩm */}
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-gray-100">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <ShoppingBag className="w-12 h-12 opacity-20" />
                )}
              </div>

              {/* Badge giảm giá */}
              {product.discount > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{product.discount}%
                </span>
              )}
            </div>

            <CardContent className="p-4 flex-1">
              <div className="text-xs text-muted-foreground mb-1">{product.category}</div>
              <h3 className="font-semibold text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-1 text-yellow-500 text-xs mb-3">
                <Star className="w-3 h-3 fill-current" />
                <span>{product.rating}</span>
                <span className="text-muted-foreground ml-1">({product.sold} đã bán)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-bold text-lg">{product.price.toLocaleString()}đ</div>
                {product.discount > 0 && (
                  <div className="text-sm text-muted-foreground line-through">
                    {(product.price * (1 + product.discount / 100)).toLocaleString()}đ
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <Button className="w-full gap-2" variant="secondary">
                <Plus className="w-4 h-4" /> Thêm vào giỏ
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Header của Shop: Tìm kiếm & Giỏ hàng */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sản phẩm cho thú cưng..."
            className="pl-9 bg-muted/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" className="gap-2 flex-1 md:flex-none">
            <Filter className="w-4 h-4" /> Bộ lọc
          </Button>
          <Button className="gap-2 flex-1 md:flex-none">
            <ShoppingCart className="w-4 h-4" />
            Giỏ hàng (2)
          </Button>
        </div>
      </div>

      {/* 3. Danh mục & Sản phẩm */}
      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          <TabsList className="bg-transparent h-auto p-0 gap-2">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border px-4 py-2 rounded-full h-auto"
            >
              Tất cả
            </TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border px-4 py-2 rounded-full h-auto"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Nội dung cho Tab "Tất cả" */}
        <TabsContent value="all" className="m-0">
          <ProductGrid items={getFilteredProducts("all")} />
        </TabsContent>

        {/* Nội dung cho từng Tab Category riêng biệt */}
        {categories.map((cat) => (
          <TabsContent key={cat} value={cat} className="m-0">
            <ProductGrid items={getFilteredProducts(cat)} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}