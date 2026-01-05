// src/routes/auth.route.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

import { verifyToken } from "../middlewares/authClienteMiddleware.js"; // importa tu middleware

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Obtener datos del cliente autenticado
router.get("/me", verifyToken, async (req, res) => {
  try {
    const clienteId = req.clienteId; // viene del middleware
    const [clientes] = await pool.query(
      "SELECT id, nombre, dni, email, cel, dir FROM clientes WHERE id = ?",
      [clienteId]
    );

    if (clientes.length === 0)
      return res.status(404).json({ error: "Cliente no encontrado" });

    res.json(clientes[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Registro de cliente y cuenta
router.post("/register", async (req, res) => {
  const { dni, nombre, email, cel, dir, password } = req.body;
  if (!dni || !nombre || !email || !password) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    // Verificar si ya existe cliente
    const [existing] = await pool.query("SELECT id FROM clientes WHERE email =?", [email]);
    if (existing.length > 0) return res.status(400).json({ error: "Email ya registrado" });

    // Crear cliente
    const [result] = await pool.query(
      "INSERT INTO clientes (dni, nombre, email, cel, dir) VALUES (?, ?, ?, ?, ?)",
      [dni, nombre, email, cel || "", dir || ""]
    );
    const clienteId = result.insertId;

    // Crear cuenta con contraseña hash
    const hash = await bcrypt.hash(password,10);
    await pool.query(
      "INSERT INTO cuentas_clientes (cliente_id,password) VALUES (?, ?)",
      [clienteId, hash]
    );

    res.json({ message: "Registro exitoso" });
    // Después de crear cliente y cuenta
const token = jwt.sign({ clienteId }, JWT_SECRET, { expiresIn: "7d" });

// Devuelve token y clienteId para login automático
res.json({
  message: "Registro exitoso",
  clienteId,
  token
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Faltan datos" });

  try {
    // Buscar cliente
    const [clientes] = await pool.query("SELECT id, email FROM clientes WHERE email = ?", [email]);
    if (clientes.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });

    const clienteId = clientes[0].id;

    // Verificar contraseña
    const [cuentas] = await pool.query("SELECT password, activo FROM cuentas_clientes WHERE cliente_id = ?", [clienteId]);
    if (cuentas.length === 0 || !cuentas[0].activo) return res.status(401).json({ error: "Cuenta no activa" });

    const match = await bcrypt.compare(password, cuentas[0].password);
    if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

    // Generar token
    const token = jwt.sign({ clienteId }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, clienteId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


export default router;
