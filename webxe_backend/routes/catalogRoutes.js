import { Router } from 'express';
import { getCatalogData, getNewsData } from '../controllers/catalogController.js';

const router = Router();

/**
 * @swagger
 * /api/data/json:
 *   get:
 *     tags: [Catalog]
 *     summary: Lấy dữ liệu xe, hãng xe, loại xe và hình ảnh
 *     responses:
 *       200: { description: Dữ liệu catalog }
 *       500: { description: Không đọc được SQL Server }
 */
router.get('/json', getCatalogData);

/**
 * @swagger
 * /api/data/news:
 *   get:
 *     tags: [Catalog]
 *     summary: Lấy danh sách tin tức và danh mục tin
 *     responses:
 *       200: { description: Dữ liệu tin tức }
 *       500: { description: Không đọc được SQL Server }
 */
router.get('/news', getNewsData);

export default router;
