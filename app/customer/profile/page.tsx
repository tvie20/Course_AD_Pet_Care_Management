"use client"

import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar as CalendarIcon, Save, Camera, ShieldCheck, Pencil, X } from "lucide-react"

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

export default function CustomerProfilePage() {
  const [date, setDate] = useState<Date | undefined>(new Date(1995, 5, 15))
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    // Xử lý logic lưu dữ liệu ở đây (API call)
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset lại dữ liệu về ban đầu nếu cần
    setIsEditing(false)
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
        
        {/* Nút điều khiển chế độ Sửa/Xem nằm ở trên cùng để dễ thao tác */}
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
        {/* Avatar Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-2 border-muted">
                  <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                  <AvatarFallback className="text-lg">NA</AvatarFallback>
                </Avatar>
                {/* Chỉ hiện nút đổi ảnh khi đang ở chế độ chỉnh sửa */}
                {isEditing && (
                  <div className="absolute bottom-0 right-0">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-sm border cursor-pointer hover:bg-muted">
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="text-center md:text-left space-y-1">
                <h3 className="font-semibold text-lg">Nguyễn Văn A</h3>
                <p className="text-sm text-muted-foreground">Thành viên Thân thiết</p>
                <p className="text-xs text-muted-foreground">Tham gia từ: 20/05/2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Info Form */}
        <form id="profile-form" onSubmit={handleSave} className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>
                Thông tin cá nhân chính của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Họ và tên */}
              <div className="space-y-2">
                <Label htmlFor="fullname">Họ và tên <span className="text-red-500">*</span></Label>
                <Input 
                  id="fullname" 
                  disabled={!isEditing} 
                  className={cn(!isEditing && "bg-muted/50 text-foreground opacity-100")}
                  defaultValue="Nguyễn Văn A" 
                />
              </div>

              {/* Số điện thoại & Email */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
                  <Input 
                    id="phone" 
                    disabled={!isEditing} 
                    className={cn(!isEditing && "bg-muted/50 text-foreground opacity-100")}
                    defaultValue="0901234567" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input 
                    id="email" 
                    type="email" 
                    disabled={!isEditing} 
                    className={cn(!isEditing && "bg-muted/50 text-foreground opacity-100")}
                    defaultValue="nguyenvana@gmail.com" 
                  />
                </div>
              </div>

              {/* CCCD & Ngày sinh */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cccd">CCCD (tuỳ chọn)</Label>
                  <Input 
                    id="cccd" 
                    disabled={!isEditing} 
                    className={cn(!isEditing && "bg-muted/50 text-foreground opacity-100")}
                    defaultValue="001234567890" 
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
                    {/* Chỉ render nội dung Popover khi đang chỉnh sửa để tránh lỗi UI */}
                    {isEditing && (
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
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

              {/* Giới tính */}
              <div className="space-y-3">
                <Label>Giới tính</Label>
                <RadioGroup 
                  defaultValue="nam" 
                  disabled={!isEditing} 
                  className="flex items-center gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nam" id="nam" />
                    <Label htmlFor="nam" className="font-normal">Nam</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nu" id="nu" />
                    <Label htmlFor="nu" className="font-normal">Nữ</Label>
                  </div>
                 
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Account Security Section */}
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
                  value="username123" 
                  disabled 
                  className="bg-muted text-foreground opacity-100" 
                />
              </div>

              <Separator />

              {/* Chỉ hiện ô nhập mật khẩu mới khi đang ở chế độ chỉnh sửa để giao diện xem gọn gàng hơn */}
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