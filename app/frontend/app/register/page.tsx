"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PawPrint, ArrowLeft, Check, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    cccd: "",
    birthday: "",
    gender: "male",
    username: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    // 1. Client-side Validation
    if (form.password !== form.confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.")
      return
    }

    setIsLoading(true)

    try {
      // 2. Mapping Data (Frontend -> Backend)
      // Chuyển đổi giới tính sang tiếng Việt để khớp với DB (Nam/Nữ)
      let genderSQL = "Nam"
      if (form.gender === "female") genderSQL = "Nữ"
      if (form.gender === "other") genderSQL = "Khác"

      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        cccd: form.cccd,
        birthday: form.birthday,
        gender: genderSQL, 
        username: form.username,
        password: form.password
      }

      // 3. Call API
      // Đảm bảo URL này khớp với route bạn đã định nghĩa trong server.js
      const response = await fetch("http://localhost:3055/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        // Lấy message lỗi từ Backend (VD: Số điện thoại đã tồn tại)
        throw new Error(data.message || "Đăng ký thất bại. Vui lòng thử lại.")
      }

      // 4. Success
      setSuccess(true)

    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Đăng ký thành công!</h2>
            <p className="text-muted-foreground mb-6">
              Chào mừng bạn đến với PetCareX. Tài khoản của bạn đã được tạo với cấp hội viên Cơ bản.
            </p>
            <div className="space-y-3">
              <Button className="w-full" asChild>
                <Link href="/login">Đăng nhập ngay</Link>
              </Button>
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/">Quay lại trang chủ</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-muted/30">
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary">
              <PawPrint className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">PetCareX</span>
          </Link>
          <h1 className="text-2xl font-bold">Đăng ký hội viên</h1>
          <p className="text-muted-foreground mt-2">Tạo tài khoản để trải nghiệm dịch vụ tốt nhất</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin đăng ký</CardTitle>
            <CardDescription>Vui lòng điền đầy đủ thông tin bên dưới</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Hiển thị lỗi nếu có */}
            {errorMsg && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi đăng ký</AlertTitle>
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Thông tin cá nhân</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên <span className="text-red-500">*</span></Label>
                    <Input
                      id="fullName"
                      placeholder="Nguyễn Văn A"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="0901234567"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cccd">CCCD <span className="text-red-500">*</span></Label>
                      <Input
                        id="cccd"
                        placeholder="001234567890"
                        value={form.cccd}
                        onChange={(e) => setForm({ ...form, cccd: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthday">Ngày sinh <span className="text-red-500">*</span></Label>
                      <Input
                        id="birthday"
                        type="date"
                        value={form.birthday}
                        onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Giới tính</Label>
                    <RadioGroup
                      value={form.gender}
                      onValueChange={(value) => setForm({ ...form, gender: value })}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="cursor-pointer">Nam</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="cursor-pointer">Nữ</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="cursor-pointer">Khác</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Thông tin tài khoản</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Tên đăng nhập <span className="text-red-500">*</span></Label>
                    <Input
                      id="username"
                      placeholder="username123"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Mật khẩu <span className="text-red-500">*</span></Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu <span className="text-red-500">*</span></Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={form.agreeTerms}
                  onCheckedChange={(checked) => setForm({ ...form, agreeTerms: checked as boolean })}
                  required
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                  Tôi đồng ý với{" "}
                  <Link href="#" className="text-primary hover:underline">
                    điều khoản sử dụng
                  </Link>{" "}
                  và{" "}
                  <Link href="#" className="text-primary hover:underline">
                    chính sách bảo mật
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !form.agreeTerms}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đăng ký"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Đăng nhập ngay
                </Link>
              </p>
            </form>
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