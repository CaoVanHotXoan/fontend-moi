import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be set and contain at least 32 characters.');
}

// Cookie này là HttpOnly nên JavaScript phía trình duyệt không thể đọc token.
export function verifyToken(req, res, next) {
  const authorization = req.get('authorization');
  const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const token = bearerToken || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: token is required.' });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized: token is invalid or expired.' });
  }
}

export function verifyAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: administrator role is required.' });
  }
  return next();
}
