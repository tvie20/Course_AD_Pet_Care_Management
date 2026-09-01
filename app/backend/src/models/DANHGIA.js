import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class DANHGIA extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MaHD: {
      type: DataTypes.CHAR(25),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'HOADON',
        key: 'MaHD'
      }
    },
    MaKH: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      references: {
        model: 'KHACHHANG',
        key: 'MaKH'
      }
    },
    DiemChatLuong: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ThaiDoNV: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    MucDoHaiLong: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    BinhLuan: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'DANHGIA',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_DANHGIA_MaHD",
        unique: true,
        fields: [
          { name: "MaHD" },
        ]
      },
    ]
  });
  }
}
