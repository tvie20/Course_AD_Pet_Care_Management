import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class THUCUNG extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MaTC: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true
    },
    TenTC: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Loai: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    Giong: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    NgaySinhTC: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    GioiTinhTC: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    TinhTrangSucKhoe: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    MaKH: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      references: {
        model: 'KHACHHANG',
        key: 'MaKH'
      }
    }
  }, {
    sequelize,
    tableName: 'THUCUNG',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_THUCUNG_MaTC",
        unique: true,
        fields: [
          { name: "MaTC" },
        ]
      },
    ]
  });
  }
}
