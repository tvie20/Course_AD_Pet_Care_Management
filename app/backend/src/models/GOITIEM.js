import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class GOITIEM extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MaGT: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true
    },
    ThoiGianGT: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    UuDai: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'GOITIEM',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_GOITIEM_MaGT",
        unique: true,
        fields: [
          { name: "MaGT" },
        ]
      },
    ]
  });
  }
}
