"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Stethoscope, 
  Clock, 
  User, 
  Phone, 
  FileText, 
  Syringe, 
  Plus, 
  Trash2, 
  Check, 
  History,
  Search,
  AlertCircle,
  Pill
} from "lucide-react"

// --- DỮ LIỆU MẪU ---

const initialQueue = [
  {
    id: 1,
    order: 1,
    pet: "Mochi",
    species: "Chó",
    breed: "Poodle",
    age: "2 tuổi",
    gender: "Đực",
    owner: "Nguyễn Văn A",
    phone: "0901234567",
    image: "/cute-poodle.png",
    examCount: 5,
    vaccineCount: 8,
    status: "waiting",
  },
  {
    id: 2,
    order: 2,
    pet: "Luna",
    species: "Mèo",
    breed: "British Shorthair",
    age: "1 tuổi",
    gender: "Cái",
    owner: "Trần Thị B",
    phone: "0912345678",
    image: "/cute-british-shorthair-cat.jpg",
    examCount: 3,
    vaccineCount: 4,
    status: "waiting",
  },
]

const medicines = [
  { id: 1, code: "T001", name: "Amoxicillin 250mg", unit: "Viên", price: 5000, stock: 150 },
  { id: 2, code: "T002", name: "Metronidazole 500mg", unit: "Viên", price: 8000, stock: 45 },
  { id: 3, code: "T003", name: "Vitamin B Complex", unit: "Ống", price: 15000, stock: 0 },
  { id: 4, code: "T004", name: "Thuốc nhỏ mắt Tobrex", unit: "Chai", price: 85000, stock: 12 },
  { id: 5, code: "T005", name: "Dexamethasone 0.5mg", unit: "Viên", price: 3000, stock: 500 },
  { id: 6, code: "T006", name: "Siro ho chó mèo", unit: "Chai", price: 120000, stock: 30 },
  { id: 7, code: "T007", name: "Men tiêu hóa", unit: "Gói", price: 10000, stock: 200 },
]

// Dữ liệu giả lịch sử khám
const mockHistory = [
    { date: "15/11/2025", diagnosis: "Viêm da dị ứng", doctor: "BS. Trần Văn B", type: "Tái khám" },
    { date: "10/10/2025", diagnosis: "Tiêm phòng dại", doctor: "BS. Nguyễn Thị C", type: "Tiêm phòng" },
    { date: "05/09/2025", diagnosis: "Rối loạn tiêu hóa", doctor: "BS. Trần Văn B", type: "Khám bệnh" },
]

interface PrescriptionItem {
  medicineId: number
  name: string
  quantity: number
  dosage: string
  note: string
}

