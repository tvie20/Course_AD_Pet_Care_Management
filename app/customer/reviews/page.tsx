"use client"

import { useState } from "react"
import { Star, MessageSquare, Store, Calendar, Filter, Receipt } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// --- CẤU HÌNH MAPPING DỮ LIỆU ---

// 1. Thái độ nhân viên (1-5 map sang Text)
const staffAttitudeMap: Record<number, string> = {
  1: "Rất tệ",
  2: "Tệ",
  3: "Bình thường",
  4: "Tốt",
  5: "Rất tốt"
}

// 2. Hài lòng tổng thể (1-5 map sang Text)
const overallSatisfactionMap: Record<number, string> = {
  1: "Rất không hài lòng",
  2: "Không hài lòng",
  3: "Bình thường",
  4: "Hài lòng",
  5: "Rất hài lòng"
}

// Hàm lấy màu sắc dựa trên điểm số (để Badge đẹp hơn)
const getRatingColor = (score: number) => {
  if (score >= 4) return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"; // Tốt/Rất tốt
  if (score === 3) return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100";   // Bình thường
  return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100";                                // Tệ/Rất tệ
}

// Dữ liệu giả lập
const reviews = [
  {
    id: 1,
    invoiceId: "HD-2025-001234",
    service: "Spa - Cắt tỉa lông toàn thân",
    pet: "Mochi",
    branch: "PetCareX Quận 1",
    date: "15/12/2025",
    ratings: {
        quality: 5,   // 5 Sao
        staff: 5,     // Rất tốt
        overall: 5    // Rất hài lòng
    },
    comment: "Bé Mochi rất thích, cắt đẹp và thơm. Nhân viên nhiệt tình, nhẹ nhàng với bé. Sẽ quay lại lần sau!",
    reply: {
      staffName: "CSKH PetCareX",
      content: "Dạ PetCareX cảm ơn bạn đã tin tưởng ạ! Hẹn gặp lại bé Mochi vào lần làm đẹp tới nhé 🥰",
      date: "16/12/2025"
    }
  },
  {
    id: 2,
    invoiceId: "HD-2025-001198",
    service: "Tiêm phòng Vaccine 7 bệnh",
    pet: "Luna",
    branch: "PetCareX Quận 1",
    date: "10/11/2025",
    ratings: {
        quality: 5,   // 5 Sao
        staff: 3,     // Bình thường
        overall: 4    // Hài lòng
    },
    comment: "Bác sĩ tiêm nhanh, bé không khóc. Tuy nhiên lễ tân làm thủ tục hơi lâu, thái độ bình thường không niềm nở lắm.",
    images: [],
    reply: {
      staffName: "Quản lý Chi nhánh",
      content: "Chào bạn, PetCareX rất xin lỗi và sẽ chấn chỉnh lại bộ phận lễ tân ngay ạ. Cảm ơn góp ý chân thành của bạn.",
      date: "10/11/2025"
    }
  },
  {
    id: 3,
    invoiceId: "HD-2025-001156",
    service: "Khám da liễu",
    pet: "Mochi",
    branch: "PetCareX Quận 7",
    date: "01/10/2025",
    ratings: {
        quality: 4,   // 4 Sao
        staff: 5,     // Rất tốt
        overall: 4    // Hài lòng
    },
    comment: "Bác sĩ chẩn đoán đúng bệnh. Mọi thứ ổn.",
    images: [],
    reply: null 
  }
]

