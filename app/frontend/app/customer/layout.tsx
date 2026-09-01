"use client"

import type React from "react"
import { useState, useEffect } from "react" // Thêm useEffect
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  PawPrint,
  LayoutDashboard,
  Cat,
  Calendar,
  History,
  Receipt,
  Star,
  User,
  Menu,
  LogOut,
  ChevronDown,
  ShoppingBag,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Đảm bảo đường dẫn đúng với nơi bạn lưu file cart-provider.tsx
import { CartProvider } from "@/components/cart-provider"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/customer" },
  { icon: ShoppingBag, label: "Mua sắm", href: "/customer/shop" },
  { icon: Cat, label: "Hồ sơ thú cưng", href: "/customer/pets" },
  { icon: Calendar, label: "Đặt lịch hẹn", href: "/customer/appointments" },
  { icon: History, label: "Lịch sử khám & tiêm", href: "/customer/history" },
  { icon: Receipt, label: "Lịch sử mua hàng", href: "/customer/invoices" },
  { icon: Star, label: "Đánh giá dịch vụ", href: "/customer/reviews" },
]

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
            <PawPrint className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">PetCareX</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // --- THÊM LOGIC LẤY DỮ LIỆU TẠI ĐÂY ---
  const [customer, setCustomer] = useState<{ HoTenKH: string, CapTV: string } | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        setCustomer(JSON.parse(userStr))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Xử lý hiển thị tên và chữ cái đầu
  const displayName = customer?.HoTenKH || "Khách hàng"
  const initial = displayName.charAt(0).toUpperCase()

  // Hàm xóa token khi click vào Link Đăng xuất (vẫn giữ nguyên thẻ Link)
  const handleLogout = () => {
    localStorage.removeItem("customerAccessToken")
    localStorage.removeItem("customerUser")
  }
  // ---------------------------------------

  return (
    <CartProvider>
      <div className="min-h-screen flex bg-muted/30">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 bg-card border-r">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <div className="flex-1 lg:pl-64">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 h-16 bg-card border-b flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <SidebarContent onItemClick={() => setSidebarOpen(false)} />
                </SheetContent>
              </Sheet>
              <div className="hidden sm:block">
                {/* Thay tên cứng bằng biến displayName */}
                <h1 className="text-lg font-semibold">Xin chào, {displayName}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/stylized-user-avatar.png" />
                      {/* Thay ký tự cứng bằng biến initial */}
                      <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {customer?.CapTV}
                      </Badge>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/customer/profile">
                      <User className="w-4 h-4 mr-2" />
                      Thông tin cá nhân
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="text-destructive">
                    {/* Giữ nguyên Link, chỉ thêm onClick để xóa storage */}
                    <Link href="/" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Đăng xuất
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </CartProvider>
  )
}