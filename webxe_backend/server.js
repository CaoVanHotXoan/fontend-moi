import express from 'express';
import dns from 'node:dns';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import 'dotenv/config';
import { swaggerSpec } from './config/swagger.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import procedureRoutes from './routes/procedureRoutes.js';
import { getPool } from './config/db.js';
import catalogRoutes from './routes/catalogRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dns.setDefaultResultOrder('ipv4first');

const app = express();
const allowedOrigins = String(process.env.CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true);
    return callback(new Error('Origin không được phép bởi CORS.'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'webxe_backend' }));
app.get('/api/health/db', async (req, res, next) => {
  try {
    const result = await (await getPool()).request().query('SELECT DB_NAME() AS databaseName');
    return res.json({ status: 'ok', database: result.recordset[0].databaseName });
  } catch (error) {
    return next(error);
  }
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/data', catalogRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', procedureRoutes);

app.use((req, res) => res.status(404).json({ message: 'Không tìm thấy endpoint.' }));
app.use((error, req, res, next) => {
  console.error(error);
  return res.status(500).json({
    message: 'Lỗi máy chủ nội bộ.',
    ...(process.env.NODE_ENV !== 'production' && { detail: error.message })
  });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`WebXe backend đang chạy tại http://localhost:${port}`));

export default app;
