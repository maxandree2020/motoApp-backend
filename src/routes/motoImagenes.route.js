import { Router } from 'express'
import { upload, subirImagenes, obtenerImagenes, eliminarImagen } from '../controllers/motoImagenesController.js'

const router = Router()

// Subir hasta 3 imágenes para una moto
router.post('/:id/imagenes', upload.array('imagenes', 1), subirImagenes)

// Obtener imágenes de una moto
router.get('/:id/imagenes', obtenerImagenes)

// Eliminar una imagen por su ID
router.delete('/imagenes/:id', eliminarImagen)

export default router
