import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class CHITIETTOATHUOC extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MaTT: {
      type: DataTypes.CHAR(25),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'TOATHUOC',
        key: 'MaTT'
      }
    },
    TMaSP: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'THUOC',
        key: 'TMaSP'
      }
    },
    HuongDan: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    SoLuongThuoc: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    LieuDung: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'CHITIETTOATHUOC',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_CHITIETTOATHUOC_MaTT_TMaSP",
        unique: true,
        fields: [
          { name: "MaTT" },
          { name: "TMaSP" },
        ]
      },
    ]
  });
  }
}
