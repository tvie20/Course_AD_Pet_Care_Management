import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class CHINHANH extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MaCN: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true
    },
    TenCN: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    DiaChi: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "UQ_CHINHANH_DiaChi"
    },
    SDTCN: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: "UQ_CHINHANH_SDTCN"
    },
    ThoiGianMoCua: {
      type: DataTypes.TIME,
      allowNull: false
    },
    ThoiGianDongCua: {
      type: DataTypes.TIME,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'CHINHANH',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_CHINHANH_MaCN",
        unique: true,
        fields: [
          { name: "MaCN" },
        ]
      },
      {
        name: "UQ_CHINHANH_DiaChi",
        unique: true,
        fields: [
          { name: "DiaChi" },
        ]
      },
      {
        name: "UQ_CHINHANH_SDTCN",
        unique: true,
        fields: [
          { name: "SDTCN" },
        ]
      },
    ]
  });
  }
}
