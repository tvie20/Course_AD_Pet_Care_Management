"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell 
} from 'recharts'
import { MapPin, TrendingUp, Syringe, Stethoscope, Package, Loader2 } from "lucide-react"

const COLORS = ['#f59e0b', '#0ea5e9', '#10b981'];

export default function BranchRevenuePage() {
  const [selectedBranch, setSelectedBranch] = useState("CN00000001") // Default ID
  
  // THAY ĐỔI: Chuyển từ hardcode sang state để lưu dữ liệu từ API
  const [branchList, setBranchList] = useState<any[]>([]) 
  
  const today = new Date().toISOString().split('T')[0]
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const [dateRange, setDateRange] = useState({
    from: lastMonth.toISOString().split('T')[0],
    to: today
  })

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Helper auth header (Giữ nguyên)
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

  // THAY ĐỔI: Thêm useEffect này để lấy danh sách chi nhánh thật
  useEffect(() => {
    const fetchBranches = async () => {
        try {
            const headers = getAuthHeader();
            if (!headers) return;

            const res = await fetch("http://localhost:3055/api/branches", { headers });
            if (res.ok) {
                const result = await res.json();
                const branches = result || [];
                setBranchList(branches);

                if (branches.length > 0 && !selectedBranch) setSelectedBranch(branches[0].MaCN);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách chi nhánh:", error);
        }
    }
    fetchBranches();
  }, []);

  const fetchData = async () => {
    setLoading(true)
    const headers = getAuthHeader()
    if (!headers) return

    try {
        const query = new URLSearchParams({
            branch: selectedBranch,
            from: dateRange.from,
            to: dateRange.to
        })

        const res = await fetch(`http://localhost:3055/api/admin/branch-revenue?${query.toString()}`, { headers })
        if (res.ok) {
            const response = await res.json()
            setData(response.metadata)
        }
    } catch (error) {
        console.error(error)
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
      fetchData()
  }, [selectedBranch, dateRange])

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      if (value > dateRange.to) setDateRange({ from: value, to: value })
      else setDateRange({ ...dateRange, from: value })
    } else {
      if (value < dateRange.from) setDateRange({ from: value, to: value })
      else setDateRange({ ...dateRange, to: value })
    }
  }

  if (loading && !data) {
      return <div className="flex justify-center py-20 min-h-screen bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
  }

  const pieData = data ? [
    { name: 'Tiêm phòng', value: data.stats.tiem },
    { name: 'Khám bệnh', value: data.stats.kham },
    { name: 'Sản phẩm', value: data.stats.ban_sp },
  ] : []

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Doanh thu theo Chi nhánh</h1>
          <p className="text-sm text-muted-foreground italic flex items-center mt-1">
            <MapPin className="w-3 h-3 mr-1" /> Đang xem: <span className="font-bold ml-1 text-indigo-600">{data?.branchName || "Đang tải..."}</span>
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
           <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-md border">
              <div className="relative group">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Từ</span>
                <Input 
                  type="date" 
                  value={dateRange.from}
                  max={dateRange.to}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                  className="pl-8 w-[160px] h-9 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm"
                />
              </div>
              <div className="h-6 w-px bg-slate-300"></div>
              <div className="relative group">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Đến</span>
                <Input 
                  type="date" 
                  value={dateRange.to}
                  min={dateRange.from} 
                  onChange={(e) => handleDateChange('to', e.target.value)}
                  className="pl-9 w-[160px] h-9 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm"
                />
              </div>
           </div>

           {/* THAY ĐỔI: Dropdown list lấy dữ liệu từ state branchList */}
           <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-full md:w-[200px] h-[46px] border bg-white">
                <SelectValue placeholder="Chọn chi nhánh" />
              </SelectTrigger>
              <SelectContent>
                {branchList.map(b => (
                    <SelectItem key={b.MaCN} value={b.MaCN}>{b.TenCN}</SelectItem>
                ))}
              </SelectContent>
           </Select>
        </div>
      </div>

      {/* Grid thông số chi tiết */}
      <div className="grid gap-4 md:grid-cols-3">
        <DetailStatCard title="Lượt tiêm phòng" value={data?.stats.tiem || 0} icon={<Syringe className="text-orange-500" />} color="orange" />
        <DetailStatCard title="Lượt khám bệnh" value={data?.stats.kham || 0} icon={<Stethoscope className="text-blue-500" />} color="blue" />
        <DetailStatCard title="Sản phẩm đã bán" value={data?.stats.ban_sp || 0} icon={<Package className="text-emerald-500" />} color="emerald" />
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* --- BIỂU ĐỒ CỘT --- */}
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle className="text-base flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                Xu hướng doanh thu
                <span className="text-sm font-normal text-muted-foreground block mt-1">
                   {/* Format date range display */}
                   {new Date(dateRange.from).toLocaleDateString('vi-VN')} - {new Date(dateRange.to).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <BadgeTrend value="Daily View" />
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              {data?.chartData.length > 0 ? (
                  <BarChart data={data.chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
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
              ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">Chưa có dữ liệu doanh thu</div>
              )}
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
                {/* Lưu ý: Doanh thu từng loại hình trong bảng HOADON hiện tại không tách biệt rõ ràng cột nào là dịch vụ, cột nào là thuốc nếu chung 1 hóa đơn.
                    Nên ở đây ta dùng tỷ lệ ước tính dựa trên tổng doanh thu (TotalRevenue) và tỷ lệ số lượng (Pie Data).
                    Để chính xác 100%, cần query sum CHITIETHOADON join DICHVU/SANPHAM.
                */}
                <TableRowDetail 
                    label="Tiêm phòng (Mũi lẻ/Gói)" 
                    count={data?.stats.tiem} 
                    revenue={(data?.totalRevenue * 0.25).toLocaleString()} // Giả định tỷ trọng 25%
                    percent="25%" 
                />
                <TableRowDetail 
                    label="Khám & Điều trị" 
                    count={data?.stats.kham} 
                    revenue={(data?.totalRevenue * 0.55).toLocaleString()} // Giả định 55%
                    percent="55%" 
                />
                <TableRowDetail 
                    label="Bán lẻ sản phẩm & Thuốc" 
                    count={data?.stats.ban_sp} 
                    revenue={(data?.totalRevenue * 0.20).toLocaleString()} // Giả định 20%
                    percent="20%" 
                />
                <TableRow className="bg-indigo-50/50 font-bold hover:bg-indigo-50/70 transition-colors">
                  <TableCell>Tổng cộng</TableCell>
                  <TableCell className="text-center">-</TableCell>
                  <TableCell className="text-right text-indigo-700 text-lg">{data?.totalRevenue.toLocaleString()}đ</TableCell>
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