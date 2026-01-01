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
  Users,
  Building2,
  Stethoscope,
  Package,
  Receipt,
  UserCog,
  BarChart3,
  Settings,
  Menu,
  Bell,
  LogOut,
  User,
  ChevronDown,
  PieChart,
  History,
} from "lucide-react"
import { cn } from "@/lib/utils"

const sidebarGroups = [
  {
    label: "Quản trị hệ thống",
    items: [{ icon: LayoutDashboard, label: "Tổng quan (KPIs)", href: "/administrator" }],
  },
  {
    label: "Báo cáo doanh thu",
    items: [
      { icon: BarChart3, label: "Doanh thu chi nhánh", href: "/administrator/revenue/branches" },
      { icon: Stethoscope, label: "Hiệu suất bác sĩ", href: "/administrator/revenue/doctors" },
      { icon: Package, label: "Doanh số sản phẩm", href: "/administrator/revenue/products" },
    ],
  },
  {
    label: "Quản lý nguồn lực",
    items: [
      { icon: Building2, label: "Cơ sở & Chi nhánh", href: "/administrator/resources/branches" },
      { icon: UserCog, label: "Nhân sự & Lương", href: "/administrator/resources/hr" },
      { icon: Users, label: "Phân hạng hội viên", href: "/administrator/resources/rankcustomers" },
    ],
  },
  {
    label: "Thiết lập",
    items: [
      { icon: Settings, label: "Cấu hình hệ thống", href: "/administrator/setting/system" },
      { icon: History, label: "Nhật ký hoạt động", href: "/administrator/setting/logs" },
    ],
  },
]

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Link href="/administrator" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white">
            <PawPrint className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-bold">PetCareX</span>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Administrator</p>
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
                        ? "bg-indigo-600 text-white"
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-muted/20">
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 bg-card border-r shadow-sm">
        <SidebarContent />
      </aside>

      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-40 h-16 bg-card/80 backdrop-blur-md border-b flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon"><Menu className="w-5 h-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent onItemClick={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
              Hệ thống toàn chuỗi
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-2">
                  <Avatar className="w-8 h-8"><AvatarFallback>AD</AvatarFallback></Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium">Quản trị viên</span>
                    <span className="text-xs text-muted-foreground">Admin HQ</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Hệ thống</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/"> 
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}