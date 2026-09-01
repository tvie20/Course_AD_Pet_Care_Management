import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class TIEMPHONG extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    TMaGD: {
      type: DataTypes.CHAR(25),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'LICHSUDICHVU',
        key: 'MaGD'
      }
    },
    NgayTiem: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    LieuLuongTiem: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    LoaiHinhTiem: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    MaGT: {
      type: DataTypes.CHAR(10),
      allowNull: true,
      references: {
        model: 'GOITIEM',
        key: 'MaGT'
      }
    },
    VMaSP: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      references: {
        model: 'VACXIN',
        key: 'VMaSP'
      }
    },
    BMaNV: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      references: {
        model: 'BACSITHUY',
        key: 'BMaNV'
      }
    }
  }, {
    sequelize,
    tableName: 'TIEMPHONG',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_TIEMPHONG_TMaGD",
        unique: true,
        fields: [
          { name: "TMaGD" },
        ]
      },
    ]
  });
  }
}
