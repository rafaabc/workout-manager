import jwt from 'jsonwebtoken';
const SECRET = 'supersecretkey';

export default function (req, res, next) {
  if (
    req.path.startsWith('/api/users') ||
    req.path.startsWith('/api/login') ||
    req.path.startsWith('/api-docs')
  ) {
    return next();
  }
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token not provide' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Invalid Token' });
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid Token' });
    req.user = user;
    next();
  });
}
