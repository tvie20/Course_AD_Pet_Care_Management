"use client"

import { useState, useEffect } from "react"
import { Star, MessageSquare, Store, Calendar, Filter, Receipt, Loader2, PackageSearch } from "lucide-react"

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

const staffAttitudeMap: Record<number, string> = {
  1: "Rất tệ", 2: "Tệ", 3: "Bình thường", 4: "Tốt", 5: "Rất tốt"
}

const overallSatisfactionMap: Record<number, string> = {
  1: "Rất không hài lòng", 2: "Không hài lòng", 3: "Bình thường", 4: "Hài lòng", 5: "Rất hài lòng"
}

const getRatingColor = (score: number) => {
  if (score >= 4) return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
  if (score === 3) return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100";
  return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100";
}

interface ReviewUI {
    id: number;
    invoiceId: string;
    service: string;
    pet: string;
    branch: string;
    date: string;
    ratings: {
        quality: number;
        staff: number;
        overall: number;
    };
    comment: string;
    reply?: {
        staffName: string;
        content: string;
        date: string;
    } | null;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewUI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem("accessToken")
            const userStr = localStorage.getItem("user")
            
            if (!token || !userStr) return;
            const user = JSON.parse(userStr)

            const res = await fetch("http://localhost:3055/api/reviews", {
                headers: {
                    "Content-Type": "application/json",
                    "authorization": token,
                    "x-client-id": user.MaKH
                }
            })

            if (res.ok) {
                const data = await res.json()
                setReviews(data)
            }
        } catch (error) {
            console.error("Lỗi tải đánh giá:", error)
        } finally {
            setIsLoading(false)
        }
    }
    fetchReviews()
  }, [])

  const filteredReviews = reviews.filter(review => {
    if (filter === "all") return true;
    if (filter === "high") return review.ratings.overall >= 4;
    if (filter === "medium") return review.ratings.overall === 3;
    if (filter === "low") return review.ratings.overall <= 2;
    return true;
  })

  if (isLoading) {
      return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
  }

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

const TextRatingRow = ({ label, text, score }: { label: string, text: string, score: number }) => (
  <div className="flex items-center justify-between text-sm gap-4">
    <span className="text-muted-foreground">{label}</span>
    <Badge variant="outline" className={cn("font-medium border px-2 py-0.5", getRatingColor(score))}>
      {text}
    </Badge>
  </div>
)

function ReviewCard({ review }: { review: ReviewUI }) {
  const staffAttitudeText = staffAttitudeMap[review.ratings.staff] || "Bình thường";
  const overallText = overallSatisfactionMap[review.ratings.overall] || "Bình thường";

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
            
            <div className="md:w-80 shrink-0 space-y-3 bg-slate-50 p-5 rounded-lg border h-fit">
                <h4 className="font-semibold text-sm mb-4 border-b pb-2">Chi tiết đánh giá</h4>
                
                <StarRatingRow label="Chất lượng DV" score={review.ratings.quality} />
                
                <TextRatingRow 
                  label="Thái độ nhân viên" 
                  text={staffAttitudeText} 
                  score={review.ratings.staff} 
                />
                
                <div className="pt-2 mt-2 border-t">
                  <TextRatingRow 
                    label="Hài lòng tổng thể" 
                    text={overallText} 
                    score={review.ratings.overall} 
                  />
                </div>
            </div>

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
        <PackageSearch className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <h3 className="font-semibold text-lg">Chưa có đánh giá nào</h3>
      <p className="text-muted-foreground max-w-sm mt-2">
        Bạn chưa thực hiện đánh giá cho bất kỳ hóa đơn nào.
      </p>
    </div>
  )
}