import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DB
vi.mock('../../src/db.js', () => ({
  pool: {
    query: vi.fn()
  }
}));

import { pool } from '../../src/db.js';
import {
  subirImagenes,
  obtenerImagenes,
  eliminarImagen
} from '../../src/controllers/motoImagenesController.js';

describe('Unit: motoImagenes.controller', () => {

  let req, res;

  beforeEach(() => {
    req = {
      params: { id: 1 },
      files: []
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      sendStatus: vi.fn()
    };

    vi.clearAllMocks();
  });

  // =========================
  // subirImagenes
  // =========================
  it('subirImagenes → 400 si no se envían imágenes', async () => {
    req.files = [];

    await subirImagenes(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No se subieron imágenes'
    });
  });

  it('subirImagenes → guarda imágenes y retorna 201', async () => {
    req.files = [
      { filename: 'img1.jpg' },
      { filename: 'img2.png' }
    ];

    pool.query.mockResolvedValue([{}]);

    await subirImagenes(req, res);

    expect(pool.query).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Imágenes subidas correctamente',
      data: [
        [1, '/uploads/motos/img1.jpg'],
        [1, '/uploads/motos/img2.png']
      ]
    });
  });

  it('subirImagenes → 500 si ocurre error', async () => {
    req.files = [{ filename: 'img.jpg' }];
    pool.query.mockRejectedValue(new Error('DB error'));

    await subirImagenes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =========================
  // obtenerImagenes
  // =========================
  it('obtenerImagenes → devuelve imágenes de la moto', async () => {
    pool.query.mockResolvedValue([[
      { id: 1, imagen_url: '/uploads/motos/a.jpg' }
    ]]);

    await obtenerImagenes(req, res);

    expect(res.json).toHaveBeenCalledWith([
      { id: 1, imagen_url: '/uploads/motos/a.jpg' }
    ]);
  });

  it('obtenerImagenes → 404 si no hay imágenes', async () => {
    pool.query.mockResolvedValue([[]]);

    await obtenerImagenes(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No se encontraron imágenes para esta moto'
    });
  });

  it('obtenerImagenes → 500 en error', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await obtenerImagenes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =========================
  // eliminarImagen
  // =========================
  it('eliminarImagen → elimina imagen y retorna 204', async () => {
    req.params.id = 10;
    pool.query.mockResolvedValue([{ affectedRows: 1 }]);

    await eliminarImagen(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  it('eliminarImagen → 404 si imagen no existe', async () => {
    pool.query.mockResolvedValue([{ affectedRows: 0 }]);

    await eliminarImagen(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Imagen no encontrada'
    });
  });

  it('eliminarImagen → 500 si hay error', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await eliminarImagen(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

});
