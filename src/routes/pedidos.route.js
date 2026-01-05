import express from "express";
import { pool } from "../db.js";
import { verifyToken } from "../middlewares/authClienteMiddleware.js";

const router = express.Router();

router.get("/mis-pedidos", verifyToken, async (req, res) => {
  try {
    const clienteId = req.clienteId;

    // Datos del cliente
    const [clienteRows] = await pool.query(
      "SELECT id, nombre, dni, email, cel, dir FROM clientes WHERE id = ?",
      [clienteId]
    );

    if (clienteRows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Pedidos: ventas
    const [ventas] = await pool.query(
      "SELECT id, moto_id, precio, fecha_venta AS fecha, 'venta' AS tipo FROM ventas WHERE cliente_id = ?",
      [clienteId]
    );

    // Pedidos: alquileres
    const [alquileres] = await pool.query(
      "SELECT id, moto_id, precio_total AS precio, fecha_inicio AS fecha, 'alquiler' AS tipo FROM alquileres WHERE cliente_id = ?",
      [clienteId]
    );

    // Unimos pedidos
    const pedidos = [...ventas, ...alquileres];

    res.json({
      cliente: clienteRows[0],
      pedidos
    });

  } catch (error) {
    console.error("❌ Error obteniendo datos del cliente y pedidos:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

// actualizar cliente
router.patch("/actualizar-cliente", verifyToken, async (req, res) => {
  const { nombre, email, cel, dir } = req.body;
  const clienteId = req.clienteId; // 🔹 usar la propiedad que agrega el middleware

  if (!clienteId) {
    return res.status(401).json({ message: "Usuario no autorizado" });
  }

  try {
    const [result] = await pool.query(
      `UPDATE clientes 
       SET nombre = ?, email = ?, cel = ?, dir = ? 
       WHERE id = ?`,
      [nombre, email, cel, dir, clienteId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Obtener los datos actualizados
    const [rows] = await pool.query(
      `SELECT id, dni, nombre, email, cel, dir FROM clientes WHERE id = ?`,
      [clienteId]
    );

    res.json({ cliente: rows[0] });
  } catch (err) {
    console.error("❌ Error actualizando cliente:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});


export default router;
