"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { 
  Stethoscope, 
  Clock, 
  User, 
  Phone, 
  FileText, 
  Plus, 
  Trash2, 
  Check, 
  History,
  Search,
  Pill,
  Loader2
} from "lucide-react"

interface PrescriptionItem {
  medicineId: string
  name: string
  quantity: number
  dosage: string
  note: string
}

export default function ExaminationPage() {
  const [queue, setQueue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPet, setSelectedPet] = useState<any | null>(null)
  const [completedCount, setCompletedCount] = useState(0)
  
  const [examForm, setExamForm] = useState({
    symptoms: "",
    diagnosis: "",
    followUpDate: "",
  })
  
  const [prescription, setPrescription] = useState<PrescriptionItem[]>([])
  const [prescriptionOpen, setPrescriptionOpen] = useState(false)
  
  const [historyOpen, setHistoryOpen] = useState(false)
  const [petHistory, setPetHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const [medicineSearchTerm, setMedicineSearchTerm] = useState("")
  const [lookupOpen, setLookupOpen] = useState(false)
  const [lookupSearchTerm, setLookupSearchTerm] = useState("")
  const [foundMedicines, setFoundMedicines] = useState<any[]>([])

  const [newMedicine, setNewMedicine] = useState({
    medicineId: "",
    name: "",
    quantity: 1,
    dosage: "",
    note: "",
    stock: 0,
    unit: ""
  })

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

  const fetchQueue = async () => {
    const headers = getAuthHeader()
    if (!headers) return

    try {
      const res = await fetch("http://localhost:3055/api/doctor/exam-queue", { headers })
      if (res.ok) {
        const data = await res.json()
        setQueue(data.metadata || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // --- HÀM ĐÃ ĐƯỢC SỬA ĐỂ TRÁNH LỖI MAP DỮ LIỆU ---
  const fetchMedicines = async (query: string) => {
    const headers = getAuthHeader()
    if (!headers || !query) return

    try {
      const res = await fetch(`http://localhost:3055/api/doctor/medicines/search?q=${query}`, { headers })
      if (res.ok) {
        const data = await res.json()
        const rawList = data.metadata || []
        
        // Map dữ liệu an toàn: Kiểm tra cả trường cũ (tiếng Anh) và trường mới (DB)
        const mappedMedicines = rawList.map((m: any) => ({
            id: m.id || m.MaSP,
            code: m.code || m.MaSP,
            name: m.name || m.TenSP,
            unit: m.unit || m.DonViTinh,
            // Ưu tiên price có sẵn, nếu không thì lấy Gia, cuối cùng là 0
            price: Number(m.price !== undefined ? m.price : (m.Gia || 0)), 
            // Ưu tiên stock có sẵn, nếu không thì lấy SLTonKho, cuối cùng là 0
            stock: Number(m.stock !== undefined ? m.stock : (m.SLTonKho || 0))
        }))
        
        setFoundMedicines(mappedMedicines)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchHistory = async (petId: string) => {
    setHistoryLoading(true)
    const headers = getAuthHeader()
    if (!headers) return

    try {
      const res = await fetch(`http://localhost:3055/api/doctor/history/${petId}`, { headers })
      if (res.ok) {
        const data = await res.json()
        const rawHistory = data.metadata || []
        
        const mappedHistory = rawHistory.map((h: any) => ({
            date: h.date || h.NgayKham,
            type: h.type || 'Khám bệnh',
            diagnosis: h.diagnosis || h.ChanDoan,
            doctor: h.doctor || h.TenBacSi || 'BS. Thú Y'
        }))
        setPetHistory(mappedHistory)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleSubmit = async (hasPrescription: boolean) => {
    if (!examForm.symptoms || !examForm.diagnosis) {
      alert("Vui lòng nhập triệu chứng và chẩn đoán!")
      return
    }

    if (hasPrescription && prescription.length === 0) {
      alert("Toa thuốc trống!")
      return
    }

    const headers = getAuthHeader()
    if (!headers || !selectedPet) return

    // --- LOGIC MỚI: TRÍCH XUẤT THỜI GIAN HẸN ---
    // ID format: MaKH_MaTC_Timestamp
    let thoiGianHenIso = new Date().toISOString(); 
    try {
        const idParts = selectedPet.id.split('_');
        if (idParts.length >= 3) {
            const timeStamp = parseInt(idParts[2]);
            if (!isNaN(timeStamp)) {
                thoiGianHenIso = new Date(timeStamp).toISOString();
            }
        }
    } catch (e) {
        console.warn("Không parse được thời gian từ ID, dùng thời gian hiện tại");
    }

    const payload = {
      maKH: selectedPet.MaKH,
      maTC: selectedPet.MaTC,
      thoiGianHen: thoiGianHenIso, // Gửi xuống Backend để check-in
      trieuChung: examForm.symptoms,
      chanDoan: examForm.diagnosis,
      ngayTaiKham: examForm.followUpDate || null,
      prescription: hasPrescription ? prescription : []
    }

    try {
      const res = await fetch("http://localhost:3055/api/doctor/examination", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert("Lưu bệnh án thành công!")
        setQueue(prev => prev.filter(p => p.id !== selectedPet.id))
        setCompletedCount(prev => prev + 1)
        setSelectedPet(null)
        setExamForm({ symptoms: "", diagnosis: "", followUpDate: "" })
        setPrescription([])
      } else {
        const err = await res.json()
        alert(err.message || "Có lỗi xảy ra khi lưu bệnh án")
      }
    } catch (error) {
      console.error(error)
      alert("Lỗi kết nối server")
    }
  }

  useEffect(() => {
    fetchQueue()
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (medicineSearchTerm) fetchMedicines(medicineSearchTerm)
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [medicineSearchTerm])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (lookupSearchTerm) fetchMedicines(lookupSearchTerm)
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [lookupSearchTerm])

  const addMedicine = () => {
    if (newMedicine.medicineId && newMedicine.quantity > 0) {
       if (newMedicine.quantity > newMedicine.stock) {
         alert(`Tồn kho không đủ (Còn: ${newMedicine.stock})`)
         return
       }
       
       setPrescription([...prescription, {
         medicineId: newMedicine.medicineId,
         name: newMedicine.name,
         quantity: newMedicine.quantity,
         dosage: newMedicine.dosage,
         note: newMedicine.note
       }])
       
       setNewMedicine({ medicineId: "", name: "", quantity: 1, dosage: "", note: "", stock: 0, unit: "" })
       setMedicineSearchTerm("")
       setFoundMedicines([])
    }
  }

  const removeMedicine = (index: number) => {
    setPrescription(prescription.filter((_, i) => i !== index))
  }

  const StockBadge = ({ stock }: { stock: number }) => {
    if (stock === 0) return <Badge variant="destructive" className="text-[10px]">Hết hàng</Badge>
    if (stock < 20) return <Badge variant="secondary" className="text-[10px] bg-yellow-100 text-yellow-800">Sắp hết ({stock})</Badge>
    return <span className="text-xs text-muted-foreground">Tồn: {stock}</span>
  }

  if (loading) {
      return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Khám bệnh</h1>
          <p className="text-muted-foreground">Thực hiện khám và kê đơn cho thú cưng</p>
        </div>
        <div className="flex gap-3">
            <Dialog open={lookupOpen} onOpenChange={setLookupOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Search className="w-4 h-4" /> Tra cứu thuốc
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Kho thuốc hiện tại</DialogTitle>
                        <DialogDescription>Kiểm tra số lượng tồn kho và giá bán</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Tìm kiếm tên thuốc hoặc mã thuốc..." 
                                className="pl-9"
                                value={lookupSearchTerm}
                                onChange={(e) => setLookupSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="border rounded-md max-h-[400px] overflow-y-auto">
                             <table className="w-full text-sm">
                                <thead className="bg-muted sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3 text-left font-medium">Mã</th>
                                        <th className="p-3 text-left font-medium">Tên thuốc</th>
                                        <th className="p-3 text-left font-medium">Đơn vị</th>
                                        <th className="p-3 text-right font-medium">Giá bán</th>
                                        <th className="p-3 text-right font-medium">Tồn kho</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {foundMedicines.map(m => (
                                        <tr key={m.id} className="border-t hover:bg-muted/50">
                                            <td className="p-3 font-mono text-xs">{m.code}</td>
                                            <td className="p-3 font-medium">{m.name}</td>
                                            <td className="p-3">{m.unit}</td>
                                            {/* Sửa lỗi hiển thị giá an toàn */}
                                            <td className="p-3 text-right">{(m.price || 0).toLocaleString()}đ</td>
                                            <td className="p-3 text-right"><StockBadge stock={m.stock} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Card className="p-2 px-4 h-full flex items-center gap-4 bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                    <p className="font-bold text-lg leading-none">
                        {completedCount}/{queue.length + completedCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Ca khám</p>
                    </div>
                </div>
            </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Hàng đợi khám
            </CardTitle>
            <CardDescription>{queue.length} thú cưng đang chờ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {queue.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedPet?.id === item.id ? "border-primary bg-primary/5 shadow-sm" : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedPet(item)}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {item.order}
                </div>
                <Avatar className="w-10 h-10 rounded-lg">
                  <AvatarFallback>{item.pet?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.pet}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.species} • {item.breed}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">Chờ</Badge>
              </div>
            ))}
            {queue.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                    <Check className="w-8 h-8 opacity-20" />
                    <span className="text-sm">Đã hoàn thành hết hàng đợi!</span>
                </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {selectedPet ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-20 h-20 rounded-2xl">
                        <AvatarFallback className="text-2xl">{selectedPet.pet?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{selectedPet.pet}</h3>
                        <p className="text-muted-foreground">{selectedPet.species} • {selectedPet.breed}</p>
                        <p className="text-sm text-muted-foreground">{selectedPet.gender} • {selectedPet.age}</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 md:border-l md:pl-6 space-y-2">
                        <div className="flex justify-between">
                            <h4 className="text-sm font-medium text-muted-foreground">Chủ nuôi</h4>
                            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                                <DialogTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                        onClick={() => fetchHistory(selectedPet.MaTC)}
                                    >
                                        <History className="w-3.5 h-3.5" /> Lịch sử khám
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Lịch sử khám bệnh - {selectedPet.pet}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="border rounded-md max-h-[300px] overflow-auto">
                                            {historyLoading ? (
                                                <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                                            ) : (
                                                <table className="w-full text-sm">
                                                    <thead className="bg-muted sticky top-0">
                                                        <tr>
                                                            <th className="p-2 text-left font-medium">Ngày</th>
                                                            <th className="p-2 text-left font-medium">Loại</th>
                                                            <th className="p-2 text-left font-medium">Chẩn đoán</th>
                                                            <th className="p-2 text-left font-medium">Bác sĩ</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {petHistory.map((h, i) => (
                                                            <tr key={i} className="border-t">
                                                                <td className="p-2">{h.date ? new Date(h.date).toLocaleDateString('vi-VN') : '--'}</td>
                                                                <td className="p-2"><Badge variant="outline">{h.type}</Badge></td>
                                                                <td className="p-2 font-medium">{h.diagnosis}</td>
                                                                <td className="p-2 text-muted-foreground">{h.doctor}</td>
                                                            </tr>
                                                        ))}
                                                        {petHistory.length === 0 && (
                                                            <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Chưa có lịch sử khám</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={() => setHistoryOpen(false)}>Đóng</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{selectedPet.owner}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{selectedPet.phone}</span>
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Thông tin khám bệnh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-2">
                    <Label htmlFor="symptoms">Triệu chứng *</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Mô tả triệu chứng..."
                      rows={3}
                      value={examForm.symptoms}
                      onChange={(e) => setExamForm({ ...examForm, symptoms: e.target.value })}
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="diagnosis">Chẩn đoán *</Label>
                    <Textarea
                      id="diagnosis"
                      placeholder="Kết quả chẩn đoán..."
                      rows={3}
                      value={examForm.diagnosis}
                      onChange={(e) => setExamForm({ ...examForm, diagnosis: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Ngày tái khám (Tùy chọn)</Label>
                            <Input 
                                type="date" 
                                value={examForm.followUpDate} 
                                onChange={(e) => setExamForm({...examForm, followUpDate: e.target.value})}
                                min={new Date().toISOString().split("T")[0]}
                            />
                        </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base flex items-center gap-2"><Pill className="w-4 h-4"/> Toa thuốc</Label>
                      <Dialog open={prescriptionOpen} onOpenChange={setPrescriptionOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1 bg-transparent border-dashed border-primary text-primary hover:bg-primary/5">
                            <Plus className="w-4 h-4" />
                            Kê đơn thuốc
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                          <DialogHeader>
                            <DialogTitle>Thêm thuốc vào toa</DialogTitle>
                            <DialogDescription>Tìm kiếm và chọn thuốc từ kho</DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Tìm thuốc</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Nhập tên thuốc..." 
                                        className="pl-9" 
                                        value={medicineSearchTerm}
                                        onChange={(e) => {
                                            setMedicineSearchTerm(e.target.value);
                                            if (newMedicine.medicineId !== "") {
                                                setNewMedicine({ ...newMedicine, medicineId: "", stock: 0, unit: "" });
                                            }
                                        }}
                                    />
                                </div>
                                {medicineSearchTerm && newMedicine.medicineId === "" && (
                                    <div className="border rounded-md shadow-sm max-h-[200px] overflow-y-auto mt-2">
                                            {foundMedicines.map((m) => (
                                                <div 
                                                    key={m.id}
                                                    className={`p-3 text-sm cursor-pointer hover:bg-muted flex justify-between items-center ${m.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    onClick={() => {
                                                        if(m.stock > 0) {
                                                            setNewMedicine({ 
                                                                ...newMedicine, 
                                                                medicineId: m.id,
                                                                name: m.name,
                                                                stock: m.stock,
                                                                unit: m.unit
                                                            });
                                                            setMedicineSearchTerm(m.name);
                                                            setFoundMedicines([]);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{m.name}</span>
                                                        <span className="text-xs text-muted-foreground">{m.code} • {(m.price || 0).toLocaleString()}đ/{m.unit}</span>
                                                    </div>
                                                    <StockBadge stock={m.stock} />
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>

                            {newMedicine.medicineId !== "" && (
                                <div className="bg-slate-50 p-4 rounded-lg space-y-4 border animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="font-semibold text-primary">{newMedicine.name}</span>
                                        <Button variant="ghost" size="sm" onClick={() => {
                                            setNewMedicine({ ...newMedicine, medicineId: "", stock: 0, unit: "" });
                                            setMedicineSearchTerm("");
                                        }}>Chọn lại</Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Số lượng (Max: {newMedicine.stock})</Label>
                                            <Input
                                            type="number"
                                            min={1}
                                            max={newMedicine.stock}
                                            value={newMedicine.quantity}
                                            onChange={(e) =>
                                                setNewMedicine({ ...newMedicine, quantity: Number.parseInt(e.target.value) || 1 })
                                            }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Liều dùng</Label>
                                            <Input
                                            placeholder="VD: Sáng 1, tối 1"
                                            value={newMedicine.dosage}
                                            onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ghi chú</Label>
                                        <Input
                                            placeholder="Ghi chú thêm..."
                                            value={newMedicine.note}
                                            onChange={(e) => setNewMedicine({ ...newMedicine, note: e.target.value })}
                                        />
                                    </div>
                                    <Button
                                    className="w-full"
                                    onClick={() => { addMedicine(); setPrescriptionOpen(false); }}
                                    >
                                    Thêm vào toa
                                    </Button>
                                </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {prescription.length > 0 ? (
                      <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-3 font-medium">Tên thuốc</th>
                              <th className="text-left p-3 font-medium">SL</th>
                              <th className="text-left p-3 font-medium">Liều dùng</th>
                              <th className="p-3"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {prescription.map((item, index) => (
                              <tr key={index} className="border-t">
                                <td className="p-3 font-medium">{item.name}</td>
                                <td className="p-3">{item.quantity}</td>
                                <td className="p-3">{item.dosage}</td>
                                <td className="p-3 text-right">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeMedicine(index)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground text-sm border rounded-lg border-dashed">
                        Chưa có thuốc trong toa
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                        variant="outline" 
                        className="gap-2 bg-transparent"
                        onClick={() => handleSubmit(false)}
                    >
                      <FileText className="w-4 h-4" />
                      Hoàn tất (không kê đơn)
                    </Button>
                    
                    <Button 
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleSubmit(true)}
                    >
                      <Check className="w-4 h-4" />
                      Hoàn tất & Lưu toa thuốc
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Stethoscope className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Chọn một thú cưng từ hàng đợi để bắt đầu khám</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}