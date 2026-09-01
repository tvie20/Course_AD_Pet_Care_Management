import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class NHANVIENBANHANG extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    HMaNV: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'NHANVIEN',
        key: 'MaNV'
      }
    },
    CaLamViec: {
      type: DataTypes.STRING(20),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'NHANVIENBANHANG',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_NHANVIENBANHANG_HMaNV",
        unique: true,
        fields: [
          { name: "HMaNV" },
        ]
      },
    ]
  });
  }
}
