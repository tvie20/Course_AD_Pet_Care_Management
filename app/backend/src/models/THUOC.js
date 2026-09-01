import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class THUOC extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    TMaSP: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'SANPHAM',
        key: 'MaSP'
      }
    },
    LoaiThuoc: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    NSX: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    HSD: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    NhaSX: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'THUOC',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_THUOC_TMaSP",
        unique: true,
        fields: [
          { name: "TMaSP" },
        ]
      },
    ]
  });
  }
}
