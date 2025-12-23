"use client"
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const doctorDetails = [
  { name: 'BS. Nguyễn Văn A', luotKham: 156, doanhThu: 85, color: '#6366f1' },
  { name: 'BS. Trần Thị B', luotKham: 132, doanhThu: 72, color: '#8b5cf6' },
  { name: 'BS. Lê Văn C', luotKham: 98, doanhThu: 45, color: '#a855f7' },
  { name: 'BS. Phạm Minh D', luotKham: 110, doanhThu: 58, color: '#d946ef' },
]

export default function DoctorRevenuePage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Hiệu suất & Doanh thu Bác sĩ</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Lượt khám theo bác sĩ</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doctorDetails}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="luotKham" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Phân bổ doanh thu bác sĩ</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={doctorDetails} dataKey="doanhThu" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90}>
                  {doctorDetails.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>          
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Bảng chi tiết hiệu suất</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên Bác sĩ</TableHead>
                  <TableHead className="text-center">Số lượt khám</TableHead>
                  <TableHead className="text-right">Doanh thu mang lại</TableHead>
                  <TableHead className="text-right">Trung bình/Ca</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctorDetails.map((doc) => (
                  <TableRow key={doc.name}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell className="text-center">{doc.luotKham}</TableCell>
                    <TableCell className="text-right font-bold">{doc.doanhThu}.000.000đ</TableCell>
                    <TableCell className="text-right text-muted-foreground">{(doc.doanhThu/doc.luotKham * 1000).toFixed(0)}k</TableCell>
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