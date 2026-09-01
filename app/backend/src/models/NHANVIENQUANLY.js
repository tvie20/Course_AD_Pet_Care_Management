import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class NHANVIENQUANLY extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    QMaNV: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'NHANVIEN',
        key: 'MaNV'
      }
    },
    BangCap: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    PhuCap: {
      type: DataTypes.DECIMAL(18,0),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'NHANVIENQUANLY',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_NHANVIENQUANLY_QMaNV",
        unique: true,
        fields: [
          { name: "QMaNV" },
        ]
      },
    ]
  });
  }
}
