"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Syringe, Clock, User, Phone, History, AlertTriangle, Check, Package, X, Search } from "lucide-react"

// --- DỮ LIỆU MẪU ---

const initialQueue = [
  {
    id: 1,
    order: 1,
    pet: "Luna",
    species: "Mèo",
    breed: "British Shorthair",
    age: "1 tuổi",
    owner: "Trần Thị B",
    phone: "0912345678",
    image: "/cute-british-shorthair-cat.jpg",
    vaccineHistory: 4,
    hasPackage: true,
    packageName: "Gói tiêm mèo 12 tháng",
    packageRemaining: 3,
  },
  {
    id: 2,
    order: 2,
    pet: "Buddy",
    species: "Chó",
    breed: "Golden Retriever",
    age: "3 tuổi",
    owner: "Lê Văn C",
    phone: "0923456789",
    image: "/golden-retriever-portrait.png",
    vaccineHistory: 10,
    hasPackage: false,
  },
]

// Thêm mã vắc-xin (code) để tìm kiếm
const vaccines = [
  { id: 1, code: "VAC001", name: "Vắc-xin 5 bệnh chó", lot: "LOT2025A", expiry: "30/06/2025", stock: 25 },
  { id: 2, code: "VAC002", name: "Vắc-xin dại", lot: "LOT2025B", expiry: "15/03/2025", stock: 50 },
  { id: 3, code: "VAC003", name: "Vắc-xin 4 bệnh mèo", lot: "LOT2025C", expiry: "20/08/2025", stock: 30 },
  { id: 4, code: "VAC004", name: "Vắc-xin Lepto", lot: "LOT2025D", expiry: "10/02/2025", stock: 15, warning: true },
  { id: 5, code: "VAC005", name: "Vắc-xin Care", lot: "LOT2024E", expiry: "01/01/2025", stock: 5, warning: true }, 
  { id: 6, code: "VAC006", name: "Vắc-xin Parvo", lot: "LOT2025F", expiry: "12/12/2025", stock: 100 },
]

const packages = [{ id: 1, name: "Gói tiêm mèo 12 tháng", remaining: 3, total: 6, expiry: "20/12/2025" }]

const mockHistory = [
    { date: "15/11/2024", vaccine: "Vắc-xin 4 bệnh mèo", batch: "LOT2024X", nextDue: "15/12/2024" },
    { date: "15/10/2024", vaccine: "Vắc-xin 4 bệnh mèo", batch: "LOT2024Y", nextDue: "15/11/2024" },
    { date: "10/01/2024", vaccine: "Vắc-xin Dại", batch: "LOT2023Z", nextDue: "10/01/2025" },
]

