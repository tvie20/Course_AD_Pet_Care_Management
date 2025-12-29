"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell 
} from 'recharts'
import { MapPin, TrendingUp, Syringe, Stethoscope, Package, AlertCircle } from "lucide-react"
import { format, subDays, parseISO, isAfter, isBefore } from "date-fns" // (Gợi ý: nên cài thêm date-fns để xử lý ngày tháng dễ hơn, nhưng ở đây mình dùng JS thuần để bạn copy chạy ngay)

// --- MOCK DATA GENERATOR ---
// Hàm tạo dữ liệu giả lập cho 7 ngày tính từ ngày kết thúc
const generateLast7DaysData = (endDateStr: string, baseRevenue: number) => {
  const data = []
  const end = new Date(endDateStr)
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(end.getDate() - i)
    
    // Random doanh thu dao động quanh mức baseRevenue
    const randomFactor = 0.8 + Math.random() * 0.4 // 0.8 -> 1.2
    const rev = Math.floor(baseRevenue * randomFactor)
    
    data.push({
      date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }), // Format dd/mm
      fullDate: d.toISOString().split('T')[0],
      doanhThu: rev
    })
  }
  return data
}

// Thông tin cơ bản chi nhánh
const branchInfo: Record<string, any> = {
  "q1": { name: "PetCareX Quận 1", baseRev: 55, stats: { tiêm: 245, khám: 580, bán_sp: 415 } },
  "q7": { name: "PetCareX Quận 7", baseRev: 38, stats: { tiêm: 180, khám: 420, bán_sp: 310 } },
  "bt": { name: "PetCareX Bình Thạnh", baseRev: 31, stats: { tiêm: 156, khám: 390, bán_sp: 280 } }
}

const COLORS = ['#f59e0b', '#0ea5e9', '#10b981'];

