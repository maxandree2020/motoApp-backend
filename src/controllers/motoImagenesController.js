import { pool } from '../db.js';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

// 📌 Configuración de Multer para guardar imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ruta absoluta relativa al proyecto
        const dir = path.join(process.cwd(), 'src', 'uploads', 'motos');

        // Crear la carpeta si no existe
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Nombre único basado en fecha y extensión
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// 📌 Filtro para aceptar solo imágenes JPG o PNG
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes JPG o PNG'));
    }
};

// 📌 Configuración final de Multer
export const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Máx. 2MB
    fileFilter
});

// 📌 Subir imágenes
export const subirImagenes = async (req, res) => {
    try {
        const motoId = req.params.id;
        const imagenes = req.files;

        if (!imagenes || imagenes.length === 0) {
            return res.status(400).json({ message: 'No se subieron imágenes' });
        }

        // Guardar rutas en la BD
        const values = imagenes.map(img => [motoId, `/uploads/motos/${img.filename}`]);
        const sql = 'INSERT INTO moto_imagenes (moto_id, imagen_url) VALUES ?';
        await pool.query(sql, [values]);

        res.status(201).json({ message: 'Imágenes subidas correctamente', data: values });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

// 📌 Obtener imágenes de una moto
export const obtenerImagenes = async (req, res) => {
    try {
        const motoId = req.params.id;
        const sql = 'SELECT id,imagen_url FROM moto_imagenes WHERE moto_id = ?';
        const [rows] = await pool.query(sql, [motoId]);

        if (rows.length <= 0) {
            return res.status(404).json({ message: 'No se encontraron imágenes para esta moto' });
        }

        res.json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

// 📌 Eliminar una imagen
export const eliminarImagen = async (req, res) => {
    try {
        const sql = 'DELETE FROM moto_imagenes WHERE id = ?';
        const [result] = await pool.query(sql, [req.params.id]);

        if (result.affectedRows <= 0) {
            return res.status(404).json({ message: 'Imagen no encontrada' });
        }

        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};
