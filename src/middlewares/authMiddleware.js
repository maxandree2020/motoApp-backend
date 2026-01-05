// src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // Obtener token desde headers Authorization
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  // El token normalmente viene como "Bearer <token>"
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, 'clave_secreta'); // usar la misma clave que en login
    req.user = decoded; // podemos usar req.user en los controllers
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token expirado o inválido' });
  }
};


