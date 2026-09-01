"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PawPrint, User, Briefcase, ArrowLeft, Loader2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  
  const [customerForm, setCustomerForm] = useState({ username: "", password: "", remember: false })
  const [staffForm, setStaffForm] = useState({ employeeId: "", password: "" })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("http://localhost:3055/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenDangNhap: customerForm.username,
          matKhau: customerForm.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại")
      }

      localStorage.setItem("accessToken", data.tokens.accessToken)
      localStorage.setItem("refreshToken", data.tokens.refreshToken)
      localStorage.setItem("user", JSON.stringify(data.user))
      
      router.push("/customer") 
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3055/api/login-staff", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maNhanVien: staffForm.employeeId,
          matKhau: staffForm.password,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Đăng nhập nhân viên thất bại");
      }

      const { user, tokens } = responseData.metadata || responseData;

      localStorage.setItem("staffAccessToken", tokens.accessToken);
      localStorage.setItem("staffUser", JSON.stringify(user));

      switch (user.LoaiNV) {
        case 'Q':
            router.push("/administrator");
            break;
        case 'H':
            router.push("/staff");
            break;
        case 'B':
            router.push("/doctor");
            break;
        case 'T':
            router.push("/staff"); 
            break;
        default:
            router.push("/staff");
            break;
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

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
            <Tabs defaultValue="customer" className="w-full" onValueChange={() => setError("")}>
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

              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm flex items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
              )}

              <TabsContent value="customer">
                <form onSubmit={handleCustomerLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-username">Tên đăng nhập / Email / SĐT<span className="text-red-500">*</span></Label>
                    <Input
                      id="customer-username"
                      placeholder="Nhập tên đăng nhập"
                      value={customerForm.username}
                      onChange={(e) => setCustomerForm({ ...customerForm, username: e.target.value })}
                      required
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
                      required
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
                  
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</> : "Đăng nhập"}
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
                <form onSubmit={handleStaffLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-id">Mã nhân viên<span className="text-red-500">*</span></Label>
                    <Input
                      id="staff-id"
                      placeholder="VD: NV001"
                      value={staffForm.employeeId}
                      onChange={(e) => setStaffForm({ ...staffForm, employeeId: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff-password">Mật khẩu<span className="text-red-500">*</span></Label>
                    <Input
                      id="staff-password"
                      type="password"
                      placeholder="Nhập mật khẩu nội bộ"
                      value={staffForm.password}
                      onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</> : "Đăng nhập quản trị"}
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