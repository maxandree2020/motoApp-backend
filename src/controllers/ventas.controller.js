import { pool } from '../db.js'
import { format } from 'date-fns'

export const getVentas = async (req, res) => {
  try {
    const sql = `
      SELECT
        v.id,
        v.moto_id,
        v.cliente_id,
        v.fecha_venta,
        v.precio
      FROM ventas v
      INNER JOIN motos m ON v.moto_id = m.id
      WHERE m.tipo = 'venta'
      ORDER BY v.fecha_venta DESC
    `;
    const [rows] = await pool.query(sql);
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor" });
  }
};

export const getVenta = async (req, res) => {
  try {
    const sql = `
      SELECT
        v.id,
        v.fecha_venta,
        v.precio,
        c.id AS cliente_id,
        c.nombre AS cliente_nombre,
        m.id AS moto_id,
        m.nombre AS moto_nombre
      FROM ventas v
      JOIN clientes c ON v.cliente_id = c.id
      JOIN motos m ON v.moto_id = m.id
      WHERE v.id = ?
    `;
    const [rows] = await pool.query(sql, [req.params.id]);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Venta no encontrada" });
    }

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor" });
  }
};

export const addVenta = async (req, res) => {
  const { moto_id, cliente_id } = req.body;
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [motoRows] = await connection.query(
      "SELECT precio, disponible FROM motos WHERE id = ? AND tipo = 'venta'",
      [moto_id]
    );

    if (motoRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Moto no encontrada o no está a la venta" });
    }

    const moto = motoRows[0];

    if (!moto.disponible) {
      await connection.rollback();
      return res.status(409).json({ message: "Esta moto ya ha sido vendida" });
    }

    const [ventaResult] = await connection.query(
      "INSERT INTO ventas (moto_id, cliente_id, fecha_venta, precio) VALUES (?, ?, CURDATE(), ?)",
      [moto_id, cliente_id, moto.precio]
    );

    await connection.query(
      "UPDATE motos SET disponible = false WHERE id = ?",
      [moto_id]
    );

    await connection.commit();

    return res.status(201).json({
      message: "Venta registrada con éxito",
      ventaId: ventaResult.insertId
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error(error);
    return res.status(500).json({ message: "Ocurrió un error durante el proceso de venta" });
  } finally {
    if (connection) connection.release();
  }
};

export const updateVenta = async (req, res) => {
  try {
    const { moto_id, cliente_id, fecha_venta, precio } = req.body;

    const fechaFormateada = fecha_venta
      ? format(new Date(fecha_venta), 'yyyy-MM-dd HH:mm:ss')
      : null;

    const sql = `
      UPDATE ventas
      SET moto_id = ?, cliente_id = ?, fecha_venta = ?, precio = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(sql, [
      moto_id,
      cliente_id,
      fechaFormateada,
      precio,
      req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "venta no encontrada" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM ventas WHERE id = ?",
      [req.params.id]
    );

    return res.json(rows);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor" });
  }
};

export const deleteVenta = async (req, res) => {
  try {
    const sql = "DELETE FROM ventas WHERE id = ?";
    const [result] = await pool.query(sql, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "venta not found" });
    }

    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor" });
  }
};

export const getMotosDisponibles = async (req, res) => {
  try {
    const sql = `
      SELECT id, nombre, descrip, precio
      FROM motos
      WHERE disponible = true AND tipo = 'venta'
    `;
    const [rows] = await pool.query(sql);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontraron motos disponibles para la venta" });
    }

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Ocurrió un error al obtener las motos" });
  }
};
