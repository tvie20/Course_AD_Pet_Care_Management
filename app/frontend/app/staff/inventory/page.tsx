"use client"

import { useState, useEffect } from "react"
import { 
  Search, Plus, Package, Syringe, Pill, ShoppingBag, 
  AlertTriangle, Clock, Trash2, Loader2, ChevronLeft, ChevronRight 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type ProductType = "Thuốc" | "Vắc-xin" | "Sản phẩm" | "Thức ăn" | "Phụ kiện"

interface Product {
  id: string
  code: string
  name: string
  type: ProductType
  price: number
  stock: number
  minStock: number
  mfg: string 
  expiry: string 
  suppliers: string[] 
}

interface ImportRow {
  id: number
  mode: "select" | "new"
  productId: string
  productName: string 
  productType: ProductType 
  autoCode: string 
  supplier: string
  supplierMode: "select" | "new" 
  quantity: number
  nsx: string
  hsd: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState({ lowStock: 0, expiring: 0 })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all") 
  
  // Pagination State
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const LIMIT = 20

  const [importOpen, setImportOpen] = useState(false)
  const [importRows, setImportRows] = useState<ImportRow[]>([
    { id: 1, mode: "select", productId: "", productName: "", productType: "Sản phẩm", autoCode: "", supplier: "", supplierMode: "select", quantity: 0, nsx: "", hsd: "" }
  ])

  // --- API HELPER ---
  const getAuthHeader = () => {
    const token = localStorage.getItem("staffAccessToken")
    const userStr = localStorage.getItem("staffUser")
    if (!token || !userStr) return null
    const user = JSON.parse(userStr)
    return {
      "Content-Type": "application/json",
      "authorization": token,
      "x-client-id": user.MaNV
    }
  }

  const fetchInventory = async (currentPage: number) => {
    setLoading(true)
    const headers = getAuthHeader()
    if (!headers) return

    try {
        const queryParams = new URLSearchParams({
            search: search,
            filter: activeTab === 'expiring' ? 'expiring' : 'all',
            page: currentPage.toString(),
            limit: LIMIT.toString()
        })

        const res = await fetch(`http://localhost:3055/api/staff/inventory?${queryParams.toString()}`, { headers })
        
        if (res.ok) {
            const data = await res.json()
            setProducts(data.metadata.list)
            setStats(data.metadata.stats)
            setTotalPages(Math.ceil(data.metadata.total / LIMIT))
        }
    } catch (error) {
        console.error(error)
    } finally {
        setLoading(false)
    }
  }

  // --- EFFECTS ---
  useEffect(() => {
      const timer = setTimeout(() => {
          setPage(1)
          fetchInventory(1)
      }, 500)
      return () => clearTimeout(timer)
  }, [search, activeTab])

  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setPage(newPage)
          fetchInventory(newPage)
      }
  }

  // --- HELPER ---
  const generateCode = (type: ProductType) => {
      let prefix = "SP"
      if (type === "Thuốc") prefix = "TH"
      if (type === "Vắc-xin") prefix = "VX"
      const randomNum = Math.floor(100 + Math.random() * 900)
      return `${prefix}${randomNum}`
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Vắc-xin": return <Syringe className="w-4 h-4" />
      case "Thuốc": return <Pill className="w-4 h-4" />
      case "Thức ăn": return <Package className="w-4 h-4" />
      default: return <ShoppingBag className="w-4 h-4" />
    }
  }

  // --- IMPORT HANDLERS ---
  const handleAddRow = () => {
    setImportRows([...importRows, { id: Date.now(), mode: "select", productId: "", productName: "", productType: "Sản phẩm", autoCode: "", supplier: "", supplierMode: "select", quantity: 0, nsx: "", hsd: "" }])
  }

  const handleRemoveRow = (id: number) => {
    if (importRows.length > 1) {
      setImportRows(importRows.filter(row => row.id !== id))
    }
  }

  const updateRow = (id: number, updates: Partial<ImportRow>) => {
    setImportRows(rows => rows.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, ...updates }
        if (updates.productType && row.mode === 'new') {
            updatedRow.autoCode = generateCode(updates.productType)
        }
        if (updates.productId) {
            const p = products.find(prod => prod.id === updates.productId)
            if (p) {
                updatedRow.productName = p.name
                updatedRow.autoCode = p.code
            }
        }
        return updatedRow
      }
      return row
    }))
  }

  const handleSaveImport = async () => {
      const headers = getAuthHeader()
      if (!headers) return

      // Map rows to API payload
      const items = importRows.map(row => ({
          code: row.mode === 'new' ? row.autoCode : row.autoCode || row.productId, 
          name: row.productName,
          type: row.productType,
          quantity: row.quantity,
          nsx: row.nsx,
          hsd: row.hsd
      }))

      try {
          const res = await fetch("http://localhost:3055/api/staff/inventory/import", {
              method: "POST",
              headers,
              body: JSON.stringify({ items })
          })

          if (res.ok) {
              alert("Nhập hàng thành công!")
              setImportOpen(false)
              setImportRows([{ id: Date.now(), mode: "select", productId: "", productName: "", productType: "Sản phẩm", autoCode: "", supplier: "", supplierMode: "select", quantity: 0, nsx: "", hsd: "" }])
              fetchInventory(1) // Refresh data
          } else {
              const err = await res.json()
              alert(err.message || "Lỗi khi nhập hàng")
          }
      } catch (error) {
          console.error(error)
          alert("Lỗi kết nối")
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
          <DialogContent className="w-full lg:max-w-4xl bg-white">
            <DialogHeader>
              <DialogTitle>Lập phiếu nhập hàng</DialogTitle>
              <DialogDescription>Nhập thông tin sản phẩm và nhà cung cấp.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mã phiếu nhập</Label>
                  <Input value="PN-AUTO" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Ngày nhập</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Chi tiết sản phẩm</Label>
                <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                   <Table>
                      <TableHeader className="bg-slate-50 sticky top-0 z-10">
                         <TableRow>
                            <TableHead>Sản phẩm</TableHead>
                            <TableHead>SL</TableHead>
                            <TableHead>Ngày SX</TableHead>
                            <TableHead>Hạn SD</TableHead>
                            <TableHead></TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {importRows.map((row) => (
                            <TableRow key={row.id} className="align-top">
                               <TableCell>
                                  {row.mode === 'select' ? (
                                      <Select 
                                         value={row.productId} 
                                         onValueChange={(val) => {
                                            if (val === 'new') updateRow(row.id, { mode: 'new', autoCode: generateCode('Sản phẩm') })
                                            else updateRow(row.id, { productId: val })
                                         }}
                                      >
                                         <SelectTrigger>
                                            <SelectValue placeholder="Chọn SP" />
                                         </SelectTrigger>
                                         <SelectContent>
                                            <SelectItem value="new" className="font-medium">+ Thêm mới</SelectItem>
                                            {products.map(p => (
                                               <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                         </SelectContent>
                                      </Select>
                                  ) : (
                                      <div className="space-y-2">
                                          <div className="flex gap-2">
                                              <Input 
                                                  placeholder="Tên SP..." 
                                                  value={row.productName}
                                                  onChange={(e) => updateRow(row.id, { productName: e.target.value })}
                                              />
                                              <Button variant="ghost" size="icon" onClick={() => updateRow(row.id, { mode: 'select', productName: '' })}>
                                                  <Trash2 className="w-4 h-4"/>
                                              </Button>
                                          </div>
                                          <div className="flex gap-2">
                                              <Select 
                                                  value={row.productType} 
                                                  onValueChange={(val: ProductType) => updateRow(row.id, { productType: val, autoCode: generateCode(val) })}
                                              >
                                                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="Sản phẩm">Sản phẩm</SelectItem>
                                                      <SelectItem value="Thuốc">Thuốc</SelectItem>
                                                      <SelectItem value="Vắc-xin">Vắc-xin</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                              <Input value={row.autoCode} disabled className="bg-slate-50 w-[100px] text-center" />
                                          </div>
                                      </div>
                                  )}
                               </TableCell>
                               <TableCell>
                                  <Input 
                                     type="number" className="text-center w-20"
                                     value={row.quantity}
                                     onChange={(e) => updateRow(row.id, { quantity: Number(e.target.value) })}
                                  />
                               </TableCell>
                               <TableCell>
                                  <Input type="date" onChange={(e) => updateRow(row.id, { nsx: e.target.value })}/>
                               </TableCell>
                               <TableCell>
                                  <Input type="date" onChange={(e) => updateRow(row.id, { hsd: e.target.value })}/>
                               </TableCell>
                               <TableCell>
                                  <Button variant="ghost" size="icon" onClick={() => handleRemoveRow(row.id)}>
                                     <Trash2 className="w-4 h-4 text-muted-foreground"/>
                                  </Button>
                               </TableCell>
                            </TableRow>
                         ))}
                      </TableBody>
                   </Table>
                   <div className="p-2 border-t text-center bg-slate-50">
                      <Button variant="ghost" size="sm" onClick={handleAddRow} className="w-full">
                         <Plus className="w-4 h-4 mr-2"/> Thêm dòng
                      </Button>
                   </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setImportOpen(false)}>Hủy</Button>
                <Button onClick={handleSaveImport}>Lưu phiếu nhập</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ALERT CARDS */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-accent">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="font-semibold">{stats.lowStock} sản phẩm</p>
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
              <p className="font-semibold">{stats.expiring} lô hàng</p>
              <p className="text-sm text-muted-foreground">sắp hết hạn trong 60 ngày</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN TABLE */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Danh sách sản phẩm</CardTitle>
              <CardDescription>Tổng cộng {products.length} sản phẩm (Trang {page})</CardDescription>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-48"
                />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="expiring">Sắp hết hạn</TabsTrigger>
            </TabsList>
            
            <div className="mt-4 border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Mã SP</TableHead>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead className="text-right">Giá</TableHead>
                      <TableHead className="text-right w-[140px]">Tồn kho</TableHead>
                      <TableHead className="w-[130px]">Hạn SD</TableHead>
                      <TableHead className="w-[130px]">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="animate-spin inline-block"/></TableCell></TableRow>
                    ) : products.length > 0 ? (
                        products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">{product.code}</code></TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>
                            <div className="flex items-center gap-2">
                                {getTypeIcon(product.type)}
                                <span>{product.type}</span>
                            </div>
                            </TableCell>
                            <TableCell className="text-right">{product.price.toLocaleString()}đ</TableCell>
                            <TableCell className="text-right">
                            <span className={product.stock < product.minStock ? "text-destructive font-semibold" : ""}>
                                {product.stock}
                            </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{product.expiry || "-"}</TableCell>
                            <TableCell>
                            {product.stock < product.minStock ? (
                                <Badge variant="destructive">Thiếu hàng</Badge>
                            ) : (
                                <Badge variant="secondary">Đủ hàng</Badge>
                            )}
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground h-24">Không có dữ liệu</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 py-4 border-t bg-slate-50/50 mt-4 rounded-b-lg">
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page === 1 || loading}>
                        <ChevronLeft className="h-4 w-4" /> Trước
                    </Button>
                    <span className="text-sm font-medium">Trang {page} / {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages || loading}>
                        Sau <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}