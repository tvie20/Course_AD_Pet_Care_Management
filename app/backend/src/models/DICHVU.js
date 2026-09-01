import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class DICHVU extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MaDV: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true
    },
    TenDV: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    PhiDV: {
      type: DataTypes.DECIMAL(18,0),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'DICHVU',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_DICHVU_MaDV",
        unique: true,
        fields: [
          { name: "MaDV" },
        ]
      },
    ]
  });
  }
}
