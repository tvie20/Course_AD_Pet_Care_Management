import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class CHINHANH_DICHVU extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MaCN: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'CHINHANH',
        key: 'MaCN'
      }
    },
    MaDV: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'DICHVU',
        key: 'MaDV'
      }
    }
  }, {
    sequelize,
    tableName: 'CHINHANH_DICHVU',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_CHINHANH_DICHVU_MaCN_MaDV",
        unique: true,
        fields: [
          { name: "MaCN" },
          { name: "MaDV" },
        ]
      },
    ]
  });
  }
}
