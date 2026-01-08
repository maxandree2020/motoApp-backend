import { pool } from '../db.js';
import { format } from 'date-fns';

/**
 * Función auxiliar para formatear fechas
 */
const formatDate = (date) => format(date, 'yyyy-MM-dd HH:mm:ss');

/**
 * GET /alquileres
 */
export const getAlquileres = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM alquileres");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

/**
 * GET /alquileres/:id
 */
export const getAlquiler = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM alquileres WHERE id = ?", [req.params.id]);
        if (!rows.length) {
            return res.status(404).json({ message: "Alquiler no encontrado" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

/**
 * POST /alquileres
 */
export const addAlquiler = async (req, res) => {
    try {
        const { moto_id, cliente_id, fecha_inicio, fecha_fin, precio_total } = req.body;
        const [result] = await pool.query(
            `INSERT INTO alquileres (moto_id, cliente_id, fecha_inicio, fecha_fin, precio_total)
             VALUES (?, ?, ?, ?, ?)`,
            [moto_id, cliente_id, formatDate(fecha_inicio), formatDate(fecha_fin), precio_total]
        );
        res.status(201).json({ id: result.insertId, moto_id, cliente_id, fecha_inicio, fecha_fin, precio_total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

/**
 * PUT /alquileres/:id
 */
export const updateAlquiler = async (req, res) => {
    try {
        const { moto_id, cliente_id, fecha_inicio, fecha_fin, precio_total } = req.body;
        const [result] = await pool.query(
            `UPDATE alquileres
             SET moto_id = ?, cliente_id = ?, fecha_inicio = ?, fecha_fin = ?, precio_total = ?
             WHERE id = ?`,
            [moto_id, cliente_id, formatDate(fecha_inicio), formatDate(fecha_fin), precio_total, req.params.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ message: "Alquiler no encontrado" });
        }

        const [rows] = await pool.query("SELECT * FROM alquileres WHERE id = ?", [req.params.id]);
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

/**
 * DELETE /alquileres/:id
 */
export const deleteAlquiler = async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM alquileres WHERE id = ?", [req.params.id]);
        if (!result.affectedRows) {
            return res.status(404).json({ message: "Alquiler no encontrado" });
        }
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

/**
 * GET /alquileres/:id/factura
 */
export const getFacturaAlquiler = async (req, res) => {
    try {
        const sql = `
            SELECT
                c.nombre,
                c.dni,
                c.email,
                a.fecha_inicio,
                a.fecha_fin,
                a.precio_total,
                m.nombre AS moto_alquilada,
                m.precio AS precio_dia
            FROM alquileres a
            INNER JOIN clientes c ON a.cliente_id = c.id
            INNER JOIN motos m ON a.moto_id = m.id
            WHERE a.id = ?;
        `;
        const [rows] = await pool.query(sql, [req.params.id]);

        if (!rows.length) {
            return res.status(404).json({ message: "Factura no encontrada" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        const status = error.code === 'ECONNREFUSED' ? 503 : 500;
        const msg = error.code === 'ECONNREFUSED' ? "Servicio de base de datos no disponible" : "Error interno del servidor";
        res.status(status).json({ message: msg });
    }
};
