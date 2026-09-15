import { Router } from 'express';
import {
	login,
	logout,
	requestRegisterOtp,
	verifyRegister,
	requestForgotPasswordOtp,
	resetPassword,
	requestProfileEmailOtp
} from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Đăng nhập và nhận JWT HttpOnly Cookie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               tenDangNhap: { type: string, example: admin }
 *               email: { type: string, example: admin@webxe.vn }
 *               password: { type: string, format: password, example: secret }
 *     responses:
 *       200: { description: Đăng nhập thành công; response có token để dùng với nút Authorize và Set-Cookie cho frontend. }
 *       401: { description: Sai thông tin đăng nhập }
 */
router.post('/login', login);
router.post('/register/request-otp', requestRegisterOtp);
router.post('/register/verify', verifyRegister);
router.post('/password/forgot/request-otp', requestForgotPasswordOtp);
router.post('/password/forgot/reset', resetPassword);
router.post('/profile/email/request-otp', verifyToken, requestProfileEmailOtp);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Đăng xuất và xóa JWT Cookie
 *     responses:
 *       200: { description: Đăng xuất thành công }
 */
router.post('/logout', logout);

export default router;
