"use client"

import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { 
  Calendar as CalendarIcon, 
  Save, 
  Camera, 
  ShieldCheck, 
  Pencil, 
  X, 
  Briefcase, 
  User, 
  BadgeCheck 
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StaffProfilePage() {
  // Giả lập dữ liệu từ bảng NHANVIEN
  const [formData, setFormData] = useState({
    MaNV: "NV005",
    HoTenNV: "Trần Thị B",
    NgaySinhNV: new Date(1998, 8, 20),
    GioiTinhNV: "Nữ",
    LoaiNV: "Tiếp tân", // Hoặc "Sales"
    Username: "tieptan_b", // Thông tin bổ sung cho tài khoản
    Phone: "0912345678"    // Thông tin liên lạc thường có trong bảng nhân viên thực tế
  })

  const [isEditing, setIsEditing] = useState(false)

  // Xử lý thay đổi input
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    // Logic gọi API update thông tin nhân viên (UPDATE NHANVIEN SET ...)
    console.log("Saving staff data:", formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Thực tế nên reset lại data về ban đầu
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
                  {/* Loại NV thường do Admin set, user chỉ xem được */}
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
                    disabled={!isEditing} 
                    className={cn(!isEditing && "bg-muted/50")}
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

          {/* 2. TÀI KHOẢN (Bảo mật) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
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