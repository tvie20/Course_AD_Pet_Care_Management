"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts'
import { Download, Search, Filter, Loader2 } from "lucide-react"

export default function ProductRevenuePage() {
  const [products, setProducts] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const [selectedBranch, setSelectedBranch] = useState("")
  const [branchList, setBranchList] = useState<any[]>([])

  const today = new Date().toISOString().split('T')[0]
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  
  const [dateRange, setDateRange] = useState({
    from: lastMonth.toISOString().split('T')[0],
    to: today
  })

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

  useEffect(() => {
    const fetchBranches = async () => {
        const headers = getAuthHeader()
        if (!headers) return

        try {
            const res = await fetch("http://localhost:3055/api/branches", { headers })
            if (res.ok) {
                const result = await res.json()
                const list = result || []
                setBranchList(list)
                
                if (list.length > 0 && !selectedBranch) {
                    setSelectedBranch(list[0].MaCN)
                }
            }
        } catch (error) {
            console.error(error)
        }
    }
    fetchBranches()
  }, [])

  const fetchData = async () => {
    if (!selectedBranch) return

    setLoading(true)
    const headers = getAuthHeader()
    if (!headers) return

    try {
        const query = new URLSearchParams({
            branch: selectedBranch,
            from: dateRange.from,
            to: dateRange.to
        })

        const res = await fetch(`http://localhost:3055/api/admin/product-stats?${query.toString()}`, { headers })
        if (res.ok) {
            const response = await res.json()
            setProducts(response.metadata.products)
            setCategoryData(response.metadata.categories)
        }
    } catch (error) {
        console.error("Lỗi tải dữ liệu sản phẩm:", error)
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedBranch, dateRange])

  const exportToCSV = () => {
    const headers = ["Mã SP,Tên Sản phẩm,Danh mục,Đơn giá,Đã bán,Doanh thu\n"]
    const rows = products.map(p => 
      `${p.id},${p.name},${p.category},${p.price},${p.sold},${p.revenue}`
    ).join("\n")
    
    const blob = new Blob(["\uFEFF" + headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `Bao_cao_doanh_thu_san_pham_${new Date().toLocaleDateString()}.csv`)
    link.click()
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
        if (value > dateRange.to) setDateRange({ from: value, to: value })
        else setDateRange({ ...dateRange, from: value })
    } else {
        if (value < dateRange.from) setDateRange({ from: value, to: value })
        else setDateRange({ ...dateRange, to: value })
    }
  }

  if (loading && products.length === 0) {
      return <div className="flex justify-center py-20 min-h-screen bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      
      <div className="flex justify-end">
        <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700 h-[40px] shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Xuất CSV
        </Button>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Doanh số Sản phẩm</h1>
          <p className="text-sm text-muted-foreground">Theo dõi và xuất báo cáo bán lẻ thuốc & hàng hóa</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto items-center xl:justify-end">
           <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-md border w-full md:w-auto">
              <div className="relative group flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Từ</span>
                <Input 
                  type="date" 
                  value={dateRange.from}
                  max={dateRange.to}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                  className="pl-8 w-full md:w-[160px] h-9 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm"
                />
              </div>
              <div className="h-6 w-px bg-slate-300 hidden md:block"></div>
              <div className="relative group flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Đến</span>
                <Input 
                  type="date" 
                  value={dateRange.to}
                  min={dateRange.from} 
                  onChange={(e) => handleDateChange('to', e.target.value)}
                  className="pl-9 w-full md:w-[160px] h-9 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm"
                />
              </div>
           </div>

           <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-full md:w-[200px] h-[70px] border bg-white">
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

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle className="text-base">Doanh thu theo nhóm hàng</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {categoryData.length > 0 ? (
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(value) => `${value/1000000}M`} />
                    <Tooltip formatter={(value: number) => value.toLocaleString() + "đ"} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Doanh thu">
                      {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
              ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">Chưa có dữ liệu</div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Tỷ trọng danh mục</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {categoryData.length > 0 ? (
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                      {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => value.toLocaleString() + "đ"} />
                  </PieChart>
              ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">Chưa có dữ liệu</div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-12">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg">Chi tiết doanh thu từng sản phẩm</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm mã hoặc tên..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[100px]">Mã SP</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-center">Đã bán</TableHead>
                  <TableHead className="text-right">Tổng doanh thu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell className="font-mono text-xs">{product.id}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            {product.category}
                        </span>
                        </TableCell>
                        <TableCell className="text-right">{product.price.toLocaleString()}đ</TableCell>
                        <TableCell className="text-center font-bold text-blue-600">{product.sold}</TableCell>
                        <TableCell className="text-right font-bold text-emerald-600">{product.revenue.toLocaleString()}đ</TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Không có dữ liệu phù hợp</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}