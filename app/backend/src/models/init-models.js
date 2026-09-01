import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _BACSITHUY from  "./BACSITHUY.js";
import _CAPTHANHVIEN from  "./CAPTHANHVIEN.js";
import _CHINHANH from  "./CHINHANH.js";
import _CHINHANH_DICHVU from  "./CHINHANH_DICHVU.js";
import _CHITIETHOADON from  "./CHITIETHOADON.js";
import _CHITIETTOATHUOC from  "./CHITIETTOATHUOC.js";
import _DANHGIA from  "./DANHGIA.js";
import _DICHVU from  "./DICHVU.js";
import _GOITIEM from  "./GOITIEM.js";
import _HOADON from  "./HOADON.js";
import _KHACHHANG from  "./KHACHHANG.js";
import _KHAMBENH from  "./KHAMBENH.js";
import _LICHSUCONGTAC from  "./LICHSUCONGTAC.js";
import _LICHSUDICHVU from  "./LICHSUDICHVU.js";
import _NHANVIEN from  "./NHANVIEN.js";
import _NHANVIENBANHANG from  "./NHANVIENBANHANG.js";
import _NHANVIENQUANLY from  "./NHANVIENQUANLY.js";
import _NHANVIENTIEPTAN from  "./NHANVIENTIEPTAN.js";
import _PHIEUDAT from  "./PHIEUDAT.js";
import _SANPHAM from  "./SANPHAM.js";
import _TAIKHOANHOIVIEN from  "./TAIKHOANHOIVIEN.js";
import _THONGTINTHANHTOAN from  "./THONGTINTHANHTOAN.js";
import _THUCUNG from  "./THUCUNG.js";
import _THUOC from  "./THUOC.js";
import _TIEMPHONG from  "./TIEMPHONG.js";
import _TOATHUOC from  "./TOATHUOC.js";
import _VACXIN from  "./VACXIN.js";

export default function initModels(sequelize) {
  const BACSITHUY = _BACSITHUY.init(sequelize, DataTypes);
  const CAPTHANHVIEN = _CAPTHANHVIEN.init(sequelize, DataTypes);
  const CHINHANH = _CHINHANH.init(sequelize, DataTypes);
  const CHINHANH_DICHVU = _CHINHANH_DICHVU.init(sequelize, DataTypes);
  const CHITIETHOADON = _CHITIETHOADON.init(sequelize, DataTypes);
  const CHITIETTOATHUOC = _CHITIETTOATHUOC.init(sequelize, DataTypes);
  const DANHGIA = _DANHGIA.init(sequelize, DataTypes);
  const DICHVU = _DICHVU.init(sequelize, DataTypes);
  const GOITIEM = _GOITIEM.init(sequelize, DataTypes);
  const HOADON = _HOADON.init(sequelize, DataTypes);
  const KHACHHANG = _KHACHHANG.init(sequelize, DataTypes);
  const KHAMBENH = _KHAMBENH.init(sequelize, DataTypes);
  const LICHSUCONGTAC = _LICHSUCONGTAC.init(sequelize, DataTypes);
  const LICHSUDICHVU = _LICHSUDICHVU.init(sequelize, DataTypes);
  const NHANVIEN = _NHANVIEN.init(sequelize, DataTypes);
  const NHANVIENBANHANG = _NHANVIENBANHANG.init(sequelize, DataTypes);
  const NHANVIENQUANLY = _NHANVIENQUANLY.init(sequelize, DataTypes);
  const NHANVIENTIEPTAN = _NHANVIENTIEPTAN.init(sequelize, DataTypes);
  const PHIEUDAT = _PHIEUDAT.init(sequelize, DataTypes);
  const SANPHAM = _SANPHAM.init(sequelize, DataTypes);
  const TAIKHOANHOIVIEN = _TAIKHOANHOIVIEN.init(sequelize, DataTypes);
  const THONGTINTHANHTOAN = _THONGTINTHANHTOAN.init(sequelize, DataTypes);
  const THUCUNG = _THUCUNG.init(sequelize, DataTypes);
  const THUOC = _THUOC.init(sequelize, DataTypes);
  const TIEMPHONG = _TIEMPHONG.init(sequelize, DataTypes);
  const TOATHUOC = _TOATHUOC.init(sequelize, DataTypes);
  const VACXIN = _VACXIN.init(sequelize, DataTypes);

  CHINHANH.belongsToMany(DICHVU, { as: 'MaDV_DICHVUs', through: CHINHANH_DICHVU, foreignKey: "MaCN", otherKey: "MaDV" });
  CHINHANH.belongsToMany(NHANVIEN, { as: 'MaNV_NHANVIENs', through: LICHSUCONGTAC, foreignKey: "MaCN", otherKey: "MaNV" });
  DICHVU.belongsToMany(CHINHANH, { as: 'MaCN_CHINHANHs', through: CHINHANH_DICHVU, foreignKey: "MaDV", otherKey: "MaCN" });
  KHACHHANG.belongsToMany(THUCUNG, { as: 'MaTC_THUCUNGs', through: PHIEUDAT, foreignKey: "MaKH", otherKey: "MaTC" });
  NHANVIEN.belongsToMany(CHINHANH, { as: 'MaCN_CHINHANH_LICHSUCONGTACs', through: LICHSUCONGTAC, foreignKey: "MaNV", otherKey: "MaCN" });
  THUCUNG.belongsToMany(KHACHHANG, { as: 'MaKH_KHACHHANGs', through: PHIEUDAT, foreignKey: "MaTC", otherKey: "MaKH" });
  THUOC.belongsToMany(TOATHUOC, { as: 'MaTT_TOATHUOCs', through: CHITIETTOATHUOC, foreignKey: "TMaSP", otherKey: "MaTT" });
  TOATHUOC.belongsToMany(THUOC, { as: 'TMaSP_THUOCs', through: CHITIETTOATHUOC, foreignKey: "MaTT", otherKey: "TMaSP" });
  KHAMBENH.belongsTo(BACSITHUY, { as: "BMaNV_BACSITHUY", foreignKey: "BMaNV"});
  BACSITHUY.hasMany(KHAMBENH, { as: "KHAMBENHs", foreignKey: "BMaNV"});
  TIEMPHONG.belongsTo(BACSITHUY, { as: "BMaNV_BACSITHUY", foreignKey: "BMaNV"});
  BACSITHUY.hasMany(TIEMPHONG, { as: "TIEMPHONGs", foreignKey: "BMaNV"});
  KHACHHANG.belongsTo(CAPTHANHVIEN, { as: "CapTV_CAPTHANHVIEN", foreignKey: "CapTV"});
  CAPTHANHVIEN.hasMany(KHACHHANG, { as: "KHACHHANGs", foreignKey: "CapTV"});
  CHINHANH_DICHVU.belongsTo(CHINHANH, { as: "MaCN_CHINHANH", foreignKey: "MaCN"});
  CHINHANH.hasMany(CHINHANH_DICHVU, { as: "CHINHANH_DICHVUs", foreignKey: "MaCN"});
  LICHSUCONGTAC.belongsTo(CHINHANH, { as: "MaCN_CHINHANH", foreignKey: "MaCN"});
  CHINHANH.hasMany(LICHSUCONGTAC, { as: "LICHSUCONGTACs", foreignKey: "MaCN"});
  PHIEUDAT.belongsTo(CHINHANH, { as: "MaCN_CHINHANH", foreignKey: "MaCN"});
  CHINHANH.hasMany(PHIEUDAT, { as: "PHIEUDATs", foreignKey: "MaCN"});
  CHINHANH_DICHVU.belongsTo(DICHVU, { as: "MaDV_DICHVU", foreignKey: "MaDV"});
  DICHVU.hasMany(CHINHANH_DICHVU, { as: "CHINHANH_DICHVUs", foreignKey: "MaDV"});
  LICHSUDICHVU.belongsTo(DICHVU, { as: "MaDV_DICHVU", foreignKey: "MaDV"});
  DICHVU.hasMany(LICHSUDICHVU, { as: "LICHSUDICHVUs", foreignKey: "MaDV"});
  TIEMPHONG.belongsTo(GOITIEM, { as: "MaGT_GOITIEM", foreignKey: "MaGT"});
  GOITIEM.hasMany(TIEMPHONG, { as: "TIEMPHONGs", foreignKey: "MaGT"});
  CHITIETHOADON.belongsTo(HOADON, { as: "MaHD_HOADON", foreignKey: "MaHD"});
  HOADON.hasMany(CHITIETHOADON, { as: "CHITIETHOADONs", foreignKey: "MaHD"});
  DANHGIA.belongsTo(HOADON, { as: "MaHD_HOADON", foreignKey: "MaHD"});
  HOADON.hasOne(DANHGIA, { as: "DANHGIum", foreignKey: "MaHD"});
  THONGTINTHANHTOAN.belongsTo(HOADON, { as: "MaHD_HOADON", foreignKey: "MaHD"});
  HOADON.hasOne(THONGTINTHANHTOAN, { as: "THONGTINTHANHTOAN", foreignKey: "MaHD"});
  DANHGIA.belongsTo(KHACHHANG, { as: "MaKH_KHACHHANG", foreignKey: "MaKH"});
  KHACHHANG.hasMany(DANHGIA, { as: "DANHGIa", foreignKey: "MaKH"});
  PHIEUDAT.belongsTo(KHACHHANG, { as: "MaKH_KHACHHANG", foreignKey: "MaKH"});
  KHACHHANG.hasMany(PHIEUDAT, { as: "PHIEUDATs", foreignKey: "MaKH"});
  TAIKHOANHOIVIEN.belongsTo(KHACHHANG, { as: "MaKH_KHACHHANG", foreignKey: "MaKH"});
  KHACHHANG.hasOne(TAIKHOANHOIVIEN, { as: "TAIKHOANHOIVIEN", foreignKey: "MaKH"});
  THONGTINTHANHTOAN.belongsTo(KHACHHANG, { as: "MaKH_KHACHHANG", foreignKey: "MaKH"});
  KHACHHANG.hasMany(THONGTINTHANHTOAN, { as: "THONGTINTHANHTOANs", foreignKey: "MaKH"});
  THUCUNG.belongsTo(KHACHHANG, { as: "MaKH_KHACHHANG", foreignKey: "MaKH"});
  KHACHHANG.hasMany(THUCUNG, { as: "THUCUNGs", foreignKey: "MaKH"});
  CHITIETHOADON.belongsTo(LICHSUDICHVU, { as: "MaGD_LICHSUDICHVU", foreignKey: "MaGD"});
  LICHSUDICHVU.hasMany(CHITIETHOADON, { as: "CHITIETHOADONs", foreignKey: "MaGD"});
  KHAMBENH.belongsTo(LICHSUDICHVU, { as: "KMaGD_LICHSUDICHVU", foreignKey: "KMaGD"});
  LICHSUDICHVU.hasOne(KHAMBENH, { as: "KHAMBENH", foreignKey: "KMaGD"});
  TIEMPHONG.belongsTo(LICHSUDICHVU, { as: "TMaGD_LICHSUDICHVU", foreignKey: "TMaGD"});
  LICHSUDICHVU.hasOne(TIEMPHONG, { as: "TIEMPHONG", foreignKey: "TMaGD"});
  TOATHUOC.belongsTo(LICHSUDICHVU, { as: "KMaGD_LICHSUDICHVU", foreignKey: "KMaGD"});
  LICHSUDICHVU.hasMany(TOATHUOC, { as: "TOATHUOCs", foreignKey: "KMaGD"});
  BACSITHUY.belongsTo(NHANVIEN, { as: "BMaNV_NHANVIEN", foreignKey: "BMaNV"});
  NHANVIEN.hasOne(BACSITHUY, { as: "BACSITHUY", foreignKey: "BMaNV"});
  LICHSUCONGTAC.belongsTo(NHANVIEN, { as: "MaNV_NHANVIEN", foreignKey: "MaNV"});
  NHANVIEN.hasMany(LICHSUCONGTAC, { as: "LICHSUCONGTACs", foreignKey: "MaNV"});
  NHANVIENBANHANG.belongsTo(NHANVIEN, { as: "HMaNV_NHANVIEN", foreignKey: "HMaNV"});
  NHANVIEN.hasOne(NHANVIENBANHANG, { as: "NHANVIENBANHANG", foreignKey: "HMaNV"});
  NHANVIENQUANLY.belongsTo(NHANVIEN, { as: "QMaNV_NHANVIEN", foreignKey: "QMaNV"});
  NHANVIEN.hasOne(NHANVIENQUANLY, { as: "NHANVIENQUANLY", foreignKey: "QMaNV"});
  NHANVIENTIEPTAN.belongsTo(NHANVIEN, { as: "TMaNV_NHANVIEN", foreignKey: "TMaNV"});
  NHANVIEN.hasOne(NHANVIENTIEPTAN, { as: "NHANVIENTIEPTAN", foreignKey: "TMaNV"});
  HOADON.belongsTo(NHANVIENBANHANG, { as: "HMaNV_NHANVIENBANHANG", foreignKey: "HMaNV"});
  NHANVIENBANHANG.hasMany(HOADON, { as: "HOADONs", foreignKey: "HMaNV"});
  CHITIETHOADON.belongsTo(SANPHAM, { as: "MaSP_SANPHAM", foreignKey: "MaSP"});
  SANPHAM.hasMany(CHITIETHOADON, { as: "CHITIETHOADONs", foreignKey: "MaSP"});
  THUOC.belongsTo(SANPHAM, { as: "TMaSP_SANPHAM", foreignKey: "TMaSP"});
  SANPHAM.hasOne(THUOC, { as: "THUOC", foreignKey: "TMaSP"});
  VACXIN.belongsTo(SANPHAM, { as: "VMaSP_SANPHAM", foreignKey: "VMaSP"});
  SANPHAM.hasOne(VACXIN, { as: "VACXIN", foreignKey: "VMaSP"});
  HOADON.belongsTo(THUCUNG, { as: "MaTC_THUCUNG", foreignKey: "MaTC"});
  THUCUNG.hasMany(HOADON, { as: "HOADONs", foreignKey: "MaTC"});
  PHIEUDAT.belongsTo(THUCUNG, { as: "MaTC_THUCUNG", foreignKey: "MaTC"});
  THUCUNG.hasMany(PHIEUDAT, { as: "PHIEUDATs", foreignKey: "MaTC"});
  CHITIETTOATHUOC.belongsTo(THUOC, { as: "TMaSP_THUOC", foreignKey: "TMaSP"});
  THUOC.hasMany(CHITIETTOATHUOC, { as: "CHITIETTOATHUOCs", foreignKey: "TMaSP"});
  CHITIETTOATHUOC.belongsTo(TOATHUOC, { as: "MaTT_TOATHUOC", foreignKey: "MaTT"});
  TOATHUOC.hasMany(CHITIETTOATHUOC, { as: "CHITIETTOATHUOCs", foreignKey: "MaTT"});
  TIEMPHONG.belongsTo(VACXIN, { as: "VMaSP_VACXIN", foreignKey: "VMaSP"});
  VACXIN.hasMany(TIEMPHONG, { as: "TIEMPHONGs", foreignKey: "VMaSP"});

  return {
    BACSITHUY,
    CAPTHANHVIEN,
    CHINHANH,
    CHINHANH_DICHVU,
    CHITIETHOADON,
    CHITIETTOATHUOC,
    DANHGIA,
    DICHVU,
    GOITIEM,
    HOADON,
    KHACHHANG,
    KHAMBENH,
    LICHSUCONGTAC,
    LICHSUDICHVU,
    NHANVIEN,
    NHANVIENBANHANG,
    NHANVIENQUANLY,
    NHANVIENTIEPTAN,
    PHIEUDAT,
    SANPHAM,
    TAIKHOANHOIVIEN,
    THONGTINTHANHTOAN,
    THUCUNG,
    THUOC,
    TIEMPHONG,
    TOATHUOC,
    VACXIN,
  };
}
