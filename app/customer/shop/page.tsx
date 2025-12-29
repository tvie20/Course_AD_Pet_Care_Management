"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Star, Plus, PackageSearch, X, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCart } from "@/components/cart-provider"

// ... (Giữ nguyên danh sách products)
const products = [
  { id: 1, name: "Hạt Royal Canin cho Poodle", category: "Thức ăn", price: 185000, originalPrice: 203500, rating: 4.8, sold: 120, discount: "-10%", image: "/images/royal-canin.png" },
  { id: 2, name: "Cát vệ sinh Ciao Nhật Bản", category: "Phụ kiện", price: 65000, rating: 5, sold: 850, image: "/images/cat-litter.png" },
  { id: 3, name: "Gel dinh dưỡng Virbac Nutri-plus", category: "Thuốc & TPCN", price: 210000, rating: 4.9, sold: 200, image: "/images/gel-virbac.png" },
  { id: 4, name: "Súp thưởng Ciao Churu (Gói 4 thanh)", category: "Thức ăn", price: 22000, originalPrice: 23100, rating: 5, sold: 2100, discount: "-5%", image: "/images/ciao-churu.png" },
]

export default function ShopPage() {
  const { addToCart, cartCount } = useCart()
  
  const [activeTab, setActiveTab] = useState("Tất cả")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)

  const handleOpenModal = (product: any) => {
    setSelectedProduct(product)
    setQuantity(1)
  }

  const handleCloseModal = () => {
    setSelectedProduct(null)
  }

  // --- GỌI 1 LẦN DUY NHẤT Ở ĐÂY ---
  const handleConfirmAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, quantity) // Đã hoạt động mượt mà!
      handleCloseModal()
    }
  }

  // ... (Phần logic lọc sản phẩm giữ nguyên)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeTab === "Tất cả" || product.category === activeTab
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [activeTab, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header Search & Cart */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative flex-1 w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm sản phẩm cho thú cưng..." 
            className="pl-10 bg-background" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
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
          <Button key={tab} variant={activeTab === tab ? "default" : "ghost"} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "bg-emerald-600 hover:bg-emerald-700" : ""}>{tab}</Button>
        ))}
      </div>

      {/* Product List */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col group border-none shadow-sm hover:shadow-md transition-all">
              <div className="relative aspect-square bg-muted/20 p-4 flex items-center justify-center">
                {product.discount && (<Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">{product.discount}</Badge>)}
                <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-muted-foreground text-xs text-center p-2">{product.name} Image</div>
              </div>
              <CardContent className="p-4 flex-1">
                  <div className="text-xs text-muted-foreground mb-1">{product.category}</div>
                  <h3 className="font-medium line-clamp-2 min-h-10 mb-2 group-hover:text-emerald-600 transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><span className="text-xs font-medium">{product.rating}</span><span className="text-xs text-muted-foreground">({product.sold} đã bán)</span>
                  </div>
                  <div className="flex items-end gap-2">
                      <span className="font-bold text-lg">{product.price.toLocaleString()}đ</span>
                      {product.originalPrice && (<span className="text-sm text-muted-foreground line-through mb-1">{product.originalPrice.toLocaleString()}đ</span>)}
                  </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                  <Button className="w-full bg-emerald-50/50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-none" onClick={() => handleOpenModal(product)}>
                      <Plus className="w-4 h-4 mr-2" /> Thêm vào giỏ hàng
                  </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <PackageSearch className="w-16 h-16 text-muted-foreground opacity-20" />
          <div className="space-y-1"><h3 className="text-lg font-medium">Không tìm thấy sản phẩm</h3><p className="text-muted-foreground">Hãy thử tìm kiếm bằng từ khóa khác hoặc thay đổi bộ lọc.</p></div>
        </div>
      )}

      {/* Modal Popup */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleCloseModal}></div>
          <Card className="relative w-full max-w-sm bg-background border-none shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <Button variant="ghost" size="icon" className="absolute right-2 top-2 z-10 bg-white/50 hover:bg-white rounded-full shadow-sm" onClick={handleCloseModal}><X className="w-4 h-4 text-black" /></Button>
            <div className="relative aspect-square bg-muted/20 p-4 flex items-center justify-center">
                {selectedProduct.discount && (<Badge className="absolute top-2 right-12 bg-red-500 hover:bg-red-600 z-10">{selectedProduct.discount}</Badge>)}
                <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-muted-foreground text-xs text-center p-2">{selectedProduct.name} Image</div>
            </div>
            <div className="p-4">
                <div className="text-xs text-muted-foreground mb-1">{selectedProduct.category}</div>
                <h3 className="font-medium text-lg mb-2 text-emerald-700">{selectedProduct.name}</h3>
                <div className="flex items-center gap-1 mb-2"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><span className="text-sm font-medium">{selectedProduct.rating}</span><span className="text-sm text-muted-foreground">({selectedProduct.sold} đã bán)</span></div>
                <div className="flex items-end gap-2 mb-6"><span className="font-bold text-2xl">{selectedProduct.price.toLocaleString()}đ</span>{selectedProduct.originalPrice && (<span className="text-base text-muted-foreground line-through mb-1">{selectedProduct.originalPrice.toLocaleString()}đ</span>)}</div>
                
                <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg border border-dashed">
                    <span className="text-sm font-medium">Số lượng:</span>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}><Minus className="w-3 h-3" /></Button>
                        <span className="font-bold w-6 text-center">{quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(quantity + 1)}><Plus className="w-3 h-3" /></Button>
                    </div>
                </div>

                <Button className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 h-10 font-medium" onClick={handleConfirmAddToCart}>
                    <Plus className="w-4 h-4 mr-2" /> Thêm vào giỏ hàng
                </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}