export default function ReviewsPage() {
  const [filter, setFilter] = useState("all")

  // Logic lọc vẫn dựa trên value số (overall) để dễ xử lý
  const filteredReviews = reviews.filter(review => {
    if (filter === "all") return true;
    if (filter === "high") return review.ratings.overall >= 4; // Hài lòng & Rất hài lòng
    if (filter === "medium") return review.ratings.overall === 3; // Bình thường
    if (filter === "low") return review.ratings.overall <= 2; // Không hài lòng
    return true;
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Lịch sử đánh giá</h1>
          <p className="text-muted-foreground">Chi tiết trải nghiệm dịch vụ của bạn tại PetCareX</p>
        </div>
        
        <div className="w-full sm:w-56">
          <Select defaultValue="all" onValueChange={setFilter}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Lọc theo mức độ hài lòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="high">Hài lòng / Rất hài lòng</SelectItem>
              <SelectItem value="medium">Bình thường</SelectItem>
              <SelectItem value="low">Không hài lòng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}

// Helper: Hiển thị dòng sao (Cho Chất lượng dịch vụ)
const StarRatingRow = ({ label, score }: { label: string, score: number }) => (
  <div className="flex items-center justify-between text-sm gap-4">
    <span className="text-muted-foreground">{label}</span>
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < score ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} 
        />
      ))}
    </div>
  </div>
)

// Helper: Hiển thị dòng Text Badge (Cho Thái độ & Tổng thể)
const TextRatingRow = ({ label, text, score }: { label: string, text: string, score: number }) => (
  <div className="flex items-center justify-between text-sm gap-4">
    <span className="text-muted-foreground">{label}</span>
    <Badge variant="outline" className={cn("font-medium border px-2 py-0.5", getRatingColor(score))}>
      {text}
    </Badge>
  </div>
)

function ReviewCard({ review }: { review: any }) {
  // Lấy text hiển thị từ map
  const staffAttitudeText = staffAttitudeMap[review.ratings.staff];
  const overallText = overallSatisfactionMap[review.ratings.overall];

  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardHeader className="bg-muted/20 p-4 border-b">
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-base flex items-center gap-2">
                {review.service}
                <Badge variant="secondary" className="font-normal text-xs bg-white border">
                    {review.pet}
                </Badge>
                </h3>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-md">
                    <Receipt className="w-3.5 h-3.5" /> 
                    <span>{review.invoiceId}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5" /> 
                    <span className="truncate max-w-[150px]">{review.branch}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> 
                    <span>{review.date}</span>
                </div>
            </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
            
            {/* Cột trái: Bảng điểm chi tiết */}
            <div className="md:w-80 shrink-0 space-y-3 bg-slate-50 p-5 rounded-lg border h-fit">
                <h4 className="font-semibold text-sm mb-4 border-b pb-2">Chi tiết đánh giá</h4>
                
                {/* 1. Chất lượng dịch vụ (Sao) */}
                <StarRatingRow label="Chất lượng DV" score={review.ratings.quality} />
                
                {/* 2. Thái độ nhân viên (Text) */}
                <TextRatingRow 
                  label="Thái độ nhân viên" 
                  text={staffAttitudeText} 
                  score={review.ratings.staff} 
                />
                
                {/* 3. Hài lòng tổng thể (Text) */}
                <div className="pt-2 mt-2 border-t">
                  <TextRatingRow 
                    label="Hài lòng tổng thể" 
                    text={overallText} 
                    score={review.ratings.overall} 
                  />
                </div>
            </div>

            {/* Cột phải: Nội dung bình luận & Phản hồi */}
            <div className="flex-1 space-y-5">
                <div>
                    <h4 className="font-semibold text-sm mb-2 text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Bình luận của bạn:
                    </h4>
                    <p className="text-foreground leading-relaxed bg-white p-3 border rounded-md text-sm">
                        {review.comment}
                    </p>
                </div>

                {review.reply && (
                    <div className="pl-4 border-l-4 border-primary/20 bg-blue-50/50 p-4 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-primary">PetCareX Support</span>
                            <span className="text-xs text-muted-foreground">• {review.reply.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {review.reply.content}
                        </p>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/10">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <h3 className="font-semibold text-lg">Chưa có đánh giá nào</h3>
      <p className="text-muted-foreground max-w-sm mt-2">
        Bạn chưa có lịch sử đánh giá nào.
      </p>
    </div>
  )
}