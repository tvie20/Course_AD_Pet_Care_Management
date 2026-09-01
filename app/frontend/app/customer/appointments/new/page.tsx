"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, ArrowRight, Check, Stethoscope, Syringe, QrCode, Clock, Loader2 } from "lucide-react"

const steps = ["Chi nhánh & Dịch vụ", "Thú cưng", "Thời gian", "Xác nhận"]
const timeSlots = [
  "08:00 - 08:30", "08:30 - 09:00", "09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30",
  "14:00 - 14:30", "14:30 - 15:00", "15:00 - 15:30", "15:30 - 16:00", "16:00 - 16:30",
]

// --- HELPER FUNCTIONS ---
const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return String(timeString).slice(0, 5); 
};

const extractCity = (address: string) => {
    if (!address) return "";
    const parts = address.split(",");
    return parts[parts.length - 1]?.trim() || "";
};

// Helper for pet age calculation (from your fetchPets example)
const calculateAge = (birthDate: string) => {
    if (!birthDate) return "N/A";
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

// Helper for date formatting (from your fetchPets example)
const formatDate = (isoString: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString('vi-VN');
};

export default function NewAppointmentPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    branch: "", service: "", vaccineType: "", pet: "", date: "", time: "",
  })
  const [success, setSuccess] = useState(false)
  
  // State lưu dữ liệu
  const [branches, setBranches] = useState<any[]>([])
  const [pets, setPets] = useState<any[]>([])
  
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    
    const fetchResources = async () => {
        setLoadingData(true);
        
        // 1. Chuẩn bị Auth cho Pet API
        const token = localStorage.getItem("accessToken")
        const userStr = localStorage.getItem("user")
        
        // Headers for authenticated requests
        let authHeaders = {};
        if (userStr && token) {
            const user = JSON.parse(userStr);
            authHeaders = { 
                "Content-Type": "application/json", 
                "authorization": token, 
                "x-client-id": user.MaKH 
            };
        }

        try {
            // Gọi song song 2 API
            const [resBranches, resPets] = await Promise.all([
                fetch('http://localhost:3055/api/branches'),
                // Only fetch pets if we have auth headers, otherwise this might fail or return empty
                token ? fetch('http://localhost:3055/api/pets', { headers: authHeaders }) : Promise.resolve(null)
            ]);

            // --- XỬ LÝ BRANCHES ---
            if (resBranches.ok) {
                const data: any = await resBranches.json(); 
                const rawData = Array.isArray(data) ? data : (data.metadata || []);

                const mappedBranches = rawData.map((item: any) => ({
                    id: item.MaCN,
                    name: item.TenCN,
                    address: item.DiaChi,
                    phone: item.SDTCN,
                    hours: `${formatTime(item.ThoiGianMoCua)} - ${formatTime(item.ThoiGianDongCua)}`,
                    city: extractCity(item.DiaChi) 
                }));
                setBranches(mappedBranches);
            }

            // --- XỬ LÝ PETS ---
            if (resPets && resPets.ok) {
                const data = await resPets.json();
                // Depending on your API structure, data might be the array directly or inside .metadata
                // Your fetchPets example implies data is the array, but previous messages said metadata.
                // Let's handle both for safety.
                const rawPets = Array.isArray(data) ? data : (data.metadata || []);

                const mappedPets = rawPets.map((item: any) => ({
                    id: item.MaTC,
                    name: item.TenTC,
                    species: item.Loai,
                    breed: item.Giong,
                    birthDate: formatDate(item.NgaySinhTC),
                    age: calculateAge(item.NgaySinhTC),
                    gender: item.GioiTinhTC || "Không rõ", 
                    status: item.TinhTrangSucKhoe,
                    examCount: item.SoLanKham || 0,
                    vaccineCount: item.SoLanTiem || 0,
                    image: item.Loai === "Mèo" ? "/cute-british-shorthair-cat-portrait.jpg" : "/cute-poodle-dog-portrait.jpg"
                }));
                setPets(mappedPets);
            }

        } catch (err) {
            console.error("Lỗi fetch data:", err);
        } finally {
            setLoadingData(false);
        }
    };

    fetchResources();
  }, []);

  const canProceed = () => {
    switch (step) {
      case 0: return form.branch && form.service && (form.service !== 'vaccine' || form.vaccineType)
      case 1: return form.pet
      case 2: return form.date && form.time
      default: return true
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const token = localStorage.getItem("accessToken")
    const userStr = localStorage.getItem("user")
    const user = JSON.parse(userStr || "{}")

    try {
        const res = await fetch("http://localhost:3055/api/booking", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": token || "",
                "x-client-id": user.MaKH
            },
            body: JSON.stringify({
                maTC: form.pet,
                maCN: form.branch,
                date: form.date,
                time: form.time,
                service: form.service,
                vaccineType: form.vaccineType
            })
        })

        if (res.ok) {
            setSuccess(true)
        } else {
            const err = await res.json()
            alert(err.message || "Lỗi đặt lịch")
        }
    } catch (error) {
        alert("Lỗi kết nối")
    } finally {
        setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1)
    else handleSubmit()
  }

  const isSlotDisabled = (slot: string) => {
    if (!form.date || !now) return false;
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    if (form.date > todayStr) return false;
    if (form.date < todayStr) return true;

    const [startTime] = slot.split(" - ");
    const [slotHour, slotMinute] = startTime.split(":").map(Number);
    const slotTimeValue = slotHour * 60 + slotMinute;
    const currentTimeValue = now.getHours() * 60 + now.getMinutes();

    return slotTimeValue <= currentTimeValue;
    // return false;
  }

  if (loadingData) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Đặt lịch thành công!</h2>
            <p className="text-muted-foreground mb-6">Hệ thống đã ghi nhận lịch hẹn của bạn.</p>
            <div className="bg-muted rounded-2xl p-6 mb-6">
              <div className="w-32 h-32 bg-card rounded-xl mx-auto mb-4 flex items-center justify-center border">
                <QrCode className="w-24 h-24 text-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Quét mã QR tại quầy để check-in nhanh</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild><Link href="/customer/appointments">Xem danh sách lịch hẹn</Link></Button>
              <Button variant="outline" asChild><Link href="/customer">Về trang chủ</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-6">
        <Button variant="ghost" asChild className="gap-2 mb-4">
          <Link href="/customer"><ArrowLeft className="w-4 h-4" /> Quay lại</Link>
        </Button>
        <h1 className="text-2xl font-bold">Đặt lịch hẹn</h1>
        <p className="text-muted-foreground">Đặt lịch khám hoặc tiêm phòng cho thú cưng</p>
      </div>

      <div className="flex items-center justify-between mb-8 px-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`hidden sm:block ml-2 text-sm ${i <= step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</span>
            {i < steps.length - 1 && <div className={`w-6 sm:w-12 h-0.5 mx-2 ${i < step ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 0 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base">Chọn chi nhánh</Label>
                <Select value={form.branch} onValueChange={(v) => setForm({ ...form, branch: v })}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Chọn chi nhánh gần bạn" /></SelectTrigger>
                  <SelectContent>
                    {branches.length > 0 ? branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        <div className="py-1">
                            <p className="font-medium">{b.name}</p>
                            <p className="text-xs text-muted-foreground">{b.address}</p>
                            <p className="text-[10px] text-muted-foreground italic mt-0.5">Giờ làm: {b.hours}</p>
                        </div>
                      </SelectItem>
                    )) : (
                        <div className="p-2 text-sm text-center text-muted-foreground">Không có chi nhánh</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base">Loại dịch vụ</Label>
                <RadioGroup value={form.service} onValueChange={(v) => setForm({ ...form, service: v, vaccineType: "" })} className="grid grid-cols-2 gap-4">
                  <Label htmlFor="exam" className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all ${form.service === "exam" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50 border-muted"}`}>
                    <RadioGroupItem value="exam" id="exam" className="sr-only" />
                    <Stethoscope className={`w-8 h-8 ${form.service === "exam" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-semibold">Khám bệnh</span>
                  </Label>
                  <Label htmlFor="vaccine" className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all ${form.service === "vaccine" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50 border-muted"}`}>
                    <RadioGroupItem value="vaccine" id="vaccine" className="sr-only" />
                    <Syringe className={`w-8 h-8 ${form.service === "vaccine" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-semibold">Tiêm phòng</span>
                  </Label>
                </RadioGroup>
              </div>
              {form.service === "vaccine" && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <Label>Hình thức tiêm</Label>
                  <RadioGroup value={form.vaccineType} onValueChange={(v) => setForm({ ...form, vaccineType: v })} className="flex gap-4">
                    <Label htmlFor="single" className={`flex-1 p-3 rounded-lg border cursor-pointer text-center transition-colors ${form.vaccineType === "single" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                      <RadioGroupItem value="single" id="single" className="sr-only" />
                      <span className="text-sm font-medium">Tiêm lẻ</span>
                    </Label>
                    <Label htmlFor="package" className={`flex-1 p-3 rounded-lg border cursor-pointer text-center transition-colors ${form.vaccineType === "package" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                      <RadioGroupItem value="package" id="package" className="sr-only" />
                      <span className="text-sm font-medium">Theo gói</span>
                    </Label>
                  </RadioGroup>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Label className="text-base">Chọn thú cưng</Label>
              {pets.length > 0 ? (
                  <RadioGroup value={form.pet} onValueChange={(v) => setForm({ ...form, pet: v })} className="space-y-3">
                    {pets.map((pet) => (
                      <Label key={pet.id} htmlFor={`pet-${pet.id}`} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.pet === pet.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50 border-muted"}`}>
                        <RadioGroupItem value={pet.id} id={`pet-${pet.id}`} className="sr-only" />
                        <Avatar className="w-14 h-14 rounded-xl border"><AvatarImage src={pet.image} className="object-cover" /><AvatarFallback>{pet.name[0]}</AvatarFallback></Avatar>
                        <div className="flex-1"><p className="font-bold text-lg">{pet.name}</p><p className="text-sm text-muted-foreground">{pet.species} • {pet.breed}</p></div>
                        {form.pet === pet.id && <Check className="w-5 h-5 text-primary" />}
                      </Label>
                    ))}
                  </RadioGroup>
              ) : (
                  <div className="text-center py-8 border-2 border-dashed rounded-xl">
                      <p className="text-muted-foreground mb-4">Bạn chưa có thú cưng nào</p>
                      <Button variant="outline" asChild><Link href="/customer/pets/new">+ Thêm thú cưng ngay</Link></Button>
                  </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base">Chọn ngày khám</Label>
                <div className="relative">
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value, time: "" })} className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all" min={new Date().toISOString().split("T")[0]} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-muted-foreground" /><Label className="text-base">Chọn khung giờ</Label></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {timeSlots.map((slot) => {
                    const isDisabled = isSlotDisabled(slot);
                    return (
                      <Button key={slot} type="button" variant={form.time === slot ? "default" : "outline"} disabled={isDisabled} onClick={() => setForm({ ...form, time: slot })} className={`text-sm py-6 transition-all ${form.time === slot ? "scale-105 shadow-md" : ""} ${isDisabled ? "opacity-50 bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed" : ""}`}>
                        {slot}
                      </Button>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2 italic">* Vui lòng đến sớm 5-10 phút để làm thủ tục check-in.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-bold text-xl text-center">Kiểm tra lại thông tin</h3>
              <div className="bg-muted/50 rounded-2xl p-6 space-y-4 border">
                <div className="flex justify-between items-center py-1 border-b border-muted">
                  <span className="text-muted-foreground">Chi nhánh:</span>
                  <span className="font-semibold text-right">{branches?.find((b) => b.id === form.branch)?.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-muted">
                  <span className="text-muted-foreground">Dịch vụ:</span>
                  <div className="flex items-center gap-2">
                    {form.service === "exam" ? <Stethoscope className="w-4 h-4 text-primary" /> : <Syringe className="w-4 h-4 text-primary" />}
                    <span className="font-semibold">{form.service === "exam" ? "Khám bệnh" : "Tiêm phòng"}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-muted">
                  <span className="text-muted-foreground">Thú cưng:</span>
                  <span className="font-semibold">{pets?.find((p) => p.id === form.pet)?.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-muted">
                  <span className="text-muted-foreground">Ngày đặt hẹn:</span>
                  <span className="font-semibold">{form.date}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Khung giờ:</span>
                  <span className="font-bold text-primary">{form.time}</span>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground">Bằng việc xác nhận, bạn đồng ý với các quy định về đặt lịch của PetCareX.</p>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0} className="gap-2 px-6"><ArrowLeft className="w-4 h-4" /> Quay lại</Button>
            <Button onClick={handleNext} disabled={!canProceed() || submitting} className={`gap-2 px-8 transition-all ${step === steps.length - 1 ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}>
              {submitting ? <Loader2 className="animate-spin" /> : (step === steps.length - 1 ? "Xác nhận đặt lịch" : "Tiếp tục")}
              {step < steps.length - 1 && !submitting && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}