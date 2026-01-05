import { pool } from '../db.js';
export const getMotosEnVenta = async (req, res) => {
  try {
    const sql = `
      SELECT
        m.id,
        m.nombre,
        m.descrip,
        m.tipo,
        m.precio,
        GROUP_CONCAT(mi.imagen_url) AS imagenes
      FROM motos m
      LEFT JOIN moto_imagenes mi ON m.id = mi.moto_id
      WHERE m.tipo = 'venta' AND m.disponible = true
      GROUP BY m.id;
    `;

    const [rows] = await pool.query(sql);

    // Convertir string de imágenes en array
    const motos = rows.map((moto) => ({
      ...moto,
      imagenes: moto.imagenes ? moto.imagenes.split(',') : [],
    }));

    if (!motos.length) {
      return res.status(404).json({ message: "No hay motos en venta disponibles." });
    }

    res.json(motos);
  } catch (error) {
    console.error("Error en getMotosEnVenta:", error);
    res.status(500).json({ message: "Error en el servidor." });
  }
};

export const getMotosEnAlquiler = async (req, res) => {
  try {
    const sql = `
      SELECT
        m.id,
        m.nombre,
        m.descrip,
        m.tipo,
        m.precio,
        GROUP_CONCAT(mi.imagen_url) AS imagenes
      FROM motos m
      LEFT JOIN moto_imagenes mi ON m.id = mi.moto_id
      WHERE m.tipo = 'alquiler' AND m.disponible = true
      GROUP BY m.id;
    `;

    const [rows] = await pool.query(sql);

    const motos = rows.map((moto) => ({
      ...moto,
      imagenes: moto.imagenes ? moto.imagenes.split(',') : [],
    }));

    if (!motos.length) {
      return res.status(404).json({ message: "No hay motos disponibles para alquiler." });
    }

    res.json(motos);
  } catch (error) {
    console.error("Error en getMotosEnAlquiler:", error);
    res.status(500).json({ message: "Error en el servidor." });
  }
};

export const getMotoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT
                m.id,
                m.nombre,
                m.descrip,
                m.tipo,
                m.precio,
                m.disponible,
                GROUP_CONCAT(mi.imagen_url) AS imagenes
            FROM
                motos m
            LEFT JOIN
                moto_imagenes mi ON m.id = mi.moto_id
            WHERE
                m.id = ?
            GROUP BY
                m.id;
        `;
        const [rows] = await pool.query(sql, [id]);

        if (rows.length <= 0) {
            return res.status(404).json({ message: "Moto no encontrada" });
        }
        
        const moto = rows[0];
        // Convertir la cadena de imágenes a un array
        if (moto.imagenes) {
            moto.imagenes = moto.imagenes.split(',');
        } else {
            moto.imagenes = [];
        }

        res.json(moto);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Ocurrió un error en el servidor" });
    }
};

// marketplace.controller.js

export const getTodasMotos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.id, 
        m.nombre, 
        m.descrip, 
        m.tipo, 
        m.precio, 
        m.disponible,
        COALESCE(JSON_ARRAYAGG(mi.imagen_url), JSON_ARRAY()) AS imagenes
      FROM motos m
      LEFT JOIN moto_imagenes mi ON m.id = mi.moto_id
      GROUP BY m.id
      ORDER BY m.id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error obteniendo todas las motos:", error);
    res.status(500).json({ error: "Error al obtener todas las motos" });
  }
};


//Nuevo get de las motos
export const getMotosGeneral = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.id, 
        m.nombre, 
        m.descrip, 
        m.tipo, 
        m.precio, 
        m.disponible,
        COALESCE(JSON_ARRAYAGG(mi.imagen_url), JSON_ARRAY()) AS imagenes
      FROM motos m
      LEFT JOIN moto_imagenes mi ON m.id = mi.moto_id
      GROUP BY m.id
      ORDER BY m.id DESC
    `);

    // Convertir imagenes a array si es necesario (MySQL devuelve JSON_ARRAY)
    const motos = rows.map((moto) => ({
      ...moto,
      imagenes: Array.isArray(moto.imagenes) ? moto.imagenes : [],
    }));

    res.json(motos);
  } catch (error) {
    console.error("❌ Error obteniendo motos:", error);
    res.status(500).json({ error: "Error al obtener motos" });
  }
};




export const getActiveAlquilerMotos = async (req, res) => {
  try {
    const sql = `
      SELECT m.id, m.nombre, m.descrip, m.precio, m.disponible
      FROM motos m
      WHERE m.tipo = 'alquiler'
        AND m.disponible = TRUE
        AND NOT EXISTS (
          SELECT 1
          FROM alquileres a
          WHERE a.moto_id = m.id
            AND CURDATE() BETWEEN a.fecha_inicio AND a.fecha_fin
        )
      ORDER BY m.id DESC
    `;
    
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener motos disponibles en alquiler:", error);
    return res.status(500).json({ message: "Error en el servidor", error });
  }
};
