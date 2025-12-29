"use client"

import { useState } from "react"
import { 
  Search, Filter, Calendar as CalendarIcon, 
  Download, Eye, User, Activity, AlertCircle 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock Data cho Logs
const logsData = [
  { id: 1, actor: "Nguyễn Văn A (Q1)", action: "Cập nhật", object: "Khách hàng KH001", time: "10:30 30/01/2025", detail: "Sửa SĐT: 090... -> 091...", ip: "192.168.1.10", type: "update" },
  { id: 2, actor: "Trần Thị B (Q7)", action: "Tạo mới", object: "Hóa đơn #INV-2024", time: "10:15 30/01/2025", detail: "Tổng tiền: 1.500.000đ", ip: "192.168.2.15", type: "create" },
  { id: 3, actor: "Admin System", action: "Đăng nhập", object: "Hệ thống", time: "09:00 30/01/2025", detail: "Đăng nhập thành công", ip: "113.161.x.x", type: "login" },
  { id: 4, actor: "Lê Văn C (BThạnh)", action: "Xóa", object: "Lịch hẹn #APT-99", time: "16:45 29/01/2025", detail: "Lý do: Khách hủy", ip: "192.168.3.20", type: "delete" },
  { id: 5, actor: "Nguyễn Văn A (Q1)", action: "Cấu hình", object: "Giá dịch vụ Spa", time: "14:20 29/01/2025", detail: "Tăng giá Spa Chó <5kg", ip: "192.168.1.10", type: "update" },
]

export default function ActivityLogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  // Hàm render Badge màu sắc dựa trên loại hành động
  const getActionBadge = (type: string, label: string) => {
    switch(type) {
      case 'create': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Thêm mới</Badge>
      case 'update': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Cập nhật</Badge>
      case 'delete': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Xóa bỏ</Badge>
      case 'login': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200">Đăng nhập</Badge>
      default: return <Badge variant="outline">{label}</Badge>
    }
  }

  // Lọc dữ liệu
  const filteredLogs = logsData.filter(log => {
    const matchSearch = log.actor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        log.object.toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = typeFilter === "all" || log.type === typeFilter
    return matchSearch && matchType
  })

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nhật ký hoạt động</h1>
          <p className="text-sm text-muted-foreground">Theo dõi và truy vết các thao tác trên hệ thống.</p>
        </div>
        <Button variant="outline" className="bg-white">
          <Download className="w-4 h-4 mr-2" /> Xuất báo cáo
        </Button>
      </div>

      <Card>
        <CardHeader className="px-6 py-4 border-b">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
             <div className="relative w-full md:w-96">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Tìm theo người thực hiện, đối tượng..." 
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             
             <div className="flex gap-2 w-full md:w-auto">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                        <Activity className="w-4 h-4 mr-2 text-muted-foreground"/>
                        <SelectValue placeholder="Loại hành động" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả hành động</SelectItem>
                        <SelectItem value="create">Thêm mới</SelectItem>
                        <SelectItem value="update">Cập nhật</SelectItem>
                        <SelectItem value="delete">Xóa bỏ</SelectItem>
                        <SelectItem value="login">Đăng nhập</SelectItem>
                    </SelectContent>
                </Select>
                
                {/* Giả lập DatePicker */}
                <Button variant="outline" className="w-[180px] justify-start text-left font-normal text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" /> 30/01/2025
                </Button>
             </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="w-[180px]">Thời gian</TableHead>
                        <TableHead>Người thực hiện</TableHead>
                        <TableHead className="text-center">Hành động</TableHead>
                        <TableHead>Đối tượng thao tác</TableHead>
                        <TableHead>Chi tiết thay đổi</TableHead>
                        <TableHead className="text-right">IP Address</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell className="text-xs font-medium text-slate-500">
                                {log.time}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <User className="w-3 h-3 text-slate-400"/>
                                    <span className="text-sm font-medium text-slate-700">{log.actor}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                {getActionBadge(log.type, log.action)}
                            </TableCell>
                            <TableCell className="font-medium text-indigo-700">
                                {log.object}
                            </TableCell>
                            <TableCell className="text-sm text-slate-600 truncate max-w-[250px]" title={log.detail}>
                                {log.detail}
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground font-mono">
                                {log.ip}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="p-4 border-t text-center text-xs text-muted-foreground bg-slate-50 rounded-b-lg">
                <AlertCircle className="w-3 h-3 inline-block mr-1 mb-0.5"/>
                Nhật ký được lưu trữ trong vòng 90 ngày. Vui lòng xuất báo cáo để lưu trữ lâu dài.
            </div>
        </CardContent>
      </Card>
    </div>
  )
}