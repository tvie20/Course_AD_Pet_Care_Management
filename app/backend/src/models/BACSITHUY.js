import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class BACSITHUY extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    BMaNV: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'NHANVIEN',
        key: 'MaNV'
      }
    },
    ChungChiHanhNghe: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ChuyenKhoa: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    SoNamKinhNghiem: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'BACSITHUY',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_BACSITHUY_BMaNV",
        unique: true,
        fields: [
          { name: "BMaNV" },
        ]
      },
    ]
  });
  }
}
