import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class THONGTINTHANHTOAN extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MaKH: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      references: {
        model: 'KHACHHANG',
        key: 'MaKH'
      }
    },
    MaHD: {
      type: DataTypes.CHAR(25),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'HOADON',
        key: 'MaHD'
      }
    },
    PhuongThucTT: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ThoiGianTT: {
      type: DataTypes.DATE,
      allowNull: false
    },
    TrangThaiTT: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'THONGTINTHANHTOAN',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_THONGTINTHANHTOAN_MaHD",
        unique: true,
        fields: [
          { name: "MaHD" },
        ]
      },
    ]
  });
  }
}