export default function ExaminationPage() {
  // State quản lý hàng đợi và thống kê
  const [queue, setQueue] = useState(initialQueue)
  const [completedCount, setCompletedCount] = useState(5)
  const todayExams = 8 + initialQueue.length // Tổng ca dự kiến

  const [selectedPet, setSelectedPet] = useState<(typeof initialQueue)[0] | null>(null)
  const [examForm, setExamForm] = useState({
    symptoms: "",
    diagnosis: "",
    followUpDate: "",
  })
  
  // State Dialog & Form
  const [prescription, setPrescription] = useState<PrescriptionItem[]>([])
  const [prescriptionOpen, setPrescriptionOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false) // State cho Dialog lịch sử
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("")
  const [lookupOpen, setLookupOpen] = useState(false)
  const [lookupSearchTerm, setLookupSearchTerm] = useState("")

  const [newMedicine, setNewMedicine] = useState({
    medicineId: 0,
    quantity: 1,
    dosage: "",
    note: "",
  })

  // --- LOGIC XỬ LÝ ---

  const filterMedicines = (term: string) => {
    return medicines.filter(m => 
      m.name.toLowerCase().includes(term.toLowerCase()) || 
      m.code.toLowerCase().includes(term.toLowerCase())
    )
  }

  const addMedicine = () => {
    if (newMedicine.medicineId && newMedicine.quantity > 0) {
      const medicine = medicines.find((m) => m.id === newMedicine.medicineId)
      if (medicine) {
        if (medicine.stock < newMedicine.quantity) {
             alert(`Không đủ hàng! Tồn kho chỉ còn ${medicine.stock} ${medicine.unit}`);
             return;
        }
        setPrescription([...prescription, {
            medicineId: medicine.id,
            name: medicine.name,
            quantity: newMedicine.quantity,
            dosage: newMedicine.dosage,
            note: newMedicine.note,
        }])
        setNewMedicine({ medicineId: 0, quantity: 1, dosage: "", note: "" })
        setMedicineSearchTerm("")
      }
    }
  }

  const removeMedicine = (index: number) => {
    setPrescription(prescription.filter((_, i) => i !== index))
  }

  // HÀM QUAN TRỌNG: Xử lý hoàn tất khám
  const handleCompleteExam = (hasPrescription: boolean) => {
      // 1. Validate dữ liệu
      if (!examForm.symptoms || !examForm.diagnosis) {
          alert("Vui lòng nhập triệu chứng và chẩn đoán trước khi hoàn tất!");
          return;
      }

      if (hasPrescription && prescription.length === 0) {
          alert("Toa thuốc đang trống! Vui lòng thêm thuốc hoặc chọn 'Hoàn tất (không kê đơn)'.");
          return;
      }

      // 2. Thông báo thành công (Giả lập)
      const msg = hasPrescription 
        ? `Đã lưu bệnh án & kê ${prescription.length} loại thuốc cho bé ${selectedPet?.pet}!` 
        : `Đã lưu bệnh án cho bé ${selectedPet?.pet} (Không kê đơn)!`;
      alert(msg);

      // 3. Cập nhật dữ liệu hệ thống
      setQueue(prev => prev.filter(p => p.id !== selectedPet?.id)); // Xóa khỏi hàng đợi
      setCompletedCount(prev => prev + 1); // Tăng số ca đã khám
      
      // 4. Reset Form để khám ca tiếp theo
      setSelectedPet(null);
      setExamForm({ symptoms: "", diagnosis: "", followUpDate: "" });
      setPrescription([]);
  }

  const StockBadge = ({ stock }: { stock: number }) => {
      if (stock === 0) return <Badge variant="destructive" className="text-[10px]">Hết hàng</Badge>;
      if (stock < 20) return <Badge variant="secondary" className="text-[10px] bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Sắp hết ({stock})</Badge>;
      return <span className="text-xs text-muted-foreground">Tồn: {stock}</span>;
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
                                    {filterMedicines(lookupSearchTerm).map(m => (
                                        <tr key={m.id} className="border-t hover:bg-muted/50">
                                            <td className="p-3 font-mono text-xs">{m.code}</td>
                                            <td className="p-3 font-medium">{m.name}</td>
                                            <td className="p-3">{m.unit}</td>
                                            <td className="p-3 text-right">{m.price.toLocaleString()}đ</td>
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
                        {completedCount}/{todayExams}
                    </p>
                    <p className="text-xs text-muted-foreground">Ca khám</p>
                    </div>
                </div>
            </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Hàng đợi (Queue) */}
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
                  <AvatarImage src={item.image || "/placeholder.svg"} />
                  <AvatarFallback>{item.pet[0]}</AvatarFallback>
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

        {/* Form Khám bệnh */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPet ? (
            <>
              {/* Thông tin thú cưng */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-20 h-20 rounded-2xl">
                        <AvatarImage src={selectedPet.image || "/placeholder.svg"} />
                        <AvatarFallback className="text-2xl">{selectedPet.pet[0]}</AvatarFallback>
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
                            {/* NÚT XEM LỊCH SỬ ĐÃ HOẠT ĐỘNG */}
                            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                        <History className="w-3.5 h-3.5" /> Lịch sử khám
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Lịch sử khám bệnh - {selectedPet.pet}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="border rounded-md">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted">
                                                    <tr>
                                                        <th className="p-2 text-left font-medium">Ngày</th>
                                                        <th className="p-2 text-left font-medium">Loại</th>
                                                        <th className="p-2 text-left font-medium">Chẩn đoán</th>
                                                        <th className="p-2 text-left font-medium">Bác sĩ</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mockHistory.map((h, i) => (
                                                        <tr key={i} className="border-t">
                                                            <td className="p-2">{h.date}</td>
                                                            <td className="p-2"><Badge variant="outline">{h.type}</Badge></td>
                                                            <td className="p-2 font-medium">{h.diagnosis}</td>
                                                            <td className="p-2 text-muted-foreground">{h.doctor}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
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

              {/* Form chẩn đoán */}
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

                  {/* Phần Kê đơn thuốc */}
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
                                            if (newMedicine.medicineId !== 0) {
                                                setNewMedicine({ ...newMedicine, medicineId: 0 });
                                            }
                                        }}
                                    />
                                </div>
                                {medicineSearchTerm && newMedicine.medicineId === 0 && (
                                    <div className="border rounded-md shadow-sm max-h-[200px] overflow-y-auto mt-2">
                                        {filterMedicines(medicineSearchTerm).map((m) => (
                                            <div 
                                                key={m.id}
                                                className={`p-3 text-sm cursor-pointer hover:bg-muted flex justify-between items-center ${m.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => {
                                                    if(m.stock > 0) {
                                                        setNewMedicine({ ...newMedicine, medicineId: m.id });
                                                        setMedicineSearchTerm(m.name);
                                                    }
                                                }}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{m.name}</span>
                                                    <span className="text-xs text-muted-foreground">{m.code} • {m.price.toLocaleString()}đ/{m.unit}</span>
                                                </div>
                                                <StockBadge stock={m.stock} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {newMedicine.medicineId !== 0 && (
                                <div className="bg-slate-50 p-4 rounded-lg space-y-4 border animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="font-semibold text-primary">
                                            {medicines.find(m => m.id === newMedicine.medicineId)?.name}
                                        </span>
                                        <Button variant="ghost" size="sm" onClick={() => {
                                            setNewMedicine({ ...newMedicine, medicineId: 0 });
                                            setMedicineSearchTerm("");
                                        }}>Chọn lại</Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Số lượng (Max: {medicines.find(m => m.id === newMedicine.medicineId)?.stock})</Label>
                                        <Input
                                        type="number"
                                        min={1}
                                        max={medicines.find(m => m.id === newMedicine.medicineId)?.stock}
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

                  {/* ACTION BUTTONS ĐÃ ĐƯỢC THÊM LOGIC */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                        variant="outline" 
                        className="gap-2 bg-transparent"
                        onClick={() => handleCompleteExam(false)} // False: Không cần toa thuốc
                    >
                      <FileText className="w-4 h-4" />
                      Hoàn tất (không kê đơn)
                    </Button>
                    
                    <Button 
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleCompleteExam(true)} // True: Yêu cầu phải có toa thuốc
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