export default function VaccinationPage() {
  const [queue, setQueue] = useState(initialQueue)
  const [completedCount, setCompletedCount] = useState(5)
  const todayVaccines = 5 + initialQueue.length

  const [selectedPet, setSelectedPet] = useState<(typeof initialQueue)[0] | null>(null)
  
  // Form State
  const [vaccinationType, setVaccinationType] = useState<"single" | "package">("single")
  const [selectedVaccineId, setSelectedVaccineId] = useState<string>("")
  const [selectedPackage, setSelectedPackage] = useState("")
  const [dosage, setDosage] = useState("")
  const [nextDate, setNextDate] = useState("")
  
  // Dialog State
  const [historyOpen, setHistoryOpen] = useState(false)
  
  // Search State
  const [vaccineSearchOpen, setVaccineSearchOpen] = useState(false)
  const [vaccineSearchTerm, setVaccineSearchTerm] = useState("")

  // --- LOGIC ---

  const handleCancel = () => {
      setSelectedPet(null);
      resetForm();
  }

  const resetForm = () => {
      setVaccinationType("single");
      setSelectedVaccineId("");
      setSelectedPackage("");
      setDosage("");
      setNextDate("");
      setVaccineSearchTerm("");
  }

  const filteredVaccines = vaccines.filter(v => 
    v.name.toLowerCase().includes(vaccineSearchTerm.toLowerCase()) || 
    v.code.toLowerCase().includes(vaccineSearchTerm.toLowerCase()) ||
    v.lot.toLowerCase().includes(vaccineSearchTerm.toLowerCase())
  )

  const handleCompleteVaccination = () => {
      if (!selectedVaccineId) {
          alert("Vui lòng chọn loại vắc-xin!");
          return;
      }
      if (vaccinationType === 'package' && !selectedPackage) {
          alert("Vui lòng chọn gói tiêm của khách!");
          return;
      }
      if (!dosage) {
          alert("Vui lòng nhập liều lượng tiêm!");
          return;
      }

      const vaccineName = vaccines.find(v => v.id.toString() === selectedVaccineId)?.name;
      alert(`Đã hoàn tất tiêm ${vaccineName} cho bé ${selectedPet?.pet}!`);

      setQueue(prev => prev.filter(p => p.id !== selectedPet?.id));
      setCompletedCount(prev => prev + 1);
      
      setSelectedPet(null);
      resetForm();
  }

  const currentVaccine = vaccines.find(v => v.id.toString() === selectedVaccineId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tiêm phòng</h1>
          <p className="text-muted-foreground">Thực hiện tiêm phòng và quản lý nhắc lịch</p>
        </div>
        <Card className="p-4 bg-white">
          <div className="flex items-center gap-4">
            {/* ĐỔI MÀU CAM SANG XANH LÁ */}
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Syringe className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">
                {completedCount}/{todayVaccines}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Ca tiêm hôm nay</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Hàng đợi tiêm
            </CardTitle>
            <CardDescription>{queue.length} thú cưng đang chờ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {queue.map((item) => (
              <div
                key={item.id}
                // ĐỔI MÀU BORDER/BG KHI ACTIVE SANG XANH LÁ
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedPet?.id === item.id ? "border-emerald-500 bg-emerald-50" : "hover:bg-muted/50"
                }`}
                onClick={() => {
                    setSelectedPet(item);
                    if(item.hasPackage) {
                        setVaccinationType("package");
                        if(packages.length > 0) setSelectedPackage(packages[0].id.toString());
                    } else {
                        setVaccinationType("single");
                    }
                }}
              >
                {/* ĐỔI MÀU SỐ THỨ TỰ SANG XANH LÁ */}
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-sm">
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
                {item.hasPackage && (
                  // ĐỔI MÀU BADGE GÓI SANG XANH LÁ
                  <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50">
                    <Package className="w-3 h-3 mr-1" />
                    Gói
                  </Badge>
                )}
              </div>
            ))}
            {queue.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center gap-2">
                    <Check className="w-8 h-8 opacity-20" />
                    Đã hoàn thành hết hàng đợi!
                </div>
            )}
          </CardContent>
        </Card>

        {/* Vaccination Form */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPet ? (
            <>
              {/* Pet Info */}
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
                        <p className="text-muted-foreground">
                          {selectedPet.species} • {selectedPet.breed}
                        </p>
                        <p className="text-sm text-muted-foreground">{selectedPet.age}</p>
                        {/* ĐỔI MÀU ICON/TEXT LỊCH SỬ SANG XANH LÁ */}
                        <div className="flex items-center gap-1 text-sm mt-2 text-emerald-600 font-medium">
                          <Syringe className="w-4 h-4" />
                          <span>{selectedPet.vaccineHistory} mũi đã tiêm</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 md:border-l md:pl-6 space-y-2">
                        <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium text-muted-foreground">Chủ nuôi</h4>
                            
                            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                                        <History className="w-3 h-3" />
                                        Lịch sử tiêm
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Lịch sử tiêm phòng - {selectedPet.pet}</DialogTitle>
                                    </DialogHeader>
                                    <div className="border rounded-md mt-2">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="p-3 text-left font-medium">Ngày tiêm</th>
                                                    <th className="p-3 text-left font-medium">Loại vắc-xin</th>
                                                    <th className="p-3 text-left font-medium">Số lô</th>
                                                    <th className="p-3 text-left font-medium">Hẹn mũi sau</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mockHistory.map((h, i) => (
                                                    <tr key={i} className="border-t">
                                                        <td className="p-3">{h.date}</td>
                                                        <td className="p-3 font-medium">{h.vaccine}</td>
                                                        <td className="p-3 font-mono text-xs text-muted-foreground">{h.batch}</td>
                                                        <td className="p-3">{h.nextDue}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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

              {/* Package Alert */}
              {selectedPet.hasPackage && (
                // ĐỔI MÀU ALERT GÓI SANG XANH LÁ
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                  <Package className="h-4 w-4 text-emerald-600" />
                  <AlertDescription>
                    Khách hàng đang sử dụng <span className="font-bold">{selectedPet.packageName}</span>. 
                    Còn lại <span className="font-bold">{selectedPet.packageRemaining}</span> lượt tiêm.
                  </AlertDescription>
                </Alert>
              )}

              {/* Main Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Thực hiện tiêm phòng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Vaccination Type */}
                  <div className="space-y-3">
                    <Label>Hình thức thanh toán</Label>
                    <RadioGroup
                      value={vaccinationType}
                      onValueChange={(v) => setVaccinationType(v as "single" | "package")}
                      className="flex gap-4"
                    >
                      <Label
                        htmlFor="single"
                        // ĐỔI MÀU ACTIVE STATE SANG XANH LÁ
                        className={`flex-1 p-4 rounded-lg border cursor-pointer text-center transition-all ${
                          vaccinationType === "single" ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500" : "hover:bg-muted/50"
                        }`}
                      >
                        <RadioGroupItem value="single" id="single" className="sr-only" />
                        {/* ĐỔI MÀU ICON ACTIVE SANG XANH LÁ */}
                        <Syringe className={`w-6 h-6 mx-auto mb-2 ${vaccinationType === 'single' ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                        <span className="font-medium">Tiêm lẻ (Thanh toán ngay)</span>
                      </Label>
                      <Label
                        htmlFor="package"
                        // ĐỔI MÀU ACTIVE STATE SANG XANH LÁ
                        className={`flex-1 p-4 rounded-lg border cursor-pointer text-center transition-all ${
                          vaccinationType === "package" ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500" : "hover:bg-muted/50"
                        } ${!selectedPet.hasPackage ? "opacity-50 cursor-not-allowed bg-muted" : ""}`}
                      >
                        <RadioGroupItem
                          value="package"
                          id="package"
                          className="sr-only"
                          disabled={!selectedPet.hasPackage}
                        />
                        {/* ĐỔI MÀU ICON ACTIVE SANG XANH LÁ */}
                        <Package className={`w-6 h-6 mx-auto mb-2 ${vaccinationType === 'package' ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                        <span className="font-medium">Trừ vào gói đã mua</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  {!selectedPet.hasPackage && vaccinationType === "single" && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Khách chưa có gói tiêm. Hãy tư vấn mua gói để được ưu đãi 10-15%!
                      </AlertDescription>
                    </Alert>
                  )}

                  {vaccinationType === "package" && (
                    <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                      <Label>Chọn gói áp dụng</Label>
                      <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn gói tiêm" />
                        </SelectTrigger>
                        <SelectContent>
                          {packages.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id.toString()}>
                              {pkg.name} - HSD: {pkg.expiry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* VACCINE SELECTION WITH SEARCH DIALOG */}
                  <div className="space-y-2">
                    <Label>
                        Chọn loại vắc-xin <span className="text-red-500">*</span>
                    </Label>
                    
                    {!selectedVaccineId ? (
                        <Dialog open={vaccineSearchOpen} onOpenChange={setVaccineSearchOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full justify-between font-normal border-dashed h-12">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Search className="w-4 h-4" /> Tìm kiếm & chọn vắc-xin từ kho...
                                    </span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Chọn vắc-xin từ kho</DialogTitle>
                                    <DialogDescription>Chọn lô vắc-xin để sử dụng cho lần tiêm này</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input 
                                            placeholder="Tìm theo tên, mã hoặc số lô..." 
                                            className="pl-9"
                                            value={vaccineSearchTerm}
                                            onChange={(e) => setVaccineSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto border rounded-md">
                                        {filteredVaccines.length > 0 ? (
                                            filteredVaccines.map((v) => (
                                                <div 
                                                    key={v.id} 
                                                    className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b last:border-0"
                                                    onClick={() => {
                                                        setSelectedVaccineId(v.id.toString());
                                                        setVaccineSearchOpen(false);
                                                    }}
                                                >
                                                    <div>
                                                        <div className="font-medium flex items-center gap-2">
                                                            {v.name}
                                                            {v.warning && <Badge variant="destructive" className="text-[10px] h-5">Sắp hết</Badge>}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                                                            <span>Mã: <span className="font-mono">{v.code}</span></span>
                                                            <span>Lô: <span className="font-mono">{v.lot}</span></span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right text-xs">
                                                        <div>HSD: {v.expiry}</div>
                                                        <div className="font-medium mt-1">Tồn: {v.stock}</div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-muted-foreground text-sm">Không tìm thấy vắc-xin phù hợp</div>
                                        )}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 animate-in fade-in zoom-in-95">
                            <div className="flex items-start gap-3">
                                <div className="bg-white p-2 rounded border">
                                    {/* ĐỔI MÀU ICON VẮC-XIN ĐÃ CHỌN SANG XANH LÁ */}
                                    <Syringe className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="font-medium text-sm text-slate-900">{currentVaccine?.name}</div>
                                    <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                                        <span>Lô: <span className="font-mono text-slate-700">{currentVaccine?.lot}</span></span>
                                        <span>HSD: {currentVaccine?.expiry}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-right mr-2">
                                    <div className="text-[10px] uppercase text-muted-foreground font-bold">Tồn kho</div>
                                    {/* ĐỔI MÀU TỒN KHO SANG XANH LÁ */}
                                    <div className="text-sm font-bold text-emerald-600">{currentVaccine?.stock}</div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50" 
                                    onClick={() => setSelectedVaccineId("")}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Liều lượng tiêm <span className="text-red-500">*</span></Label>
                      <Input
                        id="dosage"
                        placeholder="VD: 1ml / 1 liều"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nextDate">Hẹn mũi tiếp theo</Label>
                      <Input 
                        id="nextDate" 
                        type="date" 
                        value={nextDate} 
                        onChange={(e) => setNextDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]} 
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" className="bg-transparent" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Hủy bỏ
                    </Button>
                    {/* ĐỔI MÀU NÚT HOÀN TẤT SANG XANH LÁ */}
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCompleteVaccination}>
                      <Check className="w-4 h-4" />
                      Hoàn tất tiêm & Lưu
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Syringe className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Chưa chọn thú cưng</p>
                <p className="text-sm">Vui lòng chọn một thú cưng từ hàng đợi bên trái để thực hiện tiêm</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}