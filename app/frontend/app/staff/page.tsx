"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CalendarCheck,
  Stethoscope,
  Syringe,
  Receipt,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  Loader2,
  Info
} from "lucide-react"

export default function StaffDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
        const token = localStorage.getItem("staffAccessToken")
        const userStr = localStorage.getItem("staffUser")
        
        if (!token || !userStr) return;
        const user = JSON.parse(userStr);

        const res = await fetch("http://localhost:3055/api/staff/dashboard", {
            headers: {
                "Content-Type": "application/json",
                "authorization": token,
                "x-client-id": user.MaNV
            }
        })

        if (res.ok) {
            const response = await res.json()
            setData(response.metadata)
        }
    } catch (error) {
        console.error("Lỗi tải dashboard nhân viên:", error)
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
  }

  // Map dữ liệu từ API vào cấu trúc UI
  const statsConfig = [
    { 
        label: "Ca khám hôm nay", 
        value: data?.stats?.exams || 0, 
        icon: Stethoscope, 
        color: "text-primary" 
    },
    { 
        label: "Ca tiêm hôm nay", 
        value: data?.stats?.vaccines || 0, 
        icon: Syringe, 
        color: "text-orange-500" 
    },
    { 
        label: "Hóa đơn hôm nay", 
        value: data?.stats?.invoices || 0, 
        icon: Receipt, 
        color: "text-blue-500" 
    },
    { 
        label: "Khách mới tháng này", 
        value: data?.stats?.newCustomers || 0, 
        icon: Users, 
        color: "text-purple-500" 
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Tổng quan hoạt động chi nhánh hôm nay</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/staff/reception">Tiếp nhận khách</Link>
          </Button>
          <Button asChild>
            <Link href="/staff/pos">Tạo hóa đơn</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Queue */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Hàng đợi khám
              </CardTitle>
              <CardDescription>Danh sách khách hàng đang chờ</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link href="/staff/reception">
                Xem tất cả
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.queue?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {item.order}
                    </div>
                    <div>
                      <p className="font-medium">{item.customer}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.pet} • {item.service}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{item.time}</span>
                    <Badge variant={item.status === "waiting" ? "default" : "secondary"}>
                      {item.status === "waiting" ? "Đang chờ" : "Đã đặt"}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!data?.queue || data.queue.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground text-sm">Hiện không có khách đợi</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Cảnh báo
            </CardTitle>
            <CardDescription>Các vấn đề cần chú ý</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.alerts?.map((alert: any) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === "warning" ? "border-l-yellow-500 bg-yellow-50" : "border-l-blue-500 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                      {alert.type === "warning" ? <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" /> : <Info className="w-4 h-4 text-blue-600 mt-0.5" />}
                      <p className="text-sm text-slate-700">{alert.message}</p>
                  </div>
                </div>
              ))}
              {(!data?.alerts || data.alerts.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground text-sm">Hệ thống hoạt động ổn định</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <CardDescription>Truy cập nhanh các chức năng thường dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent" asChild>
              <Link href="/staff/reception">
                <CalendarCheck className="w-6 h-6" />
                <span>Tiếp nhận khách</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent" asChild>
              <Link href="/doctor/examination">
                <Stethoscope className="w-6 h-6" />
                <span>Bắt đầu khám</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent" asChild>
              <Link href="/doctor/vaccination">
                <Syringe className="w-6 h-6" />
                <span>Thực hiện tiêm</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent" asChild>
              <Link href="/staff/pos">
                <Receipt className="w-6 h-6" />
                <span>Tạo hóa đơn</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}