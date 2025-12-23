"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell 
} from 'recharts'
import { MapPin, TrendingUp, Syringe, Stethoscope, Package, Search } from "lucide-react"

// Giả lập dữ liệu chi tiết cho từng chi nhánh
const branchData: Record<string, any> = {
  "q1": {
    name: "PetCareX Quận 1",
    totalRevenue: 550000000,
    stats: { tiêm: 245, khám: 580, bán_sp: 415 },
    daily: [
      { day: 'T2', doanhThu: 45 }, { day: 'T3', doanhThu: 52 }, { day: 'T4', doanhThu: 48 },
      { day: 'T5', doanhThu: 61 }, { day: 'T6', doanhThu: 55 }, { day: 'T7', doanhThu: 70 }, { day: 'CN', doanhThu: 65 }
    ]
  },
  "q7": {
    name: "PetCareX Quận 7",
    totalRevenue: 380000000,
    stats: { tiêm: 180, khám: 420, bán_sp: 310 },
    daily: [
      { day: 'T2', doanhThu: 30 }, { day: 'T3', doanhThu: 35 }, { day: 'T4', doanhThu: 32 },
      { day: 'T5', doanhThu: 40 }, { day: 'T6', doanhThu: 38 }, { day: 'T7', doanhThu: 45 }, { day: 'CN', doanhThu: 42 }
    ]
  },
  "bt": {
    name: "PetCareX Bình Thạnh",
    totalRevenue: 310500000,
    stats: { tiêm: 156, khám: 390, bán_sp: 280 },
    daily: [
      { day: 'T2', doanhThu: 25 }, { day: 'T3', doanhThu: 28 }, { day: 'T4', doanhThu: 30 },
      { day: 'T5', doanhThu: 35 }, { day: 'T6', doanhThu: 33 }, { day: 'T7', doanhThu: 40 }, { day: 'CN', doanhThu: 38 }
    ]
  }
}

const COLORS = ['#f59e0b', '#0ea5e9', '#10b981'];

export default function BranchRevenuePage() {
  const [selectedBranch, setSelectedBranch] = useState("q1")
  const current = branchData[selectedBranch]

  // Chuyển đổi stats sang mảng cho biểu đồ tròn
  const pieData = [
    { name: 'Tiêm phòng', value: current.stats.tiêm },
    { name: 'Khám bệnh', value: current.stats.khám },
    { name: 'Sản phẩm', value: current.stats.bán_sp },
  ]

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Doanh thu theo Chi nhánh</h1>
          <p className="text-sm text-muted-foreground italic flex items-center mt-1">
            <MapPin className="w-3 h-3 mr-1" /> Đang xem: <span className="font-bold ml-1 text-indigo-600">{current.name}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border">
          <span className="text-sm font-medium text-slate-500 ml-2">Lọc chi nhánh:</span>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[220px] border-none shadow-none focus:ring-0">
              <SelectValue placeholder="Chọn chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="q1">PetCareX Quận 1</SelectItem>
              <SelectItem value="q7">PetCareX Quận 7</SelectItem>
              <SelectItem value="bt">PetCareX Bình Thạnh</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid thông số chi tiết của chi nhánh */}
      <div className="grid gap-4 md:grid-cols-3">
        <DetailStatCard title="Lượt tiêm phòng" value={current.stats.tiêm} icon={<Syringe className="text-orange-500" />} color="orange" />
        <DetailStatCard title="Lượt khám bệnh" value={current.stats.khám} icon={<Stethoscope className="text-blue-500" />} color="blue" />
        <DetailStatCard title="Sản phẩm đã bán" value={current.stats.bán_sp} icon={<Package className="text-emerald-500" />} color="emerald" />
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Biểu đồ doanh thu hàng ngày của chi nhánh */}
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Doanh thu 7 ngày gần nhất
              <BadgeTrend value="+12%" />
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={current.daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(v) => `${v} triệu`} />
                <Bar dataKey="doanhThu" fill="#6366f1" radius={[4, 4, 0, 0]} name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Biểu đồ tròn phân bổ hoạt động */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Tỷ trọng hoạt động</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bảng chi tiết doanh thu chi nhánh */}
        <Card className="md:col-span-12">
          <CardHeader>
            <CardTitle className="text-base">Bảng kê chi tiết chỉ số</CardTitle>
            <CardDescription>Số liệu tổng hợp từ database PetCareX_Base</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Loại hình</TableHead>
                  <TableHead className="text-center">Số lượng</TableHead>
                  <TableHead className="text-right">Doanh thu ước tính</TableHead>
                  <TableHead className="text-right">Tỷ trọng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRowDetail label="Tiêm phòng (Mũi lẻ/Gói)" count={current.stats.tiêm} revenue={(current.totalRevenue * 0.25).toLocaleString()} percent="25%" />
                <TableRowDetail label="Khám & Điều trị" count={current.stats.khám} revenue={(current.totalRevenue * 0.55).toLocaleString()} percent="55%" />
                <TableRowDetail label="Bán lẻ sản phẩm & Thuốc" count={current.stats.bán_sp} revenue={(current.totalRevenue * 0.20).toLocaleString()} percent="20%" />
                <TableRow className="bg-slate-50 font-bold">
                  <TableCell>Tổng cộng</TableCell>
                  <TableCell className="text-center">-</TableCell>
                  <TableCell className="text-right text-indigo-600">{current.totalRevenue.toLocaleString()}đ</TableCell>
                  <TableCell className="text-right">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Sub-components
function DetailStatCard({ title, value, icon, color }: any) {
  const bgMap: any = { orange: "bg-orange-50", blue: "bg-blue-50", emerald: "bg-emerald-50" }
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-800">{value} <span className="text-sm font-normal text-slate-400">ca/lượt</span></h3>
        </div>
        <div className={`p-3 rounded-2xl ${bgMap[color]}`}>{icon}</div>
      </CardContent>
    </Card>
  )
}

function TableRowDetail({ label, count, revenue, percent }: any) {
  return (
    <TableRow>
      <TableCell className="font-medium text-slate-700">{label}</TableCell>
      <TableCell className="text-center font-bold">{count}</TableCell>
      <TableCell className="text-right">{revenue}đ</TableCell>
      <TableCell className="text-right text-muted-foreground">{percent}</TableCell>
    </TableRow>
  )
}

function BadgeTrend({ value }: { value: string }) {
  return (
    <div className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
      <TrendingUp className="w-3 h-3 mr-1" /> {value}
    </div>
  )
}