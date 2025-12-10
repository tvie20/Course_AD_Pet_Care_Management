"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Clock, Search, Plus, Package, Syringe, Pill, ShoppingBag } from "lucide-react"

const products = [
  { id: 1, code: "SP001", name: "Thức ăn Royal Canin 2kg", type: "Thức ăn", price: 450000, stock: 25, minStock: 10 },
  { id: 2, code: "SP002", name: "Thức ăn Pedigree 1.5kg", type: "Thức ăn", price: 280000, stock: 8, minStock: 10 },
  { id: 3, code: "SP003", name: "Thuốc giun Nexgard", type: "Thuốc", price: 180000, stock: 100, minStock: 20 },
  { id: 4, code: "SP004", name: "Shampoo trị nấm", type: "Phụ kiện", price: 220000, stock: 30, minStock: 15 },
  {
    id: 5,
    code: "VX001",
    name: "Vắc-xin 5 bệnh chó",
    type: "Vắc-xin",
    price: 350000,
    stock: 25,
    minStock: 10,
    lot: "LOT2025A",
    expiry: "30/06/2025",
  },
  {
    id: 6,
    code: "VX002",
    name: "Vắc-xin dại",
    type: "Vắc-xin",
    price: 150000,
    stock: 50,
    minStock: 20,
    lot: "LOT2025B",
    expiry: "15/03/2025",
  },
  {
    id: 7,
    code: "VX003",
    name: "Vắc-xin 4 bệnh mèo",
    type: "Vắc-xin",
    price: 320000,
    stock: 5,
    minStock: 10,
    lot: "LOT2025C",
    expiry: "20/08/2025",
  },
]

const lowStockProducts = products.filter((p) => p.stock < p.minStock)
const expiringProducts = products.filter(
  (p) =>
    p.expiry && new Date(p.expiry.split("/").reverse().join("-")) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
)

export default function InventoryPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [importOpen, setImportOpen] = useState(false)

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "all" || p.type === typeFilter
    return matchSearch && matchType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Vắc-xin":
        return <Syringe className="w-4 h-4" />
      case "Thuốc":
        return <Pill className="w-4 h-4" />
      case "Thức ăn":
        return <Package className="w-4 h-4" />
      default:
        return <ShoppingBag className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý kho</h1>
          <p className="text-muted-foreground">Quản lý tồn kho và nhập hàng</p>
        </div>
        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Lập phiếu nhập
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Lập phiếu nhập hàng</DialogTitle>
              <DialogDescription>Nhập thông tin phiếu nhập hàng mới</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nhà cung cấp</Label>
                  <Input placeholder="Tên nhà cung cấp" />
                </div>
                <div className="space-y-2">
                  <Label>Ngày nhập</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Chi tiết nhập hàng</Label>
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-6 gap-2 text-sm font-medium text-muted-foreground">
                    <span className="col-span-2">Sản phẩm</span>
                    <span>Loại</span>
                    <span>Số lượng</span>
                    <span>Lô SX</span>
                    <span>HSD</span>
                  </div>
                  <div className="grid grid-cols-6 gap-2 items-center">
                    <Select>
                      <SelectTrigger className="col-span-2">
                        <SelectValue placeholder="Chọn sản phẩm" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Loại" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vaccine">Vắc-xin</SelectItem>
                        <SelectItem value="medicine">Thuốc</SelectItem>
                        <SelectItem value="food">Thức ăn</SelectItem>
                        <SelectItem value="accessory">Phụ kiện</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder="SL" />
                    <Input placeholder="Lô" />
                    <Input type="date" />
                  </div>
                  <Button variant="outline" size="sm" className="w-full border-dashed bg-transparent">
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm dòng
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setImportOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={() => setImportOpen(false)}>Lưu phiếu nhập</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-accent">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="font-semibold">{lowStockProducts.length} sản phẩm</p>
              <p className="text-sm text-muted-foreground">dưới mức tồn kho an toàn</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="font-semibold">{expiringProducts.length} lô hàng</p>
              <p className="text-sm text-muted-foreground">sắp hết hạn trong 60 ngày</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Danh sách sản phẩm</CardTitle>
              <CardDescription>Tổng cộng {products.length} sản phẩm</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Vắc-xin">Vắc-xin</SelectItem>
                  <SelectItem value="Thuốc">Thuốc</SelectItem>
                  <SelectItem value="Thức ăn">Thức ăn</SelectItem>
                  <SelectItem value="Phụ kiện">Phụ kiện</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="low">Dưới mức an toàn</TabsTrigger>
              <TabsTrigger value="expiring">Sắp hết hạn</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Mã SP</th>
                      <th className="pb-3 font-medium">Tên sản phẩm</th>
                      <th className="pb-3 font-medium">Loại</th>
                      <th className="pb-3 font-medium text-right">Giá</th>
                      <th className="pb-3 font-medium text-right">Tồn kho</th>
                      <th className="pb-3 font-medium">Lô/HSD</th>
                      <th className="pb-3 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b last:border-0">
                        <td className="py-4">
                          <code className="text-xs bg-muted px-2 py-1 rounded">{product.code}</code>
                        </td>
                        <td className="py-4 font-medium">{product.name}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(product.type)}
                            <span>{product.type}</span>
                          </div>
                        </td>
                        <td className="py-4 text-right">{product.price.toLocaleString()}đ</td>
                        <td className="py-4 text-right">
                          <span className={product.stock < product.minStock ? "text-destructive font-semibold" : ""}>
                            {product.stock}
                          </span>
                          <span className="text-muted-foreground"> / {product.minStock}</span>
                        </td>
                        <td className="py-4 text-muted-foreground text-xs">
                          {product.lot && (
                            <div>
                              <div>{product.lot}</div>
                              <div>HSD: {product.expiry}</div>
                            </div>
                          )}
                        </td>
                        <td className="py-4">
                          {product.stock < product.minStock ? (
                            <Badge variant="destructive">Thiếu hàng</Badge>
                          ) : (
                            <Badge variant="secondary">Đủ hàng</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="low" className="mt-4">
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-destructive/30 bg-destructive/5"
                  >
                    <div className="flex items-center gap-3">
                      {getTypeIcon(product.type)}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-destructive">{product.stock} còn lại</p>
                      <p className="text-xs text-muted-foreground">Tối thiểu: {product.minStock}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="expiring" className="mt-4">
              <div className="space-y-3">
                {expiringProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-accent/50 bg-accent/10"
                  >
                    <div className="flex items-center gap-3">
                      <Syringe className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Lô: {product.lot}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-accent-foreground">HSD: {product.expiry}</p>
                      <p className="text-xs text-muted-foreground">Còn {product.stock} đơn vị</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
