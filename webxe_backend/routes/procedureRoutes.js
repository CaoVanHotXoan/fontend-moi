import { Router } from 'express';
import { executeProcedure } from '../controllers/procedureController.js';
import { listTableRows, listTables } from '../controllers/tableController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';
import { uploadImageFromUrl } from '../controllers/mediaController.js';

const router = Router();

router.post('/media/upload-url', verifyToken, verifyAdmin, uploadImageFromUrl);

/**
 * @swagger
 * /api/admin/tables:
 *   get:
 *     tags: [Tables]
 *     summary: Liệt kê các bảng nghiệp vụ trong database
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Danh sách bảng }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get('/tables', verifyToken, verifyAdmin, listTables);

/**
 * @swagger
 * /api/admin/tables/{tableName}:
 *   get:
 *     tags: [Tables]
 *     summary: Xem dữ liệu của một bảng nghiệp vụ
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: tableName
 *         required: true
 *         schema:
 *           type: string
 *           enum: [VaiTro, NguoiDung, HangXe, LoaiXe, Xe, HinhAnhXe, GioHang, ChiTietGioHang, DonHang, ChiTietDonHang, MaXacNhan, DanhMucTinTuc, TinTuc]
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 500, default: 100 }
 *     responses:
 *       200: { description: Dữ liệu bảng }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Bảng không hợp lệ }
 */
router.get('/tables/:tableName', verifyToken, verifyAdmin, listTableRows);

/**
 * @swagger
 * /api/admin/procedures/{procedureName}:
 *   post:
 *     tags: [Stored Procedures]
 *     summary: Gọi một procedure được whitelist từ ThuTuc.sql
 *     description: Body JSON phải chứa đúng các tham số của procedure. Chỉ admin được gọi.
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: procedureName
 *         required: true
 *         schema: { type: string, example: sp_ThemHangXe }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200: { description: Procedure thực thi thành công }
 *       400: { description: Thiếu tham số }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.post('/procedures/:procedureName', verifyToken, verifyAdmin, executeProcedure);

export default router;
