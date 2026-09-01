"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { 
  Calendar as CalendarIcon, 
  Save, 
  Camera, 
  Pencil, 
  X, 
  Briefcase, 
  User, 
  BadgeCheck,
  Loader2
} from "lucide-react"

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

export default function StaffProfilePage() {
  const [formData, setFormData] = useState({
    MaNV: "",
    HoTenNV: "",
    NgaySinhNV: new Date(),
    GioiTinhNV: "Nam",
    LoaiNV: "", 
    Username: "", 
    Phone: ""    
  })

  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

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

  // Fetch Profile Data
  const fetchProfile = async () => {
    const headers = getAuthHeader()
    if (!headers) return

    try {
        const res = await fetch("http://localhost:3055/api/staff/profile", { headers })
        if (res.ok) {
            const data = await res.json()
            const profile = data.metadata
            setFormData({
                MaNV: profile.MaNV,
                HoTenNV: profile.HoTenNV,
                NgaySinhNV: new Date(profile.NgaySinhNV),
                GioiTinhNV: profile.GioiTinhNV,
                LoaiNV: profile.LoaiNV,
                Username: profile.Username,
                Phone: profile.Phone || ""
            })
        }
    } catch (error) {
        console.error("Lỗi tải thông tin:", error)
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // Handle Input Change
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const headers = getAuthHeader()
    if (!headers) return

    try {
        const res = await fetch("http://localhost:3055/api/staff/profile", {
            method: "PUT",
            headers,
            body: JSON.stringify({
                HoTenNV: formData.HoTenNV,
                GioiTinhNV: formData.GioiTinhNV,
                NgaySinhNV: formData.NgaySinhNV.toISOString(), // Format date for SQL
                // Phone: formData.Phone (Nếu DB có cột này thì uncomment)
            })
        })

        if (res.ok) {
            alert("Cập nhật hồ sơ thành công!")
            setIsEditing(false)
        } else {
            alert("Lỗi khi cập nhật hồ sơ")
        }
    } catch (error) {
        console.error(error)
        alert("Lỗi kết nối server")
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    fetchProfile() // Revert changes
  }

  if (loading) {
      return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Hồ sơ nhân viên</h1>
          <p className="text-muted-foreground">
            Thông tin cá nhân và tài khoản làm việc.
          </p>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button type="button" variant="outline" onClick={handleCancel} className="gap-2">
                <X className="w-4 h-4" /> Hủy
              </Button>
              <Button type="submit" form="staff-profile-form" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Save className="w-4 h-4" /> Lưu hồ sơ
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
                  <AvatarImage src="/staff-avatar.png" alt="@staff" />
                  <AvatarFallback className="text-lg bg-emerald-50 text-emerald-700 font-bold">NV</AvatarFallback>
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
                    <Briefcase className="w-4 h-4" />
                    {formData.LoaiNV}
                </div>
                <p className="text-xs text-muted-foreground">Mã nhân viên: <span className="font-mono text-foreground">{formData.MaNV}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Chính */}
        <form id="staff-profile-form" onSubmit={handleSave} className="grid gap-6">
          
          {/* 1. THÔNG TIN CÁ NHÂN (Mapping với bảng NHANVIEN) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                <CardTitle>Thông tin cơ bản</CardTitle>
              </div>
              <CardDescription>
                Dữ liệu định danh trong hệ thống nhân sự.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Hàng 1: Mã NV & Loại NV */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="MaNV">Mã nhân viên</Label>
                  <Input 
                    id="MaNV" 
                    value={formData.MaNV} 
                    disabled 
                    className="bg-muted text-foreground opacity-100 font-mono" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="LoaiNV">Loại nhân viên</Label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        value={formData.LoaiNV} 
                        disabled 
                        className="pl-9 bg-muted text-foreground opacity-100" 
                    />
                  </div>
                </div>
              </div>

              {/* Hàng 2: Họ tên & SĐT */}
              <div className="grid md:grid-cols-2 gap-6">
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
                <div className="space-y-2">
                  <Label htmlFor="Phone">Số điện thoại</Label>
                  <Input 
                    id="Phone" 
                    value={formData.Phone} 
                    onChange={(e) => handleChange("Phone", e.target.value)}
                    // Disabled vì DB chưa có cột Phone, mở ra nếu đã thêm cột
                    disabled 
                    placeholder="Chưa cập nhật (DB thiếu cột SDT)"
                    className={cn("bg-muted/50")}
                  />
                </div>
              </div>

              {/* Hàng 3: Ngày sinh & Giới tính */}
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
        </form>
      </div>
    </div>
  )
}