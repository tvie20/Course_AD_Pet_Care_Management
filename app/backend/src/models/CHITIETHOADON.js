import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class CHITIETHOADON extends Model {
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
    STT: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    SoLuong: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    DonGia: {
      type: DataTypes.DECIMAL(18,0),
      allowNull: false
    },
    MaGD: {
      type: DataTypes.CHAR(25),
      allowNull: false,
      references: {
        model: 'LICHSUDICHVU',
        key: 'MaGD'
      }
    },
    MaSP: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      references: {
        model: 'SANPHAM',
        key: 'MaSP'
      }
    }
  }, {
    sequelize,
    tableName: 'CHITIETHOADON',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_CHITIETHOADON_MaHD_STT",
        unique: true,
        fields: [
          { name: "MaHD" },
          { name: "STT" },
        ]
      },
    ]
  });
  }
}
