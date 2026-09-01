import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class VACXIN extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    VMaSP: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'SANPHAM',
        key: 'MaSP'
      }
    },
    LoaiVacXin: {
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
    tableName: 'VACXIN',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_VACXIN_VMaSP",
        unique: true,
        fields: [
          { name: "VMaSP" },
        ]
      },
    ]
  });
  }
}
