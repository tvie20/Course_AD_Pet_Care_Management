import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class NHANVIEN extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MaNV: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true
    },
    HoTenNV: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    NgaySinhNV: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    GioiTinhNV: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    LoaiNV: {
      type: DataTypes.CHAR(1),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'NHANVIEN',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_NHANVIEN_MaNV",
        unique: true,
        fields: [
          { name: "MaNV" },
        ]
      },
    ]
  });
  }
}
