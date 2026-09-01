import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class SANPHAM extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MaSP: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true
    },
    TenSP: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    LoaiSP: {
      type: DataTypes.CHAR(1),
      allowNull: false
    },
    DonViTinh: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    Gia: {
      type: DataTypes.DECIMAL(18,0),
      allowNull: false
    },
    SLTonKho: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'SANPHAM',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_SANPHAM_MaSP",
        unique: true,
        fields: [
          { name: "MaSP" },
        ]
      },
    ]
  });
  }
}
