"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts'
import { DollarSign, Users, Stethoscope, Package, TrendingUp, MapPin } from "lucide-react"

// Dữ liệu mẫu giả định từ Database SQL
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
  { name: 'Bán sản phẩm', value: 25, color: '#FFBB28' },
]

const branchData = [
  { name: 'Quận 1', doanhThu: 550, luotKham: 1240 },
  { name: 'Quận 7', doanhThu: 380, luotKham: 980 },
  { name: 'Bình Thạnh', doanhThu: 320, luotKham: 850 },
]

const doctorData = [
  { name: 'BS. Nguyễn Văn A', luotKham: 156, doanhThu: 85000000 },
  { name: 'BS. Trần Thị B', luotKham: 132, doanhThu: 72000000 },
  { name: 'BS. Lê Văn C', luotKham: 98, doanhThu: 45000000 },
]

export default function RevenuePage() {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo cáo & Thống kê Doanh thu</h1>
          <p className="text-muted-foreground">Phân tích chi tiết doanh thu phòng khám và sản phẩm</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Chọn chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chi nhánh</SelectItem>
              <SelectItem value="q1">PetCareX Quận 1</SelectItem>
              <SelectItem value="q7">PetCareX Quận 7</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Thẻ chỉ số KPI */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPIItem title="Tổng doanh thu" value="1.25 tỷ" change="+12.5%" icon={<DollarSign className="text-green-600"/>} />
        <KPIItem title="Lượt khám" value="1,234" change="+8.2%" icon={<Stethoscope className="text-blue-600"/>} />
        <KPIItem title="Doanh số SP" value="312 tr" change="+15.3%" icon={<Package className="text-orange-600"/>} />
        <KPIItem title="Khách mới" value="156" change="+5.4%" icon={<Users className="text-purple-600"/>} />
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Biểu đồ cột Doanh thu từng ngày */}
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu hàng ngày</CardTitle>
            <CardDescription>So sánh doanh thu thực tế và mục tiêu (triệu đồng)</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="doanhThu" fill="#0ea5e9" name="Doanh thu thực tế" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mucTieu" fill="#e2e8f0" name="Mục tiêu" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Biểu đồ tròn phân bổ doanh thu */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Cơ cấu doanh thu</CardTitle>
            <CardDescription>Theo loại hình dịch vụ</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col items-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie data={serviceDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-2">
              {serviceDistribution.map((s) => (
                <div key={s.name} className="flex justify-between text-sm">
                  <span className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: s.color}}/> {s.name}</span>
                  <span className="font-bold">{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Doanh thu theo Bác sĩ */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo Bác sĩ</CardTitle>
            <CardDescription>Hiệu suất làm việc và doanh thu mang lại</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bác sĩ</TableHead>
                  <TableHead className="text-right">Số lượt khám</TableHead>
                  <TableHead className="text-right">Doanh thu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctorData.map((doc) => (
                  <TableRow key={doc.name}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell className="text-right">{doc.luotKham}</TableCell>
                    <TableCell className="text-right font-bold">{doc.doanhThu.toLocaleString()}đ</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Doanh thu theo Chi nhánh */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê Chi nhánh</CardTitle>
            <CardDescription>So sánh giữa tất cả chi nhánh</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={branchData}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="doanhThu" fill="#6366f1" name="Doanh thu (Triệu)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KPIItem({ title, value, change, icon }: { title: string, value: string, change: string, icon: React.ReactNode }) {
  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-slate-100 rounded-lg">{icon}</div>
          <BadgeTrend value={change} />
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-xs text-muted-foreground mt-1">so với tháng trước</p>
        </div>
      </CardContent>
    </Card>
  )
}

function BadgeTrend({ value }: { value: string }) {
  const isPositive = value.startsWith('+');
  return (
    <div className={`text-xs font-bold flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      <TrendingUp className={`w-3 h-3 mr-1 ${isPositive ? '' : 'rotate-180'}`} />
      {value}
    </div>
  )
}