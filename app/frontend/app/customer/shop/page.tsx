"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Star, Plus, PackageSearch, X, Minus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCart } from "@/components/cart-provider"

interface ProductUI {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  sold: number;
  image: string;
}

const CATEGORY_TABS = ["Tất cả", "Thức ăn & Phụ kiện", "Thuốc", "Vắc xin"]

export default function ShopPage() {
  const { addToCart, cartCount } = useCart()
  
  const [products, setProducts] = useState<ProductUI[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [activeTab, setActiveTab] = useState("Tất cả")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProducts = async () => {
        try {
            const res = await fetch("http://localhost:3055/api/products")
            if (res.ok) {
                const data = await res.json()
                const rawList = data.metadata || data || [] 
                
                const mappedProducts: ProductUI[] = rawList.map((item: any) => {
                    let categoryName = "Thức ăn & Phụ kiện"
                    const type = item.LoaiSP || item.loaiSP;

                    if (type === 'T') categoryName = "Thuốc"
                    if (type === 'V') categoryName = "Vắc xin"

                    return {
                        id: item.MaSP || item.id,
                        name: item.TenSP || item.name,
                        category: categoryName,
                        price: Number(item.Gia || item.price || 0),
                        rating: 4.5 + Math.random() * 0.5, 
                        sold: Number(item.DaBan || item.sold || 0), 
                        image: "/images/product-placeholder.png" 
                    }
                })
                setProducts(mappedProducts)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }
    fetchProducts()
  }, [])

  const handleOpenModal = (product: any) => {
    setSelectedProduct(product)
    setQuantity(1)
  }

  const handleCloseModal = () => {
    setSelectedProduct(null)
  }

  const handleConfirmAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, quantity)
      handleCloseModal()
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeTab === "Tất cả" || product.category === activeTab
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [activeTab, searchQuery, products])

  return (
    <div className="space-y-6">
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

      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORY_TABS.map((tab) => (
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

      {isLoading ? (
        <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col group border-none shadow-sm hover:shadow-md transition-all">
              <div className="relative aspect-square bg-muted/20 p-4 flex items-center justify-center">
                <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-muted-foreground text-xs text-center p-2">{product.name}</div>
              </div>
              <CardContent className="p-4 flex-1">
                  <div className="text-xs text-muted-foreground mb-1">{product.category}</div>
                  <h3 className="font-medium line-clamp-2 min-h-10 mb-2 group-hover:text-emerald-600 transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><span className="text-xs font-medium">{product.rating.toFixed(1)}</span><span className="text-xs text-muted-foreground">({product.sold} đã bán)</span>
                  </div>
                  <div className="flex items-end gap-2">
                      <span className="font-bold text-lg">{(product.price || 0).toLocaleString()}đ</span>
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

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleCloseModal}></div>
          <Card className="relative w-full max-w-sm bg-background border-none shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <Button variant="ghost" size="icon" className="absolute right-2 top-2 z-10 bg-white/50 hover:bg-white rounded-full shadow-sm" onClick={handleCloseModal}><X className="w-4 h-4 text-black" /></Button>
            <div className="relative aspect-square bg-muted/20 p-4 flex items-center justify-center">
                <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-muted-foreground text-xs text-center p-2">{selectedProduct.name}</div>
            </div>
            <div className="p-4">
                <div className="text-xs text-muted-foreground mb-1">{selectedProduct.category}</div>
                <h3 className="font-medium text-lg mb-2 text-emerald-700">{selectedProduct.name}</h3>
                <div className="flex items-center gap-1 mb-2"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><span className="text-sm font-medium">{selectedProduct.rating.toFixed(1)}</span><span className="text-sm text-muted-foreground">({selectedProduct.sold} đã bán)</span></div>
                
                <div className="flex items-end gap-2 mb-6">
                    <span className="font-bold text-2xl">{(selectedProduct.price || 0).toLocaleString()}đ</span>
                </div>
                
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