export default function BranchRevenuePage() {
  const [selectedBranch, setSelectedBranch] = useState("q1")
  
  // 1. State quản lý ngày tháng (Mặc định hôm nay)
  const today = new Date().toISOString().split('T')[0]
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const [dateRange, setDateRange] = useState({
    from: lastMonth.toISOString().split('T')[0], // Mặc định từ 1 tháng trước
    to: today // Mặc định đến hôm nay
  })

  // 2. Logic xử lý ràng buộc ngày tháng
  const handleDateChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      // Nếu chọn "Từ ngày" lớn hơn "Đến ngày", tự động đẩy "Đến ngày" bằng "Từ ngày"
      if (value > dateRange.to) {
        setDateRange({ from: value, to: value })
      } else {
        setDateRange({ ...dateRange, from: value })
      }
    } else {
      // Nếu chọn "Đến ngày" nhỏ hơn "Từ ngày", không cho phép (hoặc reset "Từ ngày")
      if (value < dateRange.from) {
        // Cách 1: Chặn không cho chọn (nếu dùng input min/max)
        // Cách 2: Tự động lùi "Từ ngày" về bằng "Đến ngày" (User Friendly hơn)
        setDateRange({ from: value, to: value })
      } else {
        setDateRange({ ...dateRange, to: value })
      }
    }
  }

  const currentInfo = branchInfo[selectedBranch]

  // 3. Tính toán dữ liệu biểu đồ (Luôn lấy 7 ngày gần nhất tính từ dateRange.to)
  const chartData = useMemo(() => {
    return generateLast7DaysData(dateRange.to, currentInfo.baseRev)
  }, [dateRange.to, selectedBranch]) // Chỉ chạy lại khi 'Đến ngày' hoặc 'Chi nhánh' thay đổi

  // Giả lập tổng doanh thu thay đổi theo range (để demo số nhảy)
  const estimatedTotalRevenue = useMemo(() => {
      // Logic giả: lấy trung bình * số ngày chênh lệch
      const start = new Date(dateRange.from)
      const end = new Date(dateRange.to)
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
      return (currentInfo.baseRev * diffDays * 1000000)
  }, [dateRange, selectedBranch])

  const pieData = [
    { name: 'Tiêm phòng', value: currentInfo.stats.tiêm },
    { name: 'Khám bệnh', value: currentInfo.stats.khám },
    { name: 'Sản phẩm', value: currentInfo.stats.bán_sp },
  ]

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Doanh thu theo Chi nhánh</h1>
          <p className="text-sm text-muted-foreground italic flex items-center mt-1">
            <MapPin className="w-3 h-3 mr-1" /> Đang xem: <span className="font-bold ml-1 text-indigo-600">{currentInfo.name}</span>
          </p>
        </div>
        
        {/* KHU VỰC BỘ LỌC */}
        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
           {/* Bộ lọc ngày tháng */}
           <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-md border">
              <div className="relative group">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Từ</span>
                <Input 
                  type="date" 
                  value={dateRange.from}
                  max={dateRange.to} // HTML constraint: Không được chọn ngày sau "Đến ngày"
                  onChange={(e) => handleDateChange('from', e.target.value)}
                  className="pl-8 w-[130px] h-9 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm"
                />
              </div>
              <div className="h-6 w-px bg-slate-300"></div>
              <div className="relative group">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Đến</span>
                <Input 
                  type="date" 
                  value={dateRange.to}
                  min={dateRange.from} // HTML constraint: Không được chọn ngày trước "Từ ngày"
                  onChange={(e) => handleDateChange('to', e.target.value)}
                  className="pl-9 w-[130px] h-9 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm"
                />
              </div>
           </div>

           {/* Bộ lọc chi nhánh */}
           <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-full md:w-[200px] h-[46px] border bg-white">
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

      {/* Grid thông số chi tiết */}
      <div className="grid gap-4 md:grid-cols-3">
        <DetailStatCard title="Lượt tiêm phòng" value={currentInfo.stats.tiêm} icon={<Syringe className="text-orange-500" />} color="orange" />
        <DetailStatCard title="Lượt khám bệnh" value={currentInfo.stats.khám} icon={<Stethoscope className="text-blue-500" />} color="blue" />
        <DetailStatCard title="Sản phẩm đã bán" value={currentInfo.stats.bán_sp} icon={<Package className="text-emerald-500" />} color="emerald" />
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* --- BIỂU ĐỒ CỘT (7 NGÀY GẦN NHẤT CỦA "ĐẾN NGÀY") --- */}
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle className="text-base flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                Xu hướng doanh thu
                <span className="text-sm font-normal text-muted-foreground block mt-1">
                   7 ngày gần nhất (tính đến {new Date(dateRange.to).toLocaleDateString('vi-VN')})
                </span>
              </div>
              <BadgeTrend value="Daily View" />
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    tickFormatter={(value) => `${value}tr`}
                />
                <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(v: number) => [`${v.toLocaleString()} triệu`, 'Doanh thu']}
                    labelFormatter={(label) => `Ngày: ${label}`}
                />
                <Bar 
                    dataKey="doanhThu" 
                    fill="#6366f1" 
                    radius={[6, 6, 0, 0]} 
                    barSize={40}
                    name="Doanh thu" 
                    activeBar={{ fill: '#4f46e5' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Biểu đồ tròn */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Tỷ trọng hoạt động</CardTitle>
            <CardDescription className="text-xs">
                Tính trên tổng khoảng thời gian đã chọn
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                    data={pieData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={70} 
                    outerRadius={90}
                    paddingAngle={5}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bảng chi tiết */}
        <Card className="md:col-span-12">
          <CardHeader>
            <CardTitle className="text-base">Bảng kê chi tiết chỉ số</CardTitle>
            <CardDescription>
                Thống kê từ ngày <span className="font-bold text-slate-700">{new Date(dateRange.from).toLocaleDateString('vi-VN')}</span> đến ngày <span className="font-bold text-slate-700">{new Date(dateRange.to).toLocaleDateString('vi-VN')}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead>Loại hình</TableHead>
                  <TableHead className="text-center">Số lượng</TableHead>
                  <TableHead className="text-right">Doanh thu ước tính</TableHead>
                  <TableHead className="text-right">Tỷ trọng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRowDetail label="Tiêm phòng (Mũi lẻ/Gói)" count={currentInfo.stats.tiêm} revenue={(estimatedTotalRevenue * 0.25).toLocaleString()} percent="25%" />
                <TableRowDetail label="Khám & Điều trị" count={currentInfo.stats.khám} revenue={(estimatedTotalRevenue * 0.55).toLocaleString()} percent="55%" />
                <TableRowDetail label="Bán lẻ sản phẩm & Thuốc" count={currentInfo.stats.bán_sp} revenue={(estimatedTotalRevenue * 0.20).toLocaleString()} percent="20%" />
                <TableRow className="bg-indigo-50/50 font-bold hover:bg-indigo-50/70 transition-colors">
                  <TableCell>Tổng cộng</TableCell>
                  <TableCell className="text-center">-</TableCell>
                  <TableCell className="text-right text-indigo-700 text-lg">{estimatedTotalRevenue.toLocaleString()}đ</TableCell>
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
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
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
    <TableRow className="hover:bg-slate-50/50">
      <TableCell className="font-medium text-slate-700">{label}</TableCell>
      <TableCell className="text-center font-bold text-slate-600">{count}</TableCell>
      <TableCell className="text-right font-medium">{revenue}đ</TableCell>
      <TableCell className="text-right text-muted-foreground">{percent}</TableCell>
    </TableRow>
  )
}

function BadgeTrend({ value }: { value: string }) {
  return (
    <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
      <TrendingUp className="w-3 h-3 mr-1" /> {value}
    </div>
  )
}