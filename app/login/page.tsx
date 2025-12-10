"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PawPrint, User, Briefcase, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const [customerForm, setCustomerForm] = useState({ username: "", password: "", remember: false })
  const [staffForm, setStaffForm] = useState({ employeeId: "", password: "" })

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary">
              <PawPrint className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">PetCareX</span>
          </Link>
          <h1 className="text-2xl font-bold">Đăng nhập hệ thống</h1>
          <p className="text-muted-foreground mt-2">Chọn loại tài khoản để tiếp tục</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="customer" className="gap-2">
                  <User className="w-4 h-4" />
                  Khách hàng
                </TabsTrigger>
                <TabsTrigger value="staff" className="gap-2">
                  <Briefcase className="w-4 h-4" />
                  Nhân viên
                </TabsTrigger>
              </TabsList>

              <TabsContent value="customer">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-username">Tên đăng nhập / Email / SĐT<span className="text-red-500">*</span></Label>
                    <Input
                      id="customer-username"
                      placeholder="Nhập tên đăng nhập"
                      value={customerForm.username}
                      onChange={(e) => setCustomerForm({ ...customerForm, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-password">Mật khẩu<span className="text-red-500">*</span></Label>
                    <Input
                      id="customer-password"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={customerForm.password}
                      onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={customerForm.remember}
                        onCheckedChange={(checked) =>
                          setCustomerForm({ ...customerForm, remember: checked as boolean })
                        }
                      />
                      <Label htmlFor="remember" className="text-sm cursor-pointer">
                        Ghi nhớ đăng nhập
                      </Label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href="/customer">Đăng nhập</Link>
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Chưa có tài khoản?{" "}
                    <Link href="/register" className="text-primary hover:underline font-medium">
                      Đăng ký hội viên ngay
                    </Link>
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="staff">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-id">Mã nhân viên / Tên đăng nhập<span className="text-red-500">*</span></Label>
                    <Input
                      id="staff-id"
                      placeholder="Nhập mã nhân viên"
                      value={staffForm.employeeId}
                      onChange={(e) => setStaffForm({ ...staffForm, employeeId: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff-password">Mật khẩu<span className="text-red-500">*</span></Label>
                    <Input
                      id="staff-password"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={staffForm.password}
                      onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    />
                  </div>
                  <Button className="w-full" asChild>
                    <Link href="/staff">Đăng nhập</Link>
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Quay lại trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
