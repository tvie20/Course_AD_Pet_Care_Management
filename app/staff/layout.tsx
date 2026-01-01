"use client"

import type React from "react"

import { useState } from "react"
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
  CalendarCheck,
  Stethoscope,
  Syringe,
  ShoppingCart,
  Users,
  Cat,
  Package,
  Warehouse,
  Receipt,
  UserCog,
  BarChart3,
  Settings,
  Menu,
  Bell,
  LogOut,
  User,
  ChevronDown,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

const sidebarGroups = [
  {
    label: "Tổng quan",
    items: [{ icon: LayoutDashboard, label: "Dashboard", href: "/staff" }],
  },
  {
  label: "Nghiệp vụ",
  items: [
    { icon: CalendarCheck, label: "Tiếp nhận & Đặt lịch", href: "/staff/reception" },
    { icon: ShoppingCart, label: "Bán hàng & Thanh toán", href: "/staff/pos" },
  ],
},

  {
    label: "Quản lý",
    items: [
      { icon: Cat, label: "Thú cưng", href: "/staff/pets" },
      { icon: Receipt, label: "Hóa đơn", href: "/staff/invoices" },
      { icon: Warehouse, label: "Kho & Nhập hàng", href: "/staff/inventory" },
      { icon: MessageSquare, label: "Đánh giá & Phản hồi", href: "/staff/reviews" },
    ],
  },
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
          <div>
            <span className="text-lg font-bold text-foreground">PetCareX</span>
            <p className="text-xs text-muted-foreground">Backoffice</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {sidebarGroups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
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
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
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
              <Badge variant="outline">Chi nhánh: PetCareX Quận 1</Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/doctor-avatar.png" />
                    <AvatarFallback>BS</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium">NV. Nguyễn Văn A</span>
                    <span className="text-xs text-muted-foreground">Nhân viên</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/staff/profile">
                    <User className="w-4 h-4 mr-2" />
                    Thông tin cá nhân
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-destructive">
                  <Link href="/">
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
  )
}
