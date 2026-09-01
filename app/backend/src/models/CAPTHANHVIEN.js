import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class CAPTHANHVIEN extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    CapTV: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true
    },
    ChiTieuToiThieu: {
      type: DataTypes.DECIMAL(18,0),
      allowNull: false
    },
    ChiTieuGiuHang: {
      type: DataTypes.DECIMAL(18,0),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'CAPTHANHVIEN',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_CAPTHANHVIEN_CapTV",
        unique: true,
        fields: [
          { name: "CapTV" },
        ]
      },
    ]
  });
  }
}
