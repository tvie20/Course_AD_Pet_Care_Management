"use client"

import { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Plus, 
  X, 
  CreditCard, 
  Banknote, 
  QrCode,
  Trash2,
  Search,
  User,
  PawPrint
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// --- DỮ LIỆU GIẢ LẬP ---

type ItemType = "product" | "vaccine" | "service"

interface InventoryItem {
  id: number
  code: string
  type: ItemType
  name: string
  price: number
  unit: string
  stock?: number
}

interface CartItem extends InventoryItem {
  quantity: number
}

interface Customer {
  id: string
  name: string
  phone: string
  pets: { id: string; name: string }[]
}

// Cấu trúc dữ liệu cho MỘT hóa đơn
interface InvoiceState {
  id: string
  cart: CartItem[]
  customer: Customer | null
  selectedPetId: string | null
  discountInput: number
  discountUnit: "vnd" | "percent"
  cashAmount: number
  transferAmount: number
  note: string
  internalNote: string
}

const inventory: InventoryItem[] = [
  { id: 1, code: "SP001", type: "product", name: "Pate Whiskas vị Cá Ngừ", price: 13000, unit: "gói", stock: 100 },
  { id: 2, code: "SP002", type: "product", name: "Thức ăn Royal Canin 2kg", price: 450000, unit: "bao", stock: 25 },
  { id: 3, code: "SP003", type: "product", name: "Cát vệ sinh Ciao 5L", price: 65000, unit: "túi", stock: 50 },
  { id: 4, code: "VX001", type: "vaccine", name: "Vắc-xin 4 bệnh Mèo (Purevax)", price: 350000, unit: "mũi", stock: 30 },
  { id: 5, code: "VX002", type: "vaccine", name: "Vắc-xin Dại (Rabisin)", price: 50000, unit: "mũi", stock: 100 },
  { id: 9, code: "VX003", type: "vaccine", name: "Vắc-xin 7 bệnh Chó (Recombitek)", price: 400000, unit: "mũi", stock: 40 },
  { id: 6, code: "DV001", type: "service", name: "Tắm chó < 5kg", price: 280000, unit: "lần" },
  { id: 7, code: "DV002", type: "service", name: "Cắt tỉa lông toàn thân", price: 350000, unit: "lần" },
  { id: 8, code: "DV003", type: "service", name: "Khám lâm sàng", price: 100000, unit: "lần" },
]
  
  // State khách hàng
  const mockCustomer: Customer = {
  id: "KH001",
  name: "Hồ Nguyễn Nam Phương",
  phone: "0336726684",
  pets: [
    { id: "P01", name: "Mochi (Poodle)" },
    { id: "P02", name: "Lu (Corgi)" }
  ]
  }

  export default function POSPage() {
    const router = useRouter()
  // --- STATE QUẢN LÝ NHIỀU HÓA ĐƠN ---
  // Mỗi phần tử trong mảng là một hóa đơn độc lập
  const [invoices, setInvoices] = useState<InvoiceState[]>([
    {
      id: "HD243",
      cart: [
        { id: 6, code: "DV001", type: "service", name: "Tắm chó < 5kg", price: 280000, unit: "lần", quantity: 1 },
        { id: 4, code: "VX001", type: "vaccine", name: "Vắc-xin 4 bệnh Mèo", price: 350000, unit: "mũi", stock: 30, quantity: 1 },
        { id: 1, code: "SP001", type: "product", name: "Pate Whiskas vị Cá Ngừ", price: 13000, unit: "gói", stock: 100, quantity: 5 },
      ],
      customer: mockCustomer,
      selectedPetId: "P01",
      discountInput: 0,
      discountUnit: "vnd",
      cashAmount: 300000,
      transferAmount: 0,
      note: "",
      internalNote: ""
    }
  ])
  const [activeTabId, setActiveTabId] = useState<string>("HD243")

// State UI cục bộ (Search & Filter)
  const [itemTypeMode, setItemTypeMode] = useState<ItemType>("service")
  const [searchQuery, setSearchQuery] = useState("")

  // Lấy hóa đơn đang active
  const currentInvoice = useMemo(() => 
    invoices.find(inv => inv.id === activeTabId) || invoices[0], 
  [invoices, activeTabId])

  // Helper cập nhật hóa đơn hiện tại
  const updateCurrentInvoice = (updates: Partial<InvoiceState>) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === activeTabId ? { ...inv, ...updates } : inv
    ))
  }

  // --- ACTIONS TRÊN HÓA ĐƠN ---

  // 1. Tạo hóa đơn mới (Nút +)
  const createNewInvoice = () => {
    const newId = `HD${Math.floor(Math.random() * 1000) + 200}`
    const newInvoice: InvoiceState = {
      id: newId,
      cart: [],
      customer: null,
      selectedPetId: null,
      discountInput: 0,
      discountUnit: "vnd",
      cashAmount: 0,
      transferAmount: 0,
      note: "",
      internalNote: ""
    }
    setInvoices([...invoices, newInvoice])
    setActiveTabId(newId)
  }

  // 2. Đóng hóa đơn (Nút X trên tab hoặc sau khi thanh toán)
  const closeInvoice = (idToDelete: string, e?: React.MouseEvent) => {
    e?.stopPropagation() // Ngăn chặn sự kiện click tab
    
    // Không cho xóa nếu chỉ còn 1 tab -> Reset về rỗng
    if (invoices.length === 1) {
        updateCurrentInvoice({
            cart: [], customer: null, selectedPetId: null, 
            discountInput: 0, cashAmount: 0, transferAmount: 0, note: "", internalNote: ""
        })
        return;
    }

    const newInvoices = invoices.filter(inv => inv.id !== idToDelete)
    setInvoices(newInvoices)
    
    // Nếu đóng tab đang active, chuyển sang tab liền trước
    if (activeTabId === idToDelete) {
        setActiveTabId(newInvoices[newInvoices.length - 1].id)
    }
  }

  // --- LOGIC GIỎ HÀNG ---
  const addToCart = (item: InventoryItem) => {
    const currentCart = currentInvoice.cart
    const existing = currentCart.find(c => c.id === item.id)
    
    let newCart
    if (existing) {
      newCart = currentCart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
    } else {
      newCart = [...currentCart, { ...item, quantity: 1 }]
    }
    
    updateCurrentInvoice({ cart: newCart })
    setSearchQuery("")
  }

  const updateQuantity = (id: number, val: string) => {
    const qty = parseInt(val) || 0
    const newCart = currentInvoice.cart.map(c => c.id === id ? { ...c, quantity: Math.max(1, qty) } : c)
    updateCurrentInvoice({ cart: newCart })
  }

  const removeFromCart = (id: number) => {
    const newCart = currentInvoice.cart.filter(c => c.id !== id)
    updateCurrentInvoice({ cart: newCart })
  }

  // --- LOGIC TÍNH TOÁN ---

  const filteredItems = useMemo(() => {
    if (!searchQuery) return []
    return inventory.filter(item => 
      item.type === itemTypeMode && 
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.code.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery, itemTypeMode])

  const totalAmount = currentInvoice.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  const discountValue = currentInvoice.discountUnit === "vnd" 
    ? currentInvoice.discountInput 
    : (totalAmount * currentInvoice.discountInput) / 100

  const finalTotal = Math.max(0, totalAmount - discountValue)
  const totalPaid = (currentInvoice.cashAmount || 0) + (currentInvoice.transferAmount || 0)
  const changeDue = totalPaid - finalTotal

  // --- XỬ LÝ SỰ KIỆN NÚT BẤM ---

  const handleSelectCustomer = () => {
      // Trong thực tế: Gửi API POST /invoices với status = 'unpaid'
      
      // Giả lập lưu vào localStorage để trang Invoices đọc được
      const newInvoiceData = {
          id: currentInvoice.id,
          customer: currentInvoice.customer?.name || "Khách lẻ",
          phone: currentInvoice.customer?.phone || "",
          pet: currentInvoice.customer?.pets.find(p => p.id === currentInvoice.selectedPetId)?.name || "",
          date: new Date().toLocaleString('en-GB'), // Format DD/MM/YYYY HH:MM
          total: finalTotal,
          status: "unpaid", // Quan trọng: Trạng thái chưa thanh toán
          paymentMethod: "-",
          items: currentInvoice.cart.map(item => ({
              name: item.name,
              qty: item.quantity,
              price: item.price
          }))
      }

      // Lấy danh sách cũ từ localStorage (nếu có)
      const existingInvoices = JSON.parse(localStorage.getItem('mockInvoices') || '[]')
      // Thêm hoặc cập nhật hóa đơn này
      const updatedInvoices = [newInvoiceData, ...existingInvoices.filter((i: any) => i.id !== newInvoiceData.id)]
      localStorage.setItem('mockInvoices', JSON.stringify(updatedInvoices))

      // Thông báo và chuyển trang
      alert(`Đã lưu hóa đơn ${currentInvoice.id} (Chưa thanh toán). Đang chuyển sang danh sách hóa đơn...`)
      router.push("/staff/invoices")
  }

  const handleSaveInvoice = () => {
      // 1. Tạo object dữ liệu hóa đơn để lưu
      const newInvoiceData = {
          id: currentInvoice.id,
          customer: currentInvoice.customer?.name || "Khách lẻ",
          phone: currentInvoice.customer?.phone || "",
          pet: currentInvoice.customer?.pets.find(p => p.id === currentInvoice.selectedPetId)?.name || "",
          date: new Date().toLocaleString('en-GB'), // Format ngày giờ hiện tại
          total: finalTotal,
          status: "unpaid", // QUAN TRỌNG: Đánh dấu là chưa thanh toán
          paymentMethod: "-",
          items: currentInvoice.cart.map(item => ({
              name: item.name,
              qty: item.quantity,
              price: item.price
          }))
      }

      // 2. Lưu vào localStorage (Giả lập Database)
      const existingInvoices = JSON.parse(localStorage.getItem('mockInvoices') || '[]')
      // Nếu ID đã tồn tại thì update, chưa thì thêm mới
      const updatedInvoices = [newInvoiceData, ...existingInvoices.filter((i: any) => i.id !== newInvoiceData.id)]
      localStorage.setItem('mockInvoices', JSON.stringify(updatedInvoices))

      // 3. Thông báo & Chuyển trang
      alert(`Đã lưu hóa đơn ${currentInvoice.id} (Chưa thanh toán). Chuyển đến danh sách hóa đơn...`)
      // Không đóng tab POS để nhân viên có thể quay lại sửa nếu cần
      router.push("/staff/invoices")
  }

  const handlePayment = () => {
      const newInvoiceData = {
          id: currentInvoice.id,
          customer: currentInvoice.customer?.name || "Khách lẻ",
          phone: currentInvoice.customer?.phone || "",
          pet: currentInvoice.customer?.pets.find(p => p.id === currentInvoice.selectedPetId)?.name || "",
          date: new Date().toLocaleString('en-GB'),
          total: finalTotal,
          status: "paid", // QUAN TRỌNG: Đánh dấu là đã thanh toán
          paymentMethod: currentInvoice.transferAmount > 0 ? "Tiền mặt + CK" : "Tiền mặt",
          items: currentInvoice.cart.map(item => ({
              name: item.name,
              qty: item.quantity,
              price: item.price
          }))
      }

      const existingInvoices = JSON.parse(localStorage.getItem('mockInvoices') || '[]')
      const updatedInvoices = [newInvoiceData, ...existingInvoices.filter((i: any) => i.id !== newInvoiceData.id)]
      localStorage.setItem('mockInvoices', JSON.stringify(updatedInvoices))

      alert(`Thanh toán thành công ${currentInvoice.id}.`)
      
      // Đóng tab hiện tại vì đã xong việc
      closeInvoice(currentInvoice.id)
      
      // Chuyển hướng xem danh sách
      router.push("/staff/invoices")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-4">
      
      {/* 1. TOP BAR: TABS */}
      <div className="flex items-center justify-between bg-white p-2 rounded-t-lg border-b">
        <div className="flex items-center gap-2 overflow-x-auto max-w-[80vw]">
            <span className="font-bold text-lg mr-4 px-2 whitespace-nowrap">Bán hàng</span>
            
            <div className="flex gap-2">
                {invoices.map(inv => (
                    <div 
                        key={inv.id}
                        onClick={() => setActiveTabId(inv.id)}
                        className={`
                            cursor-pointer border h-9 px-4 rounded-md text-sm flex items-center gap-2 transition-colors relative group select-none
                            ${activeTabId === inv.id 
                                ? "bg-emerald-600 text-white border-emerald-600 font-medium" 
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"}
                        `}
                    >
                        {inv.id}
                        <div 
                            onClick={(e) => closeInvoice(inv.id, e)}
                            className={`rounded-full p-0.5 ${activeTabId === inv.id ? "hover:bg-emerald-500" : "hover:bg-slate-200"}`}
                        >
                            <X className="w-3 h-3 opacity-70 hover:opacity-100"/>
                        </div>
                    </div>
                ))}
            </div>

            <Button onClick={createNewInvoice} variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-dashed ml-2 shrink-0 hover:border-emerald-500 hover:text-emerald-600">
                <Plus className="w-4 h-4" />
            </Button>
        </div>
      </div>

      {/* 2. MAIN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        
        {/* --- LEFT: CART & PRODUCTS --- */}
        <div className="flex-1 bg-white rounded-lg border shadow-sm flex flex-col min-h-0">
            
            {/* Header */}
            <div className="p-4 border-b space-y-4 shrink-0">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-emerald-700">Chi tiết {currentInvoice.id}</h2>
                    <div className="flex items-center gap-4 text-sm">
                        <RadioGroup 
                                defaultValue="service" 
                                value={itemTypeMode}
                                onValueChange={(v) => setItemTypeMode(v as ItemType)}
                                className="flex items-center gap-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="product" id="r1" className="text-emerald-600 border-emerald-600" />
                                    <Label htmlFor="r1" className="cursor-pointer">Sản phẩm</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="vaccine" id="r2" className="text-emerald-600 border-emerald-600" />
                                    <Label htmlFor="r2" className="cursor-pointer">Vacxin</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="service" id="r3" className="text-emerald-600 border-emerald-600" />
                                    <Label htmlFor="r3" className="cursor-pointer font-medium">Dịch vụ</Label>
                                </div>
                        </RadioGroup>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Input 
                        placeholder={`Tìm kiếm ${itemTypeMode === 'product' ? 'sản phẩm' : itemTypeMode === 'vaccine' ? 'vacxin' : 'dịch vụ'}...`} 
                        className="pl-4 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery.length > 0 && filteredItems.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border shadow-lg rounded-md mt-1 z-10 max-h-60 overflow-y-auto">
                            {filteredItems.map(item => (
                                <div key={item.id} className="p-2 hover:bg-emerald-50 cursor-pointer flex justify-between text-sm items-center border-b last:border-0" onClick={() => addToCart(item)}>
                                    <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-muted-foreground">Mã: {item.code} {item.stock ? `| Tồn: ${item.stock}` : ''}</div>
                                    </div>
                                    <div className="text-emerald-700 font-semibold">{item.price.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-slate-50 sticky top-0 z-0">
                        <tr>
                            <th className="px-4 py-3 font-medium w-10">STT</th>
                            {/* Cột mới: Mã SP */}
                            <th className="px-4 py-3 font-medium w-24">Mã SP</th>
                            {/* Đổi tên cột */}
                            <th className="px-4 py-3 font-medium">Tên hàng</th>
                            <th className="px-4 py-3 font-medium text-center w-20">SL</th>
                            <th className="px-4 py-3 font-medium text-center w-20">ĐVT</th>
                            <th className="px-4 py-3 font-medium text-right w-28">Đơn giá</th>
                            <th className="px-4 py-3 font-medium text-right w-28">Thành tiền</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {currentInvoice.cart.map((item, index) => (
                            <tr key={item.id} className="hover:bg-slate-50 group">
                                <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{item.code}</td>
                                <td className="px-4 py-3 font-medium">
                                    {item.name}
                                    {item.type === 'vaccine' && <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1">VX</Badge>}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Input 
                                        type="number" 
                                        className="h-8 w-16 text-center mx-auto focus-visible:ring-emerald-500 p-1" 
                                        value={item.quantity} 
                                        onChange={(e) => updateQuantity(item.id, e.target.value)}
                                    />
                                </td>
                                <td className="px-4 py-3 text-center text-muted-foreground">{item.unit}</td>
                                <td className="px-4 py-3 text-right">{item.price.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right font-medium">{(item.price * item.quantity).toLocaleString()}</td>
                                <td className="px-4 py-3 text-center">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeFromCart(item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {currentInvoice.cart.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-10 text-muted-foreground text-sm italic">
                                    Chưa có sản phẩm nào trong hóa đơn này
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer: Totals */}
            <div className="p-4 border-t bg-slate-50/50 space-y-2">
                <div className="flex justify-end gap-12 text-sm">
                    <span className="text-muted-foreground">Tổng cộng</span>
                    <span className="font-medium w-32 text-right">{totalAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-end gap-8 text-sm items-center">
                    <span className="text-muted-foreground w-24 text-right">Giảm giá</span>
                    <div className="flex items-center w-32 justify-end gap-2">
                        <Select 
                            value={currentInvoice.discountUnit} 
                            onValueChange={(v) => updateCurrentInvoice({ discountUnit: v as "vnd" | "percent" })}
                        >
                            <SelectTrigger className="h-8 w-[65px] text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="vnd">đ</SelectItem>
                                <SelectItem value="percent">%</SelectItem>
                            </SelectContent>
                        </Select>
                        {/* Xử lý số 0 hiện ẩn và bỏ nút tăng giảm */}
                        <Input 
                            className="h-8 text-right focus-visible:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                            value={currentInvoice.discountInput === 0 ? '' : currentInvoice.discountInput} 
                            placeholder="0"
                            type="number"
                            min={0}
                            onChange={(e) => updateCurrentInvoice({ discountInput: Number(e.target.value) })}
                        />
                    </div>
                </div>

                {currentInvoice.discountUnit === 'percent' && currentInvoice.discountInput > 0 && (
                     <div className="flex justify-end gap-8 text-xs text-muted-foreground">
                        <span className="italic w-32 text-right">(-{discountValue.toLocaleString()}đ)</span>
                     </div>
                )}

                <Separator className="my-2"/>
                <div className="flex justify-end gap-12 text-base">
                    <span className="font-semibold text-slate-700">Số tiền thanh toán</span>
                    <span className="font-bold w-32 text-right text-emerald-700">{finalTotal.toLocaleString()}</span>
                </div>
            </div>
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4 shrink-0 overflow-y-auto">
            
            {/* 1. Customer Info */}
            <Card className="shadow-sm border">
                <CardContent className="p-4 space-y-4">
                    <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                        <User className="w-4 h-4"/> Khách hàng
                    </h3>
                    
                    <div className="space-y-3">
                        {!currentInvoice.customer ? (
                             <div className="flex gap-2">
                                <Input placeholder="Tìm khách hàng (F4)" className="flex-1 focus-visible:ring-emerald-500"/>
                                <Button onClick={handleSelectCustomer} variant="outline" size="icon" className="shrink-0 border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                                    <Search className="w-4 h-4"/>
                                </Button>
                            </div>
                        ) : (
                            <div className="bg-emerald-50/50 rounded-md border border-emerald-100 p-3 relative group">
                                <div className="font-semibold text-emerald-900">{currentInvoice.customer.name}</div>
                                <div className="text-sm text-emerald-700">{currentInvoice.customer.phone}</div>
                                <Button 
                                    variant="ghost" size="icon" 
                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-red-600"
                                    onClick={() => updateCurrentInvoice({ customer: null, selectedPetId: null })}
                                >
                                    <X className="w-4 h-4"/>
                                </Button>
                            </div>
                        )}

                        {/* Pet Selection (Chỉ hiện khi đã chọn Customer) */}
                        {currentInvoice.customer && (
                            <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                    <PawPrint className="w-3 h-3"/> Thú cưng (Chọn 1)
                                </Label>
                                <Select 
                                    value={currentInvoice.selectedPetId || ""} 
                                    onValueChange={(v) => updateCurrentInvoice({ selectedPetId: v })}
                                >
                                    <SelectTrigger className="focus:ring-emerald-500">
                                        <SelectValue placeholder="Chọn thú cưng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentInvoice.customer.pets.map(pet => (
                                            <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Ghi chú hóa đơn</Label>
                        <Textarea 
                            className="min-h-[60px] resize-none focus-visible:ring-emerald-500 text-sm" 
                            placeholder="Ghi chú in ra bill..."
                            value={currentInvoice.note}
                            onChange={(e) => updateCurrentInvoice({ note: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 2. Payment Section */}
            <Card className="shadow-sm border flex-1 flex flex-col">
                <CardContent className="p-4 space-y-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-emerald-800">Thanh toán</h3>
                        <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50 font-normal">Chưa thanh toán</Badge>
                    </div>

                    <div className="bg-emerald-50/50 p-3 rounded border border-emerald-100 flex justify-between items-center">
                        <span className="text-sm font-medium text-emerald-800">Tổng hóa đơn:</span>
                        <span className="text-xl font-bold text-emerald-600">{finalTotal.toLocaleString()}</span>
                    </div>

                    <div className="space-y-3">
                        {/* Phương thức 1:*/}
                        <div className="grid grid-cols-[100px_1fr_40px] gap-2 items-center">
                            <span className="text-sm text-muted-foreground">Tiền khách đưa:</span>
                            <div className="flex gap-1">
                            <Input 
                                className="h-8 text-right focus-visible:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                value={currentInvoice.cashAmount === 0 ? '' : currentInvoice.cashAmount} 
                                placeholder="0"
                                type="number"
                                min={0}
                                onChange={(e) => updateCurrentInvoice({ cashAmount: Number(e.target.value) })}
                            />
                        </div>
                            <Select defaultValue="cash">
                                <SelectTrigger className="w-full px-1">
                                    <Banknote className="w-4 h-4 mx-auto text-muted-foreground"/>
                                </SelectTrigger>
                                <SelectContent align="end">
                                    <SelectItem value="cash">Tiền mặt</SelectItem>
                                </SelectContent>
                            </Select>
                            <X className="w-4 h-4 text-muted-foreground cursor-pointer col-start-4"/>
                        </div>

                        {/* Phương thức 2 */}
                        <div className="grid grid-cols-[100px_1fr_40px] gap-2 items-center">
                            <span className="text-sm text-muted-foreground">Tiền khách đưa:</span>
                            <div className="flex flex-col gap-1">
                                <Input 
                                    className="h-8 text-right focus-visible:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                    value={currentInvoice.transferAmount === 0 ? '' : currentInvoice.transferAmount}
                                    placeholder="0"
                                    type="number"
                                    min={0}
                                    onChange={(e) => updateCurrentInvoice({ transferAmount: Number(e.target.value) })}
                                />
                                <span className="text-[10px] text-emerald-600 cursor-pointer flex items-center justify-end gap-1">
                                    <QrCode className="w-3 h-3"/> QR Code
                                </span>
                            </div>
                            <Select defaultValue="acb">
                                <SelectTrigger className="w-full px-1">
                                     <CreditCard className="w-4 h-4 mx-auto text-muted-foreground"/>
                                </SelectTrigger>
                                <SelectContent align="end">
                                    <SelectItem value="acb">ACB</SelectItem>
                                    <SelectItem value="vcb">Vietcombank</SelectItem>
                                </SelectContent>
                            </Select>
                            <X className="w-4 h-4 text-muted-foreground cursor-pointer col-start-4"/>
                        </div>
                        
                        <Button variant="ghost" size="sm" className="h-6 px-0 text-xs text-muted-foreground hover:text-emerald-600">
                            <Plus className="w-3 h-3 mr-1" /> Thêm phương thức
                        </Button>
                    </div>

                    <Separator className="my-2"/>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between font-medium">
                            <span>Tổng khách đưa:</span>
                            <span className="text-red-600">{totalPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Trả lại:</span>
                            <span className={`font-bold ${changeDue < 0 ? 'text-red-600' : 'text-slate-700'}`}>
                                {changeDue.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
                        <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 w-full text-xs sm:text-sm"
                            onClick={handleSaveInvoice}>
                                Lưu hóa đơn
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 w-full text-xs sm:text-sm"
                            onClick={handlePayment}>
                                Thanh toán
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}