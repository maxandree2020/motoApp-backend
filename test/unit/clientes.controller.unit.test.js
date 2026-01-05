import { describe, it, expect, vi, beforeEach } from 'vitest';

// 👉 Mock del pool de MySQL
vi.mock('../../src/db.js', () => ({
  pool: {
    query: vi.fn()
  }
}));

import { pool } from '../../src/db.js';
import {
  getClientes,
  getCliente,
  addCliente,
  updateCliente,
  deleteCliente
} from '../../src/controllers/clientes.controller.js';

describe('Unit: clientes.controller', () => {

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
  // getClientes
  // ======================
  it('getClientes → devuelve lista de clientes', async () => {
    pool.query.mockResolvedValue([[{ id: 1, nombre: 'Juan' }]]);

    await getClientes(req, res);

    expect(pool.query).toHaveBeenCalledOnce();
    expect(res.json).toHaveBeenCalledWith([{ id: 1, nombre: 'Juan' }]);
  });

  it('getClientes → error 500', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    await getClientes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ======================
  // getCliente
  // ======================
  it('getCliente → devuelve un cliente', async () => {
    req.params.id = 1;
    pool.query.mockResolvedValue([[{ id: 1, nombre: 'Ana' }]]);

    await getCliente(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1, nombre: 'Ana' }]);
  });

  it('getCliente → 400 si no existe', async () => {
    req.params.id = 99;
    pool.query.mockResolvedValue([[]]);

    await getCliente(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'cliente not found' });
  });

  // ======================
  // addCliente
  // ======================
  it('addCliente → crea cliente (201)', async () => {
    req.body = {
      dni: '12345678',
      nombre: 'Carlos',
      email: 'carlos@mail.com',
      cel: '999999999',
      dir: 'Av Perú'
    };

    pool.query.mockResolvedValue([{ insertId: 10 }]);

    await addCliente(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(req.body);
  });

  // ======================
  // updateCliente
  // ======================
  it('updateCliente → actualiza cliente', async () => {
    req.params.id = 1;
    req.body = { nombre: 'Carlos Editado' };

    pool.query
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // update
      .mockResolvedValueOnce([[{ id: 1, nombre: 'Carlos Editado' }]]); // select

    await updateCliente(req, res);

    expect(res.json).toHaveBeenCalledWith([
      { id: 1, nombre: 'Carlos Editado' }
    ]);
  });

  it('updateCliente → 400 si no existe', async () => {
    req.params.id = 99;
    pool.query.mockResolvedValue([{ affectedRows: 0 }]);

    await updateCliente(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'cliente no encontrada' });
  });

  // ======================
  // deleteCliente
  // ======================
  it('deleteCliente → 204 si elimina', async () => {
    req.params.id = 1;
    pool.query.mockResolvedValue([{ affectedRows: 1 }]);

    await deleteCliente(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  it('deleteCliente → 404 si no existe', async () => {
    req.params.id = 99;
    pool.query.mockResolvedValue([{ affectedRows: 0 }]);

    await deleteCliente(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'cliente not found' });
  });

});
