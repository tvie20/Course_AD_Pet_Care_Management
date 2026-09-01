"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts'
import { 
  DollarSign, Users, Stethoscope, Syringe, Building2, UserCog, Settings, BarChart3, ArrowUpRight, TrendingUp, TrendingDown, Loader2 
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const getAuthHeader = () => {
    const token = localStorage.getItem("staffAccessToken")
    const userStr = localStorage.getItem("staffUser")
    if (!token || !userStr) return null
    const user = JSON.parse(userStr)
    return {
      "Content-Type": "application/json",
      "authorization": token,
      "x-client-id": user.MaNV
    }
  }

  const fetchData = async () => {
    const headers = getAuthHeader()
    if (!headers) return

    try {
        const res = await fetch("http://localhost:3055/api/admin/dashboard", { headers })
        if (res.ok) {
            const response = await res.json()
            setData(response.metadata)
        }
    } catch (error) {
        console.error("Lỗi tải dashboard admin:", error)
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
      return <div className="flex justify-center py-20 min-h-screen bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
  }

  const formatCurrency = (val: number) => {
      if (!val) return "0";
      if (val >= 1000000000) return (val / 1000000000).toFixed(1) + " tỷ";
      if (val >= 1000000) return (val / 1000000).toFixed(1) + " tr";
      return val.toLocaleString();
  }

  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trung tâm Quản trị</h1>
        <p className="text-muted-foreground italic">Tổng quan hoạt động kinh doanh toàn chuỗi PetCareX</p>
      </div>

      {/* 4 Thẻ KPI chính */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* KPI: Doanh thu */}
        <KPIItem 
            title="Doanh thu" 
            value={data ? formatCurrency(data.kpi.revenue.value) : "0"} 
            change={data?.kpi.revenue.change} 
            trend={data?.kpi.revenue.trend} 
            icon={<DollarSign className="text-green-600"/>} 
        />
        {/* KPI: Lượt khám */}
        <KPIItem 
            title="Lượt khám" 
            value={data?.kpi.exams.value.toLocaleString()} 
            change={data?.kpi.exams.change} 
            trend={data?.kpi.exams.trend} 
            icon={<Stethoscope className="text-blue-600"/>} 
        />
        {/* KPI: Lượt tiêm */}
        <KPIItem 
            title="Lượt tiêm" 
            value={data?.kpi.vaccines.value.toLocaleString()} 
            change={data?.kpi.vaccines.change} 
            trend={data?.kpi.vaccines.trend} 
            icon={<Syringe className="text-orange-600"/>} 
        />
        {/* KPI: Khách mới */}
        <KPIItem 
            title="Khách mới" 
            value={data?.kpi.newCustomers.value.toLocaleString()} 
            change={data?.kpi.newCustomers.change} 
            trend={data?.kpi.newCustomers.trend} 
            icon={<Users className="text-purple-600"/>} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Biểu đồ doanh thu hàng ngày */}
        <Card className="md:col-span-8 shadow-sm">
          <CardHeader>
            <CardTitle>Doanh thu 7 ngày qua</CardTitle>
            <CardDescription>So sánh doanh thu thực tế và mục tiêu (triệu đồng)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`${value} tr`, "Doanh thu"]} />
                <Bar dataKey="doanhThu" fill="#0ea5e9" name="Thực tế" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mucTieu" fill="#e2e8f0" name="Mục tiêu" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Biểu đồ tròn phân bổ */}
        <Card className="md:col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Phân bổ dịch vụ</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie 
                    data={data?.serviceDistribution || []} 
                    innerRadius={60} 
                    outerRadius={80} 
                    dataKey="value"
                    paddingAngle={5}
                >
                  {data?.serviceDistribution?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-1">
              {data?.serviceDistribution?.map((s: any, index: number) => (
                <div key={s.name} className="flex justify-between text-xs">
                  <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: PIE_COLORS[index % PIE_COLORS.length]}}/> 
                      {s.name}
                  </span>
                  <span className="font-bold">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hiệu suất chi nhánh */}
        <Card className="md:col-span-12 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Hiệu suất Chi nhánh</CardTitle>
            <Button variant="ghost" size="sm" className="text-indigo-600">Xem chi tiết</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.branches?.map((branch: any) => (
                <div key={branch.name} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-full"><Building2 className="w-4 h-4 text-slate-600"/></div>
                    <div>
                      <p className="font-medium text-sm text-slate-900">{branch.name}</p>
                      <p className="text-xs text-muted-foreground">{branch.visits} lượt khách</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{branch.revenue}</p>
                    <Badge className="text-[10px]" variant={branch.status === "Cần cải thiện" ? "destructive" : "secondary"}>
                        {branch.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        <QuickActionBtn icon={<BarChart3 />} label="Xuất báo cáo tài chính" />
        <QuickActionBtn icon={<UserCog />} label="Quản lý quỹ lương" />
        <QuickActionBtn icon={<Settings />} label="Cấu hình hệ thống" />
        <QuickActionBtn icon={<ArrowUpRight />} label="Phân tích thị trường" primary />
      </div>
    </div>
  )
}

function KPIItem({ title, value, change, trend, icon }: any) {
  return (
    <Card className="shadow-sm border-none">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <div className={cn("text-xs font-bold flex items-center mt-1", trend === "up" ? "text-green-600" : "text-red-600")}>
            {trend === "up" ? <TrendingUp className="w-3 h-3 mr-1"/> : <TrendingDown className="w-3 h-3 mr-1"/>}
            {change} <span className="text-muted-foreground font-normal ml-1">vs tháng trước</span>
          </div>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      </CardContent>
    </Card>
  )
}

function QuickActionBtn({ icon, label, primary = false }: any) {
  return (
    <Button variant="outline" className={cn("h-20 flex-col gap-2 shadow-sm border-slate-200 hover:bg-white hover:border-indigo-400 transition-all", primary && "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white")}>
      {React.cloneElement(icon, { className: "w-5 h-5" })}
      <span className="text-[11px] font-semibold">{label}</span>
    </Button>
  )
}