import { sequelize } from '../dbs/init.mssql.js'

const SCORE_MAP = {
    'Rất tệ': 1, 'Rất không hài lòng': 1,
    'Tệ': 2, 'Không hài lòng': 2,
    'Bình thường': 3,
    'Tốt': 4, 'Hài lòng': 4,
    'Rất tốt': 5, 'Rất hài lòng': 5
};

class ReviewService {
    static getReviewsByUserId = async (userId) => {
        try {
            const [reviews] = await sequelize.query(`
                SELECT 
                    DG.MaHD as invoiceId,
                    DG.DiemChatLuong as qualityScore,
                    DG.ThaiDoNV as staffText,
                    DG.MucDoHaiLong as overallText,
                    DG.BinhLuan as comment,
                    HD.ThoiGianLapHD as date,
                    TC.TenTC as pet,
                    (
                        SELECT TOP 1 SP.TenSP 
                        FROM CHITIETHOADON CTHD 
                        JOIN SANPHAM SP ON CTHD.MaSP = SP.MaSP 
                        WHERE CTHD.MaHD = DG.MaHD
                    ) as serviceName
                FROM DANHGIA DG
                JOIN HOADON HD ON DG.MaHD = HD.MaHD
                JOIN THUCUNG TC ON HD.MaTC = TC.MaTC
                WHERE DG.MaKH = :uid
                ORDER BY HD.ThoiGianLapHD DESC
            `, { replacements: { uid: userId } });

            const formattedReviews = reviews.map((r, index) => {
                return {
                    id: index + 1, 
                    invoiceId: r.invoiceId,
                    service: r.serviceName || "Dịch vụ thú cưng",
                    pet: r.pet,
                    branch: "PetCareX Quận 1", 
                    date: new Date(r.date).toLocaleDateString('en-GB'),
                    ratings: {
                        quality: r.qualityScore || 5,
                        staff: SCORE_MAP[r.staffText] || 3, 
                        overall: SCORE_MAP[r.overallText] || 3 
                    },
                    comment: r.comment,
                    reply: null
                };
            });

            return formattedReviews;

        } catch (error) {
            console.error("Get Reviews Error:", error);
            return [];
        }
    }
}

export default ReviewService