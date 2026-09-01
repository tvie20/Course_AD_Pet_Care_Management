import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class NHANVIENTIEPTAN extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    TMaNV: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'NHANVIEN',
        key: 'MaNV'
      }
    },
    QuayTiepNhan: {
      type: DataTypes.STRING(20),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'NHANVIENTIEPTAN',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_NHANVIENTIEPTAN_TMaNV",
        unique: true,
        fields: [
          { name: "TMaNV" },
        ]
      },
    ]
  });
  }
}
