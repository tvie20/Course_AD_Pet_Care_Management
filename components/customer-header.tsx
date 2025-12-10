"use client"

import { LogOut, User } from "lucide-react" // Đã xóa import Bell
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
  return (
    <header className="bg-background border-b h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="font-semibold text-lg">
        Xin chào, <span className="text-primary">Nguyễn Văn A</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Phần chuông thông báo đã được xóa ở đây */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="pl-0 gap-2 hover:bg-transparent">
              <Avatar className="h-9 w-9 border">
                <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">Nguyễn Văn A</span>
                <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0">
                  Thân thiết
                </Badge>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}