"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar as CalendarIcon, Save, Camera, ShieldCheck, Pencil, X, Stethoscope, Award, Briefcase, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DoctorProfilePage() {
  const [formData, setFormData] = useState({
    MaNV: "",
    HoTenNV: "",
    NgaySinhNV: new Date(),
    GioiTinhNV: "Nam",
    LoaiNV: "", 
    ChungChiHanhNghe: "",
    ChuyenKhoa: "",
    SoNamKinhNghiem: 0,
    Username: "", // Tạm thời để trống hoặc lấy từ localStorage nếu API không trả về
  })

  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  // Helper lấy header
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

  // Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      const headers = getAuthHeader()
      if (!headers) return

      try {
        const res = await fetch("http://localhost:3055/api/doctor/profile", { headers })
        if (res.ok) {
          const data = await res.json()
          const profile = data.metadata
          
          setFormData({
            MaNV: profile.MaNV,
            HoTenNV: profile.HoTenNV,
            NgaySinhNV: new Date(profile.NgaySinhNV),
            GioiTinhNV: profile.GioiTinhNV,
            LoaiNV: profile.LoaiNV === 'B' ? 'Bác sĩ thú y' : profile.LoaiNV, // Map mã loại nếu cần
            ChungChiHanhNghe: profile.ChungChiHanhNghe || "",
            ChuyenKhoa: profile.ChuyenKhoa || "",
            SoNamKinhNghiem: profile.SoNamKinhNghiem || 0,
            Username: profile.MaNV, // Giả sử username là mã nhân viên
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const headers = getAuthHeader()
    if (!headers) return

    try {
        const res = await fetch("http://localhost:3055/api/doctor/profile", {
            method: "PUT",
            headers,
            body: JSON.stringify({
                ...formData,
                NgaySinhNV: formData.NgaySinhNV.toISOString() // Format date for API
            })
        })

        if(res.ok) {
            alert("Cập nhật hồ sơ thành công!")
            setIsEditing(false)
        } else {
            alert("Lỗi cập nhật hồ sơ")
        }
    } catch (error) {
        console.error(error)
        alert("Lỗi kết nối")
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Tốt nhất là fetch lại dữ liệu gốc để revert các thay đổi chưa lưu
    window.location.reload() 
  }

  if (loading) {
      return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Hồ sơ bác sĩ</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin cá nhân và chứng chỉ hành nghề.
          </p>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button type="button" variant="outline" onClick={handleCancel} className="gap-2">
                <X className="w-4 h-4" /> Hủy
              </Button>
              <Button type="submit" form="doctor-profile-form" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Save className="w-4 h-4" /> Lưu thay đổi
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Pencil className="w-4 h-4" /> Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Avatar Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-2 border-emerald-100">
                  <AvatarImage src="/doctor-avatar.png" alt="@doctor" />
                  <AvatarFallback className="text-lg bg-emerald-50 text-emerald-700 font-bold">BS</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute bottom-0 right-0">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-sm border cursor-pointer hover:bg-muted">
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="text-center md:text-left space-y-1">
                <h3 className="font-semibold text-lg">{formData.HoTenNV}</h3>
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-emerald-600 font-medium">
                    <Stethoscope className="w-4 h-4" />
                    {formData.LoaiNV}
                </div>
                <p className="text-xs text-muted-foreground">Mã nhân viên: <span className="font-mono text-foreground">{formData.MaNV}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form chính */}
        <form id="doctor-profile-form" onSubmit={handleSave} className="grid gap-6">
          
          {/* 1. THÔNG TIN CÁ NHÂN (NHANVIEN) */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Thông tin cơ bản trong hồ sơ nhân sự.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="MaNV">Mã nhân viên</Label>
                  <Input id="MaNV" value={formData.MaNV} disabled className="bg-muted text-foreground opacity-100 font-mono" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="HoTenNV">Họ và tên <span className="text-red-500">*</span></Label>
                  <Input 
                    id="HoTenNV" 
                    value={formData.HoTenNV} 
                    onChange={(e) => handleChange("HoTenNV", e.target.value)}
                    disabled={!isEditing} 
                    className={cn(!isEditing && "bg-muted/50")}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 flex flex-col">
                  <Label className="mb-2">Ngày sinh <span className="text-red-500">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        disabled={!isEditing}
                        className={cn(
                          "w-full pl-3 text-left font-normal border-input",
                          !formData.NgaySinhNV && "text-muted-foreground",
                          !isEditing && "bg-muted/50 text-foreground opacity-100 cursor-not-allowed hover:bg-muted/50"
                        )}
                      >
                        {formData.NgaySinhNV ? format(formData.NgaySinhNV, "dd/MM/yyyy") : <span>dd/mm/yyyy</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    {isEditing && (
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.NgaySinhNV}
                          onSelect={(date) => handleChange("NgaySinhNV", date)}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                          locale={vi}
                        />
                      </PopoverContent>
                    )}
                  </Popover>
                </div>

                <div className="space-y-3">
                  <Label>Giới tính <span className="text-red-500">*</span></Label>
                  <RadioGroup 
                    value={formData.GioiTinhNV}
                    onValueChange={(val) => handleChange("GioiTinhNV", val)}
                    disabled={!isEditing} 
                    className="flex items-center gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Nam" id="nam" />
                      <Label htmlFor="nam" className="font-normal cursor-pointer">Nam</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Nữ" id="nu" />
                      <Label htmlFor="nu" className="font-normal cursor-pointer">Nữ</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. THÔNG TIN CHUYÊN MÔN (BACSITHUY) */}
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <CardTitle>Thông tin chuyên môn</CardTitle>
              </div>
              <CardDescription>Chi tiết về bằng cấp và kinh nghiệm (Dành riêng cho Bác sĩ).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Chứng chỉ hành nghề */}
              <div className="space-y-2">
                <Label htmlFor="ChungChiHanhNghe">Chứng chỉ hành nghề <span className="text-red-500">*</span></Label>
                <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        id="ChungChiHanhNghe"
                        value={formData.ChungChiHanhNghe}
                        onChange={(e) => handleChange("ChungChiHanhNghe", e.target.value)}
                        disabled={!isEditing}
                        className={cn("pl-9", !isEditing && "bg-muted/50")}
                        placeholder="Nhập số chứng chỉ..."
                    />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Chuyên khoa */}
                <div className="space-y-2">
                    <Label htmlFor="ChuyenKhoa">Chuyên khoa</Label>
                    <Select 
                        disabled={!isEditing} 
                        value={formData.ChuyenKhoa} 
                        onValueChange={(val) => handleChange("ChuyenKhoa", val)}
                    >
                        <SelectTrigger id="ChuyenKhoa" className={cn(!isEditing && "bg-muted/50")}>
                            <SelectValue placeholder="Chọn chuyên khoa" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Nội khoa">Nội khoa</SelectItem>
                            <SelectItem value="Ngoại khoa">Ngoại khoa (Phẫu thuật)</SelectItem>
                            <SelectItem value="Da liễu">Da liễu</SelectItem>
                            <SelectItem value="Chẩn đoán hình ảnh">Chẩn đoán hình ảnh</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Số năm kinh nghiệm */}
                <div className="space-y-2">
                    <Label htmlFor="SoNamKinhNghiem">Số năm kinh nghiệm</Label>
                    <Input 
                        id="SoNamKinhNghiem"
                        type="number"
                        min={0}
                        value={formData.SoNamKinhNghiem}
                        onChange={(e) => handleChange("SoNamKinhNghiem", Number(e.target.value))}
                        disabled={!isEditing}
                        className={cn(!isEditing && "bg-muted/50")}
                    />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* 3. TÀI KHOẢN (Bảo mật) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <CardTitle>Tài khoản đăng nhập</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input 
                  id="username" 
                  value={formData.Username}
                  disabled 
                  className="bg-muted text-foreground opacity-100" 
                />
              </div>

              <Separator />

              {isEditing ? (
                <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="password">Mật khẩu mới</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Nhập mật khẩu mới nếu muốn đổi" 
                  />
                  <p className="text-[11px] text-muted-foreground">Bỏ trống nếu không muốn đổi mật khẩu.</p>
                </div>
              ) : (
                <div className="pt-2">
                    <p className="text-sm text-muted-foreground italic">
                        Nhấn nút "Chỉnh sửa" để thay đổi mật khẩu.
                    </p>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}