import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

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

// ================= Helper para mocks =================
const mockQuery = (resolve = [], reject = null) => {
  if (reject) pool.query.mockRejectedValueOnce(reject);
  else pool.query.mockResolvedValueOnce([resolve]);
};

describe('Unit: motoImagenes.controller (mejorado)', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: 1 },
      files: []
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      sendStatus: vi.fn().mockReturnThis()
    };

    // Mocks para filesystem (Multer storage)
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {});

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

  it('subirImagenes → 400 si req.files undefined', async () => {
    req.files = undefined;
    await subirImagenes(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No se subieron imágenes'
    });
  });

  it('subirImagenes → guarda imágenes correctamente', async () => {
    req.files = [
      { filename: 'img1.jpg' },
      { filename: 'img2.png' }
    ];

    mockQuery({}); // Simula INSERT exitoso
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

  it('subirImagenes → 500 si ocurre error en DB', async () => {
    req.files = [{ filename: 'img.jpg' }];
    mockQuery([], new Error('DB error'));

    await subirImagenes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'DB error' })
    );
  });

  // =========================
  // obtenerImagenes
  // =========================
  it('obtenerImagenes → devuelve imágenes de la moto', async () => {
    mockQuery([{ id: 1, imagen_url: '/uploads/motos/a.jpg' }]);

    await obtenerImagenes(req, res);

    expect(res.json).toHaveBeenCalledWith([
      { id: 1, imagen_url: '/uploads/motos/a.jpg' }
    ]);
  });

  it('obtenerImagenes → 404 si no hay imágenes', async () => {
    mockQuery([]);

    await obtenerImagenes(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No se encontraron imágenes para esta moto'
    });
  });

  it('obtenerImagenes → 500 si hay error DB', async () => {
    mockQuery([], new Error('DB error'));

    await obtenerImagenes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'DB error' })
    );
  });

  // =========================
  // eliminarImagen
  // =========================
  it('eliminarImagen → elimina imagen y retorna 204', async () => {
    req.params.id = 10;
    mockQuery({ affectedRows: 1 });

    await eliminarImagen(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  it('eliminarImagen → 404 si imagen no existe', async () => {
    mockQuery({ affectedRows: 0 });

    await eliminarImagen(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Imagen no encontrada'
    });
  });

  it('eliminarImagen → 500 si hay error DB', async () => {
    mockQuery([], new Error('DB error'));

    await eliminarImagen(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'DB error' })
    );
  });
});
