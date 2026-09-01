"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2, Filter } from "lucide-react"

export default function DoctorRevenuePage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedBranch, setSelectedBranch] = useState("") 
  const [branchList, setBranchList] = useState<any[]>([])
  
  const today = new Date().toISOString().split('T')[0]
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
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

        const res = await fetch(`http://localhost:3055/api/admin/doctor-stats?${query.toString()}`, { headers })
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

  if (loading && data.length === 0) {
      return <div className="flex justify-center py-20 min-h-screen bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Hiệu suất & Doanh thu Bác sĩ</h1>
            <p className="text-sm text-muted-foreground">Thống kê lượt khám và doanh thu dịch vụ theo bác sĩ</p>
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
      
      {data.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                <CardHeader><CardTitle>Lượt khám theo bác sĩ</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={10} interval={0} tick={{width: 100}} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="luotKham" fill="#6366f1" radius={[4, 4, 0, 0]} name="Lượt khám" />
                    </BarChart>
                    </ResponsiveContainer>
                </CardContent>
                </Card>

                <Card>
                <CardHeader><CardTitle>Phân bổ doanh thu (Triệu đồng)</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                            data={data} 
                            dataKey="doanhThu" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={60} 
                            outerRadius={90}
                            paddingAngle={5}
                        >
                        {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(val: number) => `${val.toLocaleString()} Tr`} />
                    </PieChart>
                    </ResponsiveContainer>
                </CardContent>          
                </Card>

                <Card className="md:col-span-2">
                <CardHeader><CardTitle>Bảng chi tiết hiệu suất</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                        <TableHead>Tên Bác sĩ</TableHead>
                        <TableHead className="text-center">Số lượt khám</TableHead>
                        <TableHead className="text-right">Doanh thu mang lại</TableHead>
                        <TableHead className="text-right">Trung bình/Ca</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((doc) => (
                        <TableRow key={doc.name}>
                            <TableCell className="font-medium text-slate-700">{doc.name}</TableCell>
                            <TableCell className="text-center font-bold">{doc.luotKham}</TableCell>
                            <TableCell className="text-right font-bold text-emerald-600">
                                {doc.doanhThuRaw.toLocaleString()}đ
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                                {doc.luotKham > 0 
                                    ? (doc.doanhThuRaw / doc.luotKham).toLocaleString() 
                                    : 0}đ
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
                </Card>
            </div>
          </>
      ) : (
          <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground border rounded-xl bg-white border-dashed">
              <Filter className="w-10 h-10 mb-2 opacity-20" />
              <p>Không có dữ liệu trong khoảng thời gian này</p>
          </div>
      )}
    </div>
  )
}