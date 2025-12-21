"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts'
import { 
  DollarSign, Users, Stethoscope, Package, TrendingUp, TrendingDown,
  Syringe, Building2, UserCog, Settings, BarChart3, ArrowUpRight 
} from "lucide-react"
import { cn } from "@/lib/utils"

// Dữ liệu mẫu
const dailyData = [
  { date: '01/12', doanhThu: 45, mucTieu: 40 },
  { date: '02/12', doanhThu: 52, mucTieu: 40 },
  { date: '03/12', doanhThu: 38, mucTieu: 40 },
  { date: '04/12', doanhThu: 65, mucTieu: 40 },
  { date: '05/12', doanhThu: 48, mucTieu: 40 },
  { date: '06/12', doanhThu: 59, mucTieu: 40 },
  { date: '07/12', doanhThu: 70, mucTieu: 40 },
]

const serviceDistribution = [
  { name: 'Khám bệnh', value: 45, color: '#0088FE' },
  { name: 'Tiêm phòng', value: 30, color: '#00C49F' },
  { name: 'Sản phẩm', value: 25, color: '#FFBB28' },
]

const branchPerformance = [
  { name: "PetCareX Quận 1", revenue: "550.000.000đ", visits: 1240, status: "Tốt" },
  { name: "PetCareX Quận 7", revenue: "380.000.000đ", visits: 980, status: "Ổn định" },
  { name: "PetCareX Bình Thạnh", revenue: "310.500.000đ", visits: 1622, status: "Quá tải" },
]

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trung tâm Quản trị</h1>
        <p className="text-muted-foreground italic">Tổng quan hoạt động kinh doanh toàn chuỗi PetCareX</p>
      </div>

      {/* 4 Thẻ KPI chính */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPIItem title="Doanh thu" value="1.25 tỷ" change="+12.5%" trend="up" icon={<DollarSign className="text-green-600"/>} />
        <KPIItem title="Lượt khám" value="1,234" change="+8.2%" trend="up" icon={<Stethoscope className="text-blue-600"/>} />
        <KPIItem title="Lượt tiêm" value="856" change="-3.1%" trend="down" icon={<Syringe className="text-orange-600"/>} />
        <KPIItem title="Khách mới" value="156" change="+15.3%" trend="up" icon={<Users className="text-purple-600"/>} />
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Biểu đồ doanh thu hàng ngày */}
        <Card className="md:col-span-8 shadow-sm">
          <CardHeader>
            <CardTitle>Doanh thu theo ngày</CardTitle>
            <CardDescription>So sánh doanh thu thực tế và mục tiêu (triệu đồng)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="doanhThu" fill="#0ea5e9" name="Thực tế" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mucTieu" fill="#e2e8f0" name="Mục tiêu" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Biểu đồ tròn phân bổ */}
        <Card className="md:col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Phân bổ doanh thu</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie data={serviceDistribution} innerRadius={60} outerRadius={80} dataKey="value">
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-1">
              {serviceDistribution.map((s) => (
                <div key={s.name} className="flex justify-between text-xs">
                  <span className="flex items-center"><div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: s.color}}/> {s.name}</span>
                  <span className="font-bold">{s.value}%</span>
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
              {branchPerformance.map((branch) => (
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
                    <Badge className="text-[10px]" variant={branch.status === "Quá tải" ? "destructive" : "secondary"}>{branch.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4 Nút chuyển hướng nhanh */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        <QuickActionBtn icon={<BarChart3 />} label="Xuất báo cáo tài chính" />
        <QuickActionBtn icon={<UserCog />} label="Quản lý quỹ lương" />
        <QuickActionBtn icon={<Settings />} label="Cấu hình hệ thống" />
        <QuickActionBtn icon={<ArrowUpRight />} label="Phân tích thị trường" primary />
      </div>
    </div>
  )
}

// Components hỗ trợ
function KPIItem({ title, value, change, trend, icon }: any) {
  return (
    <Card className="shadow-sm border-none">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <div className={cn("text-xs font-bold flex items-center mt-1", trend === "up" ? "text-green-600" : "text-red-600")}>
            {trend === "up" ? <TrendingUp className="w-3 h-3 mr-1"/> : <TrendingDown className="w-3 h-3 mr-1"/>}
            {change}
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