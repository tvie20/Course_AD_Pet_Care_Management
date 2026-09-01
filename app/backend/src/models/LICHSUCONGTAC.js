import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class LICHSUCONGTAC extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MaNV: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'NHANVIEN',
        key: 'MaNV'
      }
    },
    MaCN: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'CHINHANH',
        key: 'MaCN'
      }
    },
    NgayVaoLam: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      primaryKey: true
    },
    NgayChuyen: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    ChucVu: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    LuongCoBan: {
      type: DataTypes.DECIMAL(18,0),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'LICHSUCONGTAC',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_LICHSUCONGTAC_MaNV_MaCN_NgayVaoLam",
        unique: true,
        fields: [
          { name: "MaNV" },
          { name: "MaCN" },
          { name: "NgayVaoLam" },
        ]
      },
    ]
  });
  }
}
