import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class KHACHHANG extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MaKH: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true
    },
    HoTenKH: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    SDTKH: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: "UQ_KHACHHANG_STDKH"
    },
    EmailKH: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "UQ_KHACHHANG_EmailKH"
    },
    CCCD: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: "UQ_KHACHHANG_CCCD"
    },
    GioiTinhKH: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    NgaySinhKH: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    DiemLoyalty: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    CapTV: {
      type: DataTypes.STRING(10),
      allowNull: false,
      references: {
        model: 'CAPTHANHVIEN',
        key: 'CapTV'
      }
    },
    NgayDatCap: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'KHACHHANG',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_KHACHHANG_MaKH",
        unique: true,
        fields: [
          { name: "MaKH" },
        ]
      },
      {
        name: "UQ_KHACHHANG_CCCD",
        unique: true,
        fields: [
          { name: "CCCD" },
        ]
      },
      {
        name: "UQ_KHACHHANG_EmailKH",
        unique: true,
        fields: [
          { name: "EmailKH" },
        ]
      },
      {
        name: "UQ_KHACHHANG_STDKH",
        unique: true,
        fields: [
          { name: "SDTKH" },
        ]
      },
    ]
  });
  }
}
