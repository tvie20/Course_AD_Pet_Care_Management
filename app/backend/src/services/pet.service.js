import { models, sequelize } from '../dbs/init.mssql.js'

class PetService {
    static getAllPetsByUserId = async (userId) => {
        return await models.THUCUNG.findAll({
            where: { MaKH: userId },
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*) 
                            FROM PHIEUDAT 
                            WHERE PHIEUDAT.MaTC = THUCUNG.MaTC 
                            AND PHIEUDAT.LoaiHinhDichVu LIKE N'%Khám%'
                        )`),
                        'SoLanKham'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*) 
                            FROM PHIEUDAT 
                            WHERE PHIEUDAT.MaTC = THUCUNG.MaTC 
                            AND (PHIEUDAT.LoaiHinhDichVu LIKE N'%Tiêm%' OR PHIEUDAT.LoaiHinhDichVu LIKE N'%Vắc xin%')
                        )`),
                        'SoLanTiem'
                    ]
                ]
            },
            raw: true
        })
    }

    static addPet = async ({ maKH, name, species, breed, gender, birthDate }) => {
        try {
            const [result] = await sequelize.query(`
                EXEC sp_ThemThuCung
                    @MaKH = :maKH,
                    @TenTC = :name,
                    @Loai = :species,
                    @Giong = :breed,
                    @GioiTinhTC = :gender,
                    @NgaySinhTC = :birthDate
            `, {
                replacements: { maKH, name, species, breed, gender, birthDate }
            });

            return { success: true };
        } catch (error) {
            const sqlError = error.original || error;
            if (sqlError.message?.includes('Mã khách hàng không tồn tại')) {
                throw new Error('Mã khách hàng không tồn tại.');
            }
            console.error("PetService addPet Error:", error);
            throw new Error("Lỗi hệ thống khi thêm thú cưng.");
        }
    }
}

export default PetService