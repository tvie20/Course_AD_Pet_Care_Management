"use client"

import { useState, useEffect } from "react"
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
import { Syringe, Clock, User, Phone, History, AlertTriangle, Check, Package, X, Search, Loader2 } from "lucide-react"

export default function VaccinationPage() {
  const [queue, setQueue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [completedCount, setCompletedCount] = useState(0)
  
  const [selectedPet, setSelectedPet] = useState<any | null>(null)
  
  // Form State
  const [vaccinationType, setVaccinationType] = useState<"single" | "package">("single")
  const [selectedVaccineId, setSelectedVaccineId] = useState<string>("")
  const [selectedPackage, setSelectedPackage] = useState("")
  const [dosage, setDosage] = useState("")
  const [nextDate, setNextDate] = useState("")
  
  // Dialog State
  const [historyOpen, setHistoryOpen] = useState(false)
  const [vaccineHistory, setVaccineHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  
  // Search State
  const [vaccineSearchOpen, setVaccineSearchOpen] = useState(false)
  const [vaccineSearchTerm, setVaccineSearchTerm] = useState("")
  const [foundVaccines, setFoundVaccines] = useState<any[]>([])
  const [currentVaccine, setCurrentVaccine] = useState<any | null>(null)

  // --- API Helpers ---
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
      const res = await fetch("http://localhost:3055/api/doctor/vaccine-queue", { headers })
      if (res.ok) {
        const data = await res.json()
        setQueue(data.metadata)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVaccines = async (query: string) => {
    const headers = getAuthHeader()
    if (!headers || !query) return

    try {
      const res = await fetch(`http://localhost:3055/api/doctor/vaccines/search?q=${query}`, { headers })
      if (res.ok) {
        const data = await res.json()
        setFoundVaccines(data.metadata)
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
      const res = await fetch(`http://localhost:3055/api/doctor/vaccine-history/${petId}`, { headers })
      if (res.ok) {
        const data = await res.json()
        setVaccineHistory(data.metadata)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleCompleteVaccination = async () => {
      if (!selectedVaccineId) {
          alert("Vui lòng chọn loại vắc-xin!")
          return
      }
      if (vaccinationType === 'package' && !selectedPackage) {
          alert("Vui lòng chọn gói tiêm của khách!")
          return
      }
      if (!dosage) {
          alert("Vui lòng nhập liều lượng tiêm!")
          return
      }

      const headers = getAuthHeader()
      if (!headers || !selectedPet) return

      const payload = {
          maKH: selectedPet.MaKH,
          maTC: selectedPet.MaTC,
          vaccineId: selectedVaccineId,
          dosage,
          nextDate,
          type: vaccinationType,
          packageId: selectedPackage
      }

      try {
          const res = await fetch("http://localhost:3055/api/doctor/vaccination", {
              method: "POST",
              headers,
              body: JSON.stringify(payload)
          })

          if (res.ok) {
              alert(`Đã hoàn tất tiêm cho bé ${selectedPet.pet}!`)
              setQueue(prev => prev.filter(p => p.id !== selectedPet.id))
              setCompletedCount(prev => prev + 1)
              handleCancel()
          } else {
              alert("Lỗi khi lưu thông tin tiêm phòng")
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
      if (vaccineSearchTerm) fetchVaccines(vaccineSearchTerm)
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [vaccineSearchTerm])

  const handleCancel = () => {
      setSelectedPet(null)
      setVaccinationType("single")
      setSelectedVaccineId("")
      setCurrentVaccine(null)
      setSelectedPackage("")
      setDosage("")
      setNextDate("")
      setVaccineSearchTerm("")
  }

  if (loading) {
      return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tiêm phòng</h1>
          <p className="text-muted-foreground">Thực hiện tiêm phòng và quản lý nhắc lịch</p>
        </div>
        <Card className="p-4 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Syringe className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">
                {completedCount}/{queue.length + completedCount}
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
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedPet?.id === item.id ? "border-emerald-500 bg-emerald-50" : "hover:bg-muted/50"
                }`}
                onClick={() => {
                    setSelectedPet(item);
                    if(item.hasPackage) {
                        setVaccinationType("package");
                    } else {
                        setVaccinationType("single");
                    }
                }}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-sm">
                  {item.order}
                </div>
                <Avatar className="w-10 h-10 rounded-lg">
                  <AvatarFallback>{item.pet[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.pet}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.species} • {item.breed}
                  </p>
                </div>
                {item.hasPackage && (
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
                        <AvatarFallback className="text-2xl">{selectedPet.pet[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{selectedPet.pet}</h3>
                        <p className="text-muted-foreground">
                          {selectedPet.species} • {selectedPet.breed}
                        </p>
                        <p className="text-sm text-muted-foreground">{selectedPet.age}</p>
                      </div>
                    </div>
                    <div className="flex-1 md:border-l md:pl-6 space-y-2">
                        <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium text-muted-foreground">Chủ nuôi</h4>
                            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                                <DialogTrigger asChild>
                                    <Button 
                                        variant="outline" size="sm" className="h-7 gap-1 text-xs"
                                        onClick={() => fetchHistory(selectedPet.MaTC)}
                                    >
                                        <History className="w-3 h-3" />
                                        Lịch sử tiêm
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Lịch sử tiêm phòng - {selectedPet.pet}</DialogTitle>
                                    </DialogHeader>
                                    <div className="border rounded-md mt-2 max-h-[300px] overflow-auto">
                                        {historyLoading ? (
                                            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                                        ) : (
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted sticky top-0">
                                                    <tr>
                                                        <th className="p-3 text-left font-medium">Ngày tiêm</th>
                                                        <th className="p-3 text-left font-medium">Loại vắc-xin</th>
                                                        <th className="p-3 text-left font-medium">Bác sĩ</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {vaccineHistory.map((h, i) => (
                                                        <tr key={i} className="border-t">
                                                            <td className="p-3">{new Date(h.date).toLocaleDateString('vi-VN')}</td>
                                                            <td className="p-3 font-medium">{h.vaccine}</td>
                                                            <td className="p-3 text-muted-foreground">{h.doctor}</td>
                                                        </tr>
                                                    ))}
                                                    {vaccineHistory.length === 0 && (
                                                        <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">Chưa có lịch sử tiêm</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        )}
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
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                  <Package className="h-4 w-4 text-emerald-600" />
                  <AlertDescription>
                    Khách hàng đang sử dụng gói tiêm ưu đãi.
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
                        className={`flex-1 p-4 rounded-lg border cursor-pointer text-center transition-all ${
                          vaccinationType === "single" ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500" : "hover:bg-muted/50"
                        }`}
                      >
                        <RadioGroupItem value="single" id="single" className="sr-only" />
                        <Syringe className={`w-6 h-6 mx-auto mb-2 ${vaccinationType === 'single' ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                        <span className="font-medium">Tiêm lẻ (Thanh toán ngay)</span>
                      </Label>
                      <Label
                        htmlFor="package"
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
                        <Package className={`w-6 h-6 mx-auto mb-2 ${vaccinationType === 'package' ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                        <span className="font-medium">Trừ vào gói đã mua</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  {!selectedPet.hasPackage && vaccinationType === "single" && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Khách chưa có gói tiêm. Hãy tư vấn mua gói để được ưu đãi!
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* VACCINE SELECTION */}
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
                                    <DialogDescription>Chọn lô vắc-xin để sử dụng</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input 
                                            placeholder="Tìm theo tên, mã..." 
                                            className="pl-9"
                                            value={vaccineSearchTerm}
                                            onChange={(e) => setVaccineSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto border rounded-md">
                                        {foundVaccines.length > 0 ? (
                                            foundVaccines.map((v) => (
                                                <div 
                                                    key={v.id} 
                                                    className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b last:border-0"
                                                    onClick={() => {
                                                        setSelectedVaccineId(v.id);
                                                        setCurrentVaccine(v);
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
                                            <div className="p-4 text-center text-muted-foreground text-sm">
                                                {vaccineSearchTerm ? "Không tìm thấy vắc-xin" : "Nhập tên vắc-xin để tìm kiếm"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 animate-in fade-in zoom-in-95">
                            <div className="flex items-start gap-3">
                                <div className="bg-white p-2 rounded border">
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
                                    <div className="text-sm font-bold text-emerald-600">{currentVaccine?.stock}</div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50" 
                                    onClick={() => {
                                        setSelectedVaccineId("")
                                        setCurrentVaccine(null)
                                    }}
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