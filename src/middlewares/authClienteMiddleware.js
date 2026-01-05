// src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token no proporcionado" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token inválido" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.clienteId = decoded.clienteId;
    next();
  } catch (err) {


  // 1. Manejo: Registramos el error para observabilidad en el servidor
    console.error("Error en validación de token:", err.message);

    // 2. Opcional: Diferenciar si el token expiró o es inválido
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: "El token ha expirado" });
    }

    return res.status(401).json({ error: "Token inválido o malformado" });
  
  
  }
};
