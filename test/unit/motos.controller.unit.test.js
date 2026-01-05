import { describe, it, expect, vi, beforeEach } from 'vitest';

// 👉 mock del pool
vi.mock('../../src/db.js', () => {
  return {
    pool: {
      query: vi.fn()
    }
  };
});

import { pool } from '../../src/db.js';
import {
  getMotos,
  getMoto,
  addMoto,
  updateMoto,
  deleteMoto
} from '../../src/controllers/motos.controller.js';

describe('Unit: motos.controller', () => {

  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {}
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      sendStatus: vi.fn()
    };

    vi.clearAllMocks();
  });

  // ======================
  // getMotos
  // ======================
  it('getMotos → devuelve lista de motos', async () => {
    pool.query.mockResolvedValue([[{ id: 1, nombre: 'Moto 1' }]]);

    await getMotos(req, res);

    expect(pool.query).toHaveBeenCalledOnce();
    expect(res.json).toHaveBeenCalledWith([{ id: 1, nombre: 'Moto 1' }]);
  });

  it('getMotos → error 500', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await getMotos(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ======================
  // getMoto
  // ======================
  it('getMoto → devuelve una moto', async () => {
    req.params.id = 1;
    pool.query.mockResolvedValue([[{ id: 1, nombre: 'Moto X' }]]);

    await getMoto(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1, nombre: 'Moto X' }]);
  });

  it('getMoto → 400 si no existe', async () => {
    req.params.id = 99;
    pool.query.mockResolvedValue([[]]);

    await getMoto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'moto not found' });
  });

  // ======================
  // addMoto
  // ======================
  it('addMoto → crea moto (201)', async () => {
    req.body = {
      nombre: 'Moto Nueva',
      descrip: 'desc',
      tipo: 'sport',
      precio: 100,
      disponible: true
    };

    pool.query.mockResolvedValue([{ insertId: 5 }]);

    await addMoto(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 5,
      ...req.body
    });
  });

  // ======================
  // updateMoto
  // ======================
  it('updateMoto → actualiza moto', async () => {
    req.params.id = 1;
    req.body = { nombre: 'Moto Editada' };

    pool.query
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // update
      .mockResolvedValueOnce([[{ id: 1, nombre: 'Moto Editada' }]]); // select

    await updateMoto(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1, nombre: 'Moto Editada' }]);
  });

  it('updateMoto → 400 si no existe', async () => {
    req.params.id = 99;
    pool.query.mockResolvedValue([{ affectedRows: 0 }]);

    await updateMoto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'motos no encontrada' });
  });

  // ======================
  // deleteMoto
  // ======================
  it('deleteMoto → 204 si elimina', async () => {
    req.params.id = 1;
    pool.query.mockResolvedValue([{ affectedRows: 1 }]);

    await deleteMoto(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  it('deleteMoto → 404 si no existe', async () => {
    req.params.id = 99;
    pool.query.mockResolvedValue([{ affectedRows: 0 }]);

    await deleteMoto(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'moto not found' });
  });

});
