"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function CustomerHeader() {
  const router = useRouter()
  // State lưu thông tin khách hàng (bao gồm tên và điểm tích lũy)
  const [customer, setCustomer] = useState<{ HoTenKH: string; DiemLoyalty: number; CapTV: string } | null>(null)

  // 1. Lấy thông tin khách hàng khi tải trang
  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        setCustomer(userData)
      } catch (error) {
        console.error("Lỗi đọc dữ liệu khách hàng:", error)
      }
    }
  }, [])

  // 2. Xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("user")
    router.push("/login") // Chuyển về trang đăng nhập của khách
  }

  const displayName = customer?.HoTenKH || "Khách hàng"
  const points = customer?.DiemLoyalty || 0
  const tier = customer?.CapTV || "Cơ bản"
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <header className="bg-background border-b h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="font-semibold text-lg">
        Xin chào, <span className="text-emerald-600">{displayName}</span>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="pl-0 gap-2 hover:bg-transparent">
              <Avatar className="h-9 w-9 border">
                <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">{initial}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">{displayName}</span>
                <div className="flex gap-1 mt-0.5">
                    {/* Badge Hạng */}
                    <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {tier}
                    </Badge>
                    {/* Badge Điểm */}
                    <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 border-orange-200 text-orange-600">
                        {points} điểm
                    </Badge>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
                className="text-red-600 focus:text-red-600 cursor-pointer"
                onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}