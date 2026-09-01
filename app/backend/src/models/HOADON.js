import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class HOADON extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MaHD: {
      type: DataTypes.CHAR(25),
      allowNull: false,
      primaryKey: true
    },
    ThoiGianLapHD: {
      type: DataTypes.DATE,
      allowNull: false
    },
    KhuyenMai: {
      type: DataTypes.DECIMAL(18,0),
      allowNull: false
    },
    TongTien: {
      type: DataTypes.DECIMAL(18,0),
      allowNull: false
    },
    MaTC: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      references: {
        model: 'THUCUNG',
        key: 'MaTC'
      }
    },
    HMaNV: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      references: {
        model: 'NHANVIENBANHANG',
        key: 'HMaNV'
      }
    }
  }, {
    sequelize,
    tableName: 'HOADON',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_HOADON_MaHD",
        unique: true,
        fields: [
          { name: "MaHD" },
        ]
      },
    ]
  });
  }
}
