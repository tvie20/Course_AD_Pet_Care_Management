import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class TAIKHOANHOIVIEN extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MaKH: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'KHACHHANG',
        key: 'MaKH'
      }
    },
    TenDangNhap: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "UQ_TAIKHOANHOIVIEN_TenDangNhap"
    },
    MatKhau: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    NgayDangKy: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'TAIKHOANHOIVIEN',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_TAIKHOANHOIVIEN_MaKH",
        unique: true,
        fields: [
          { name: "MaKH" },
        ]
      },
      {
        name: "UQ_TAIKHOANHOIVIEN_TenDangNhap",
        unique: true,
        fields: [
          { name: "TenDangNhap" },
        ]
      },
    ]
  });
  }
}
