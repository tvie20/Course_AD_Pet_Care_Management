"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Clock, Search, Loader2 } from "lucide-react"
interface RawBranch {
  MaCN: string;
  TenCN: string;
  DiaChi: string;
  SDTCN: string;
  ThoiGianMoCua: string;
  ThoiGianDongCua: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  city: string;
}

export function BranchesSection() {
  const [search, setSearch] = useState<string>("")
  const [branches, setBranches] = useState<Branch[]>([]) 
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const formatTime = (isoString: string): string => {
    if (!isoString) return "??:??";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "00:00";
    }
  };

  const extractCity = (address: string): string => {
    if (!address) return "Việt Nam";
    const parts = address.split('-'); 
    return parts[parts.length - 1]?.trim() || "Việt Nam";
  };

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3055/api/branches');

        if (!response.ok) {
          throw new Error('Không thể kết nối tới server');
        }

        const data: any = await response.json(); 
        const rawData: RawBranch[] = Array.isArray(data) ? data : (data.metadata || []);

        const mappedData: Branch[] = rawData.map((item: RawBranch) => ({
            id: item.MaCN,
            name: item.TenCN,
            address: item.DiaChi,
            phone: item.SDTCN,
            hours: `${formatTime(item.ThoiGianMoCua)} - ${formatTime(item.ThoiGianDongCua)}`,
            city: extractCity(item.DiaChi) 
        }));

        setBranches(mappedData);
      } catch (err) {
        console.error("Lỗi fetch:", err);
        setError("Không thể tải danh sách chi nhánh.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(search.toLowerCase()) ||
      branch.city.toLowerCase().includes(search.toLowerCase()) ||
      branch.address.toLowerCase().includes(search.toLowerCase()),
  )

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="py-20 text-center text-red-500">{error}</div>;
  }

  return (
    <section id="branches" className="py-20 lg:py-28 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Hệ thống chi nhánh</h2>
          <p className="text-muted-foreground text-lg">Tìm chi nhánh PetCareX gần bạn nhất để được phục vụ tốt nhất</p>
        </div>
        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên chi nhánh hoặc thành phố..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {filteredBranches.map((branch) => (
            <Card key={branch.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold">{branch.name}</h3>
                  <Badge variant="secondary">{branch.city}</Badge>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{branch.hours}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredBranches.length === 0 && (
             <div className="col-span-2 text-center text-muted-foreground py-10">
                Không tìm thấy chi nhánh nào phù hợp.
             </div>
          )}
        </div>
      </div>
    </section>
  )
}