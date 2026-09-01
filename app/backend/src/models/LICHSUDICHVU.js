import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class LICHSUDICHVU extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MaGD: {
      type: DataTypes.CHAR(25),
      allowNull: false,
      primaryKey: true
    },
    MaDV: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      references: {
        model: 'DICHVU',
        key: 'MaDV'
      }
    }
  }, {
    sequelize,
    tableName: 'LICHSUDICHVU',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_LICHSUDICHVU_MaGD",
        unique: true,
        fields: [
          { name: "MaGD" },
        ]
      },
    ]
  });
  }
}
