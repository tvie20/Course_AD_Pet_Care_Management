"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar as CalendarIcon, Save, Camera, ShieldCheck, Pencil, X, Loader2 } from "lucide-react"

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

interface ProfileUI {
  MaKH: string;
  HoTenKH: string;
  SDTKH: string;
  EmailKH: string;
  CCCD: string;
  GioiTinhKH: string;
  NgaySinhKH: string;
  NgayDatCap: string;
  CapTV: string;
  TenDangNhap: string;
}

export default function CustomerProfilePage() {
  const [date, setDate] = useState<Date | undefined>()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const [formData, setFormData] = useState<ProfileUI>({
    MaKH: "",
    HoTenKH: "",
    SDTKH: "",
    EmailKH: "",
    CCCD: "",
    GioiTinhKH: "Nam",
    NgaySinhKH: "",
    NgayDatCap: "",
    CapTV: "",
    TenDangNhap: ""
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        const userStr = localStorage.getItem("user")
        
        if (!token || !userStr) return;
        const user = JSON.parse(userStr)

        const res = await fetch("http://localhost:3055/api/profile", {
          headers: {
            "Content-Type": "application/json",
            "authorization": token,
            "x-client-id": user.MaKH
          }
        })

        if(res.ok) {
          const data = await res.json()
          setFormData(data)
          if (data.NgaySinhKH) {
            setDate(new Date(data.NgaySinhKH))
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (field: keyof ProfileUI, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.
          </p>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button type="button" variant="outline" onClick={handleCancel} className="gap-2">
                <X className="w-4 h-4" /> Hủy
              </Button>
              <Button type="submit" form="profile-form" className="gap-2">
                <Save className="w-4 h-4" /> Lưu thay đổi
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Pencil className="w-4 h-4" /> Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-2 border-muted">
                  <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                  <AvatarFallback className="text-lg">{formData.HoTenKH ? formData.HoTenKH.charAt(0) : "U"}</AvatarFallback>
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
                <h3 className="font-semibold text-lg">{formData.HoTenKH}</h3>
                <p className="text-sm text-muted-foreground">Thành viên {formData.CapTV || "Mới"}</p>
                <p className="text-xs text-muted-foreground">
                    Tham gia từ: {formData.NgayDatCap ? new Date(formData.NgayDatCap).toLocaleDateString('en-GB') : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form id="profile-form" onSubmit={handleSave} className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>
                Thông tin cá nhân chính của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullname">Họ và tên <span className="text-red-500">*</span></Label>
                <Input 
                  id="fullname" 
                  disabled={!isEditing} 
                  className={cn(!isEditing && "bg-muted/50 text-foreground opacity-100")}
                  value={formData.HoTenKH}
                  onChange={(e) => handleChange('HoTenKH', e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
                  <Input 
                    id="phone" 
                    disabled={!isEditing} 
                    className={cn(!isEditing && "bg-muted/50 text-foreground opacity-100")}
                    value={formData.SDTKH}
                    onChange={(e) => handleChange('SDTKH', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input 
                    id="email" 
                    type="email" 
                    disabled={!isEditing} 
                    className={cn(!isEditing && "bg-muted/50 text-foreground opacity-100")}
                    value={formData.EmailKH}
                    onChange={(e) => handleChange('EmailKH', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cccd">CCCD (tuỳ chọn)</Label>
                  <Input 
                    id="cccd" 
                    disabled={!isEditing} 
                    className={cn(!isEditing && "bg-muted/50 text-foreground opacity-100")}
                    value={formData.CCCD}
                    onChange={(e) => handleChange('CCCD', e.target.value)}
                  />
                </div>
                <div className="space-y-2 flex flex-col">
                  <Label className="mb-2">Ngày sinh</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        disabled={!isEditing}
                        className={cn(
                          "w-full pl-3 text-left font-normal border-input",
                          !date && "text-muted-foreground",
                          !isEditing && "bg-muted/50 text-foreground opacity-100 cursor-not-allowed hover:bg-muted/50"
                        )}
                      >
                        {date ? format(date, "dd/MM/yyyy") : <span>dd/mm/yyyy</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    {isEditing && (
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => {
                            setDate(d)
                            if(d) handleChange('NgaySinhKH', d.toISOString())
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          locale={vi}
                        />
                      </PopoverContent>
                    )}
                  </Popover>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Giới tính</Label>
                <RadioGroup 
                  value={formData.GioiTinhKH}
                  onValueChange={(val) => handleChange('GioiTinhKH', val)}
                  disabled={!isEditing} 
                  className="flex items-center gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Nam" id="Nam" />
                    <Label htmlFor="Nam" className="font-normal">Nam</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Nữ" id="Nữ" />
                    <Label htmlFor="Nữ" className="font-normal">Nữ</Label>
                  </div>
                 
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <CardTitle>Thông tin tài khoản</CardTitle>
              </div>
              <CardDescription>Quản lý tên đăng nhập và mật khẩu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input 
                  id="username" 
                  value={formData.TenDangNhap}
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