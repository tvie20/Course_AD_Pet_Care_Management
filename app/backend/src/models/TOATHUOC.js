import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class TOATHUOC extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MaTT: {
      type: DataTypes.CHAR(25),
      allowNull: false,
      primaryKey: true
    },
    ThoiGianLapTT: {
      type: DataTypes.DATE,
      allowNull: false
    },
    KMaGD: {
      type: DataTypes.CHAR(25),
      allowNull: false,
      references: {
        model: 'LICHSUDICHVU',
        key: 'MaGD'
      }
    }
  }, {
    sequelize,
    tableName: 'TOATHUOC',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_TOATHUOC_MaTT",
        unique: true,
        fields: [
          { name: "MaTT" },
        ]
      },
    ]
  });
  }
}
