import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock del pool MySQL
vi.mock('../../src/db.js', () => ({
  pool: {
    query: vi.fn()
  }
}));

import { pool } from '../../src/db.js';
import {
  getMotosEnVenta,
  getMotosEnAlquiler,
  getMotoPorId,
  getTodasMotos,
  getMotosGeneral,
  getActiveAlquilerMotos
} from '../../src/controllers/marketplace.controller.js';

describe('Unit: marketplace.controller', () => {

  let req, res;

  beforeEach(() => {
    req = { params: {} };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    vi.clearAllMocks();
  });

  // =========================
  // getMotosEnVenta
  // =========================
  it('getMotosEnVenta → devuelve motos con imágenes en array', async () => {
    pool.query.mockResolvedValue([[
      {
        id: 1,
        nombre: 'Moto A',
        imagenes: 'img1.jpg,img2.jpg'
      }
    ]]);

    await getMotosEnVenta(req, res);

    expect(res.json).toHaveBeenCalledWith([
      {
        id: 1,
        nombre: 'Moto A',
        imagenes: ['img1.jpg', 'img2.jpg']
      }
    ]);
  });

  it('getMotosEnVenta → 404 si no hay motos', async () => {
    pool.query.mockResolvedValue([[]]);

    await getMotosEnVenta(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  // =========================
  // getMotosEnAlquiler
  // =========================
  it('getMotosEnAlquiler → devuelve motos en alquiler', async () => {
    pool.query.mockResolvedValue([[
      {
        id: 2,
        nombre: 'Moto B',
        imagenes: 'img3.jpg'
      }
    ]]);

    await getMotosEnAlquiler(req, res);

    expect(res.json).toHaveBeenCalledWith([
      {
        id: 2,
        nombre: 'Moto B',
        imagenes: ['img3.jpg']
      }
    ]);
  });

  it('getMotosEnAlquiler → 404 si no hay motos', async () => {
    pool.query.mockResolvedValue([[]]);

    await getMotosEnAlquiler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  // =========================
  // getMotoPorId
  // =========================
  it('getMotoPorId → devuelve moto con imágenes', async () => {
    req.params.id = 1;
    pool.query.mockResolvedValue([[
      {
        id: 1,
        nombre: 'Moto C',
        imagenes: 'a.jpg,b.jpg'
      }
    ]]);

    await getMotoPorId(req, res);

    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      nombre: 'Moto C',
      imagenes: ['a.jpg', 'b.jpg']
    });
  });

  it('getMotoPorId → 404 si no existe', async () => {
    req.params.id = 99;
    pool.query.mockResolvedValue([[]]);

    await getMotoPorId(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  // =========================
  // getTodasMotos
  // =========================
  it('getTodasMotos → devuelve todas las motos', async () => {
    pool.query.mockResolvedValue([[
      { id: 1, nombre: 'Moto X', imagenes: [] }
    ]]);

    await getTodasMotos(req, res);

    expect(res.json).toHaveBeenCalledWith([
      { id: 1, nombre: 'Moto X', imagenes: [] }
    ]);
  });

  // =========================
  // getMotosGeneral
  // =========================
  it('getMotosGeneral → asegura imágenes como array', async () => {
    pool.query.mockResolvedValue([[
      { id: 3, nombre: 'Moto Y', imagenes: ['x.jpg'] }
    ]]);

    await getMotosGeneral(req, res);

    expect(res.json).toHaveBeenCalledWith([
      { id: 3, nombre: 'Moto Y', imagenes: ['x.jpg'] }
    ]);
  });

  // =========================
  // getActiveAlquilerMotos
  // =========================
  it('getActiveAlquilerMotos → devuelve motos disponibles', async () => {
    pool.query.mockResolvedValue([[
      { id: 4, nombre: 'Moto Z', disponible: true }
    ]]);

    await getActiveAlquilerMotos(req, res);

    expect(res.json).toHaveBeenCalledWith([
      { id: 4, nombre: 'Moto Z', disponible: true }
    ]);
  });

  it('getActiveAlquilerMotos → error 500', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await getActiveAlquilerMotos(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

});
