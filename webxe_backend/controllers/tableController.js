import { getPool, sql } from '../config/db.js';

export const tableNames = [
  'VaiTro', 'NguoiDung', 'HangXe', 'LoaiXe', 'Xe', 'HinhAnhXe',
  'GioHang', 'ChiTietGioHang', 'DonHang', 'ChiTietDonHang',
  'MaXacNhan', 'DanhMucTinTuc', 'TinTuc'
];

export async function listTables(req, res, next) {
  try {
    const result = await (await getPool()).request().query(`
      SELECT TABLE_NAME AS tableName
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
        AND TABLE_NAME IN (${tableNames.map((name) => `'${name}'`).join(', ')})
      ORDER BY TABLE_NAME
    `);
    return res.json({ tables: result.recordset.map(({ tableName }) => tableName) });
  } catch (error) {
    return next(error);
  }
}

export async function listTableRows(req, res, next) {
  try {
    const { tableName } = req.params;
    if (!tableNames.includes(tableName)) {
      return res.status(404).json({ message: 'Bảng không nằm trong whitelist.' });
    }

    const requestedLimit = Number(req.query.limit ?? 100);
    const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 500) : 100;
    const result = await (await getPool()).request()
      .input('limit', sql.Int, limit)
      .query(`SELECT TOP (@limit) * FROM [dbo].[${tableName}]`);

    return res.json({ table: tableName, count: result.recordset.length, rows: result.recordset });
  } catch (error) {
    return next(error);
  }
}
