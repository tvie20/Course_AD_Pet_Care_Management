import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class KHAMBENH extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    KMaGD: {
      type: DataTypes.CHAR(25),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'LICHSUDICHVU',
        key: 'MaGD'
      }
    },
    TrieuChung: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    ChanDoan: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    NgayKham: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    NgayTaiKham: {
      type: DataTypes.DATEONLY,
      allowNull: true
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
    tableName: 'KHAMBENH',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_KHAMBENH_KMaGD",
        unique: true,
        fields: [
          { name: "KMaGD" },
        ]
      },
    ]
  });
  }
}
