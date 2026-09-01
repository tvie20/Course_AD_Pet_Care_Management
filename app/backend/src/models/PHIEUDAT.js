import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class PHIEUDAT extends Model {
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
    MaTC: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'THUCUNG',
        key: 'MaTC'
      }
    },
    ThoiGianDat: {
      type: DataTypes.DATE,
      allowNull: false,
      primaryKey: true
    },
    ThoiGianHen: {
      type: DataTypes.DATE,
      allowNull: false
    },
    LoaiHinhDichVu: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    TrangThaiPD: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "(NĐã đặt"
    },
    STT: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    MaCN: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      references: {
        model: 'CHINHANH',
        key: 'MaCN'
      }
    }
  }, {
    sequelize,
    tableName: 'PHIEUDAT',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_PHIEUDAT_MaKH_MaTC_ThoiGianDat",
        unique: true,
        fields: [
          { name: "MaKH" },
          { name: "MaTC" },
          { name: "ThoiGianDat" },
        ]
      },
    ]
  });
  }
}
