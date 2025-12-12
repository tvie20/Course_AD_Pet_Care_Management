"use client"

import { useState, useMemo } from "react"
import { 
  Search, 
  Plus, 
  Package, 
  Syringe, 
  Pill, 
  ShoppingBag, 
  AlertTriangle, 
  Clock, 
  Trash2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// --- DỮ LIỆU ---

type ProductType = "Thuốc" | "Vắc-xin" | "Sản phẩm" | "Thức ăn" | "Phụ kiện"

interface Product {
  id: number
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

const initialProducts: Product[] = [
  { 
    id: 1, code: "SP001", name: "Thức ăn Royal Canin 2kg", type: "Thức ăn", 
    price: 450000, stock: 25, minStock: 10, mfg: "01/01/2024", expiry: "01/01/2026",
    suppliers: ["Royal Canin Vietnam", "PetMart Distribution"]
  },
  { 
    id: 2, code: "SP002", name: "Thức ăn Pedigree 1.5kg", type: "Thức ăn", 
    price: 280000, stock: 8, minStock: 10, mfg: "15/02/2024", expiry: "15/08/2025",
    suppliers: ["Pedigree Vietnam"]
  },
  { 
    id: 3, code: "TH001", name: "Thuốc giun Nexgard", type: "Thuốc", 
    price: 180000, stock: 100, minStock: 20, mfg: "10/03/2024", expiry: "10/03/2027",
    suppliers: ["Merial Vietnam", "Vemedim"]
  },
  { 
    id: 4, code: "PK001", name: "Shampoo trị nấm", type: "Phụ kiện", 
    price: 220000, stock: 30, minStock: 15, mfg: "05/05/2024", expiry: "05/05/2027",
    suppliers: ["PetCare Supplies"]
  },
  {
    id: 5, code: "VX001", name: "Vắc-xin 5 bệnh chó", type: "Vắc-xin",
    price: 350000, stock: 25, minStock: 10, mfg: "30/06/2023", expiry: "30/06/2025",
    suppliers: ["Zoetis", "Virbac"]
  },
  {
    id: 6, code: "VX002", name: "Vắc-xin dại", type: "Vắc-xin",
    price: 150000, stock: 50, minStock: 20, mfg: "15/03/2023", expiry: "15/03/2025",
    suppliers: ["Merial Vietnam"]
  },
  {
    id: 7, code: "VX003", name: "Vắc-xin 4 bệnh mèo", type: "Vắc-xin",
    price: 320000, stock: 5, minStock: 10, mfg: "20/08/2023", expiry: "20/08/2025",
    suppliers: ["Zoetis"]
  },
]

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
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all") 
  const [importOpen, setImportOpen] = useState(false)
  
  const [importRows, setImportRows] = useState<ImportRow[]>([
    { id: 1, mode: "select", productId: "", productName: "", productType: "Sản phẩm", autoCode: "", supplier: "", supplierMode: "select", quantity: 0, nsx: "", hsd: "" }
  ])

  // --- LOGIC TÍNH TOÁN ---
  
  // Tính danh sách sắp hết hạn (Fix lỗi undefined variable)
  const expiringProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.expiry) return false;
      const [day, month, year] = p.expiry.split('/');
      // Chuyển format dd/mm/yyyy sang đối tượng Date chuẩn
      const expDate = new Date(`${year}-${month}-${day}`);
      const thresholdDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 ngày tới
      return expDate < thresholdDate;
    })
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.code.toLowerCase().includes(search.toLowerCase())
      
      // Lọc theo Tab Sắp hết hạn
      if (activeTab === "expiring") {
         return expiringProducts.includes(p);
      }
      return matchSearch;
    })
  }, [search, activeTab, products, expiringProducts])

  const lowStockCount = products.filter((p) => p.stock < p.minStock).length
  const expiringCount = expiringProducts.length;

  // --- HELPER ---
  const generateCode = (type: ProductType) => {
      let prefix = "SP"
      if (type === "Thuốc") prefix = "TH"
      if (type === "Vắc-xin") prefix = "VX"
      if (type === "Thức ăn") prefix = "TA"
      if (type === "Phụ kiện") prefix = "PK"
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

  // --- FORM HANDLERS ---
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
        
        // Sinh mã tự động
        if (updates.productType && row.mode === 'new') {
            updatedRow.autoCode = generateCode(updates.productType)
        }
        
        // Reset NCC
        if (updates.productId) {
            updatedRow.supplier = ""
            updatedRow.supplierMode = "select"
        }
        return updatedRow
      }
      return row
    }))
  }

  const getSuppliersForProduct = (productId: string) => {
    const product = products.find(p => p.id.toString() === productId)
    return product ? product.suppliers : []
  }

  const handleSaveImport = () => {
      const newProducts: Product[] = []
      
      importRows.forEach(row => {
          if (row.mode === 'new' && row.productName) {
              newProducts.push({
                  id: Date.now() + Math.floor(Math.random() * 1000),
                  code: row.autoCode,
                  name: row.productName,
                  type: row.productType,
                  price: 0, 
                  stock: Number(row.quantity),
                  minStock: 10,
                  mfg: row.nsx ? new Date(row.nsx).toLocaleDateString('en-GB') : '',
                  expiry: row.hsd ? new Date(row.hsd).toLocaleDateString('en-GB') : '',
                  suppliers: [row.supplier]
              })
          } else if (row.mode === 'select' && row.productId) {
              const pIndex = products.findIndex(p => p.id.toString() === row.productId)
              if (pIndex > -1) {
                  const updatedP = {...products[pIndex]}
                  updatedP.stock += Number(row.quantity)
              }
          }
      })

      if (newProducts.length > 0) {
          setProducts([...products, ...newProducts])
      }
      
      setImportOpen(false)
      setImportRows([{ id: Date.now(), mode: "select", productId: "", productName: "", productType: "Sản phẩm", autoCode: "", supplier: "", supplierMode: "select", quantity: 0, nsx: "", hsd: "" }])
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
          {/* Giữ nguyên fix lỗi nền và kích thước */}
          <DialogContent className="w-full lg:max-w-4xl md:max-w-5xl sm:max-w-6xl bg-white">
            <DialogHeader>
              <DialogTitle>Lập phiếu nhập hàng</DialogTitle>
              <DialogDescription>Nhập thông tin sản phẩm và nhà cung cấp.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mã phiếu nhập</Label>
                  <Input value="PN-AUTO-001" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Ngày nhập</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Chi tiết sản phẩm</Label>
                <div className="border rounded-lg overflow-hidden">
                   <Table>
                      <TableHeader className="bg-slate-50">
                         <TableRow>
                            <TableHead>Sản phẩm</TableHead>
                            <TableHead>Nhà cung cấp</TableHead>
                            <TableHead>SL</TableHead>
                            <TableHead>Ngày SX</TableHead>
                            <TableHead>Hạn SD</TableHead>
                            <TableHead></TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {importRows.map((row) => (
                            <TableRow key={row.id} className="align-top">
                               
                               {/* SẢN PHẨM */}
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
                                            <div className="p-2 border-b mb-1 sticky top-0 bg-white z-10">
                                                <span className="text-xs text-muted-foreground">Gõ để tìm kiếm...</span>
                                            </div>
                                            <SelectItem value="new" className="font-medium">+ Thêm mới</SelectItem>
                                            {products.map(p => (
                                               <SelectItem key={p.id} value={p.id.toString()}>
                                                  {p.name}
                                               </SelectItem>
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
                                                  <SelectTrigger className="w-[140px]">
                                                      <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="Sản phẩm">Sản phẩm</SelectItem>
                                                      <SelectItem value="Thuốc">Thuốc</SelectItem>
                                                      <SelectItem value="Vắc-xin">Vắc-xin</SelectItem>
                                                      <SelectItem value="Thức ăn">Thức ăn</SelectItem>
                                                      <SelectItem value="Phụ kiện">Phụ kiện</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                              <Input value={row.autoCode} disabled className="bg-slate-50 w-[100px] text-center" />
                                          </div>
                                      </div>
                                  )}
                               </TableCell>

                               {/* NHÀ CUNG CẤP */}
                               <TableCell>
                                  {row.supplierMode === 'select' ? (
                                      <Select 
                                         value={row.supplier} 
                                         onValueChange={(val) => {
                                             if (val === 'new_sup') updateRow(row.id, { supplierMode: 'new', supplier: '' })
                                             else updateRow(row.id, { supplier: val })
                                         }}
                                         disabled={row.mode === 'select' && !row.productId}
                                      >
                                         <SelectTrigger>
                                            <SelectValue placeholder="Chọn NCC" />
                                         </SelectTrigger>
                                         <SelectContent>
                                            <SelectItem value="new_sup" className="font-medium">+ NCC mới</SelectItem>
                                            {row.mode === 'select' 
                                                ? getSuppliersForProduct(row.productId).map(sup => (
                                                    <SelectItem key={sup} value={sup}>{sup}</SelectItem>
                                                  ))
                                                : [] 
                                            }
                                         </SelectContent>
                                      </Select>
                                  ) : (
                                      <div className="flex gap-1">
                                          <Input 
                                              placeholder="Tên NCC..."
                                              value={row.supplier}
                                              onChange={(e) => updateRow(row.id, { supplier: e.target.value })}
                                          />
                                          <Button variant="ghost" size="icon" onClick={() => updateRow(row.id, { supplierMode: 'select', supplier: '' })}>
                                              <Trash2 className="w-4 h-4"/>
                                          </Button>
                                      </div>
                                  )}
                               </TableCell>

                               {/* SL */}
                               <TableCell>
                                  <Input 
                                     type="number" className="text-center"
                                     value={row.quantity}
                                     onChange={(e) => updateRow(row.id, { quantity: Number(e.target.value) })}
                                  />
                               </TableCell>

                               {/* NGÀY SX */}
                               <TableCell>
                                  <Input type="date" onChange={(e) => updateRow(row.id, { nsx: e.target.value })}/>
                               </TableCell>

                               {/* HẠN SD */}
                               <TableCell>
                                  <Input type="date" onChange={(e) => updateRow(row.id, { hsd: e.target.value })}/>
                               </TableCell>

                               {/* DELETE */}
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
                <Button variant="outline" onClick={() => setImportOpen(false)}>
                  Hủy
                </Button>
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
              <p className="font-semibold">{lowStockCount} sản phẩm</p>
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
              <p className="font-semibold">{expiringCount} lô hàng</p>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
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
                      
                      {/* Cột tách biệt rõ ràng */}
                      <th className="pb-3 font-medium text-right w-[140px] pr-8">Tồn kho</th>
                      <th className="pb-3 font-medium w-[130px]">Ngày SX</th>
                      <th className="pb-3 font-medium w-[130px]">Hạn SD</th>
                      
                      <th className="pb-3 font-medium w-[130px]">Trạng thái</th>
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
                        
                        <td className="py-4 text-right pr-8">
                          <span className={product.stock < product.minStock ? "text-destructive font-semibold" : ""}>
                            {product.stock}
                          </span>
                          <span className="text-muted-foreground"> / {product.minStock}</span>
                        </td>

                        <td className="py-4 text-muted-foreground">{product.mfg}</td>
                        <td className="py-4 text-muted-foreground">{product.expiry}</td>

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
                        <p className="text-sm text-muted-foreground">NSX: {product.mfg}</p>
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