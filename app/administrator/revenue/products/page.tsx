"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts'
import { Download, Search, Package, TrendingUp, Filter } from "lucide-react"

// Dữ liệu mẫu sản phẩm (Giả lập truy vấn từ bảng SANPHAM, THUOC, CHITIETHOADON)
const productDetails = [
  { id: "SP001", name: "Hạt Royal Canin Adult", category: "Thức ăn", price: 250000, sold: 120, revenue: 30000000 },
  { id: "SP002", name: "Thuốc trị ve Nexgard", category: "Thuốc", price: 150000, sold: 85, revenue: 12750000 },
  { id: "SP003", name: "Sữa tắm Bioline", category: "Vệ sinh", price: 110000, sold: 45, revenue: 4950000 },
  { id: "SP004", name: "Vòng cổ chống rận", category: "Phụ kiện", price: 85000, sold: 68, revenue: 5780000 },
  { id: "SP005", name: "Pate Whiskas (Thùng)", category: "Thức ăn", price: 420000, sold: 30, revenue: 12600000 },
]

const categoryData = [
  { name: 'Thức ăn', value: 42600000, color: '#f59e0b' },
  { name: 'Thuốc', value: 12750000, color: '#ef4444' },
  { name: 'Vệ sinh', value: 4950000, color: '#3b82f6' },
  { name: 'Phụ kiện', value: 5780000, color: '#10b981' },
]

export default function ProductRevenuePage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Hàm xuất file CSV
  const exportToCSV = () => {
    const headers = ["Mã SP,Tên Sản phẩm,Danh mục,Đơn giá,Đã bán,Doanh thu\n"]
    const rows = productDetails.map(p => 
      `${p.id},${p.name},${p.category},${p.price},${p.sold},${p.revenue}`
    ).join("\n")
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `Bao_cao_doanh_thu_san_pham_${new Date().toLocaleDateString()}.csv`)
    link.click()
  }

  const filteredProducts = productDetails.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Doanh số Sản phẩm</h1>
          <p className="text-sm text-muted-foreground">Theo dõi và xuất báo cáo bán lẻ thuốc & hàng hóa</p>
        </div>
        <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" /> Xuất file CSV
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Biểu đồ doanh thu theo nhóm */}
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle className="text-base">Doanh thu theo nhóm hàng</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(value) => `${value/1000000}M`} />
                <Tooltip formatter={(value: number) => value.toLocaleString() + "đ"} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart phân bổ */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Tỷ trọng danh mục</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                  {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString() + "đ"} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bảng chi tiết sản phẩm */}
        <Card className="md:col-span-12">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg">Chi tiết doanh thu từng sản phẩm</CardTitle>
              <CardDescription>Danh sách sản phẩm đã bán trong kỳ</CardDescription>
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
                {filteredProducts.map((product) => (
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
                    <TableCell className="text-right font-bold">{product.revenue.toLocaleString()}đ</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}