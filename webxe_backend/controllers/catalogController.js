import { getPool } from '../config/db.js';

export async function getCatalogData(req, res, next) {
  try {
    const pool = await getPool();
    const [vehicles, images, brands, types] = await Promise.all([
      pool.request().query(`
        SELECT MaXe, MaHang, MaLoai, TenXe, Gia, NamSanXuat, MauSac, MoTa, SoLuong
        FROM dbo.Xe
        ORDER BY MaXe DESC
      `),
      pool.request().query(`
        SELECT MaHinhAnh, MaXe, DuongDanAnh, LaAnhChinh
        FROM dbo.HinhAnhXe
        ORDER BY MaXe, LaAnhChinh DESC, MaHinhAnh
      `),
      pool.request().query('SELECT MaHang, TenHang, Logo FROM dbo.HangXe ORDER BY TenHang'),
      pool.request().query('SELECT MaLoai, TenLoai FROM dbo.LoaiXe ORDER BY TenLoai'),
    ]);

    return res.json({
      Xe: vehicles.recordset,
      HinhAnhXe: images.recordset,
      HangXe: brands.recordset,
      LoaiXe: types.recordset,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getNewsData(req, res, next) {
  try {
    const pool = await getPool();
    const [articles, categories] = await Promise.all([
      pool.request().query(`
        SELECT MaTinTuc, MaDanhMuc, TieuDe, TomTat, NoiDung, HinhAnh, NgayDang
        FROM dbo.TinTuc
        ORDER BY NgayDang DESC, MaTinTuc DESC
      `),
      pool.request().query('SELECT MaDanhMuc, TenDanhMuc FROM dbo.DanhMucTinTuc ORDER BY TenDanhMuc'),
    ]);

    return res.json({ TinTuc: articles.recordset, DanhMucTinTuc: categories.recordset });
  } catch (error) {
    return next(error);
  }
}
