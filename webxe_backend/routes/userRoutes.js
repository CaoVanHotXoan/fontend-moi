import { Router } from 'express';
import { getProfile, updateProfile, getVehicleAvailabilityAlerts, sendVehicleAvailabilityAlert } from '../controllers/userController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     tags: [User]
 *     summary: Lấy thông tin profile hiện tại
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     responses:
 *       200: { description: Profile người dùng }
 *       401: { description: Unauthorized khi thiếu, sai hoặc hết hạn cookie }
 */
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.get('/vehicle-availability-alert', verifyToken, getVehicleAvailabilityAlerts);
router.post('/vehicle-availability-alert', verifyToken, sendVehicleAvailabilityAlert);

export default router;
