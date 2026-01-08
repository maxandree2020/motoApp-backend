import { describe, it, expect, vi, beforeEach } from 'vitest';

/* =========================
   Mock DB
========================= */
vi.mock('../../src/db.js', () => {
  const query = vi.fn();
  const getConnection = vi.fn();

  return {
    pool: {
      query,
      getConnection
    }
  };
});

/* =========================
   Import controller
========================= */
import {
  getVentas,
  getVenta,
  addVenta,
  updateVenta,
  deleteVenta,
  getMotosDisponibles
} from '../../src/controllers/ventas.controller.js';

/* =========================
   Helpers
========================= */
const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.sendStatus = vi.fn().mockReturnValue(res);
  return res;
};

import { pool } from '../../src/db.js';

/* =========================
   Tests
========================= */
describe('Controller: Ventas (Unitarias)', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ===== getVentas ===== */
  it('getVentas → retorna ventas', async () => {
    pool.query.mockResolvedValue([[{ id: 1 }]]);

    const res = mockRes();
    await getVentas({}, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it('getVentas → error 500', async () => {
    pool.query.mockRejectedValue(new Error('Database connection failed'));

    const res = mockRes();
    await getVentas({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  /* ===== getVenta ===== */
  it('getVenta → no encontrada', async () => {
    pool.query.mockResolvedValue([[]]);

    const req = { params: { id: 99 } };
    const res = mockRes();

    await getVenta(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('getVenta → error 500', async () => {
    pool.query.mockRejectedValue(new Error('DB error'));

    const req = { params: { id: 1 } };
    const res = mockRes();

    await getVenta(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  /* ===== addVenta ===== */
  it('addVenta → moto no encontrada', async () => {
    const mockConnection = {
      beginTransaction: vi.fn(),
      query: vi.fn().mockResolvedValueOnce([[]]),
      rollback: vi.fn(),
      release: vi.fn()
    };

    pool.getConnection.mockResolvedValue(mockConnection);

    const req = {
      body: { moto_id: 1, cliente_id: 2 }
    };

    const res = mockRes();

    await addVenta(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('addVenta → moto no disponible', async () => {
    const mockConnection = {
      beginTransaction: vi.fn(),
      query: vi.fn().mockResolvedValueOnce([
        [{ precio: 5000, disponible: false }]
      ]),
      rollback: vi.fn(),
      release: vi.fn()
    };

    pool.getConnection.mockResolvedValue(mockConnection);

    const req = {
      body: { moto_id: 1, cliente_id: 2 }
    };

    const res = mockRes();

    await addVenta(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('addVenta → error durante transacción', async () => {
    const mockConnection = {
      beginTransaction: vi.fn(),
      query: vi.fn().mockRejectedValue(new Error('DB error')),
      rollback: vi.fn(),
      release: vi.fn()
    };

    pool.getConnection.mockResolvedValue(mockConnection);

    const req = {
      body: { moto_id: 1, cliente_id: 2 }
    };

    const res = mockRes();

    await addVenta(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  /* ===== updateVenta ===== */
  it('updateVenta → actualiza', async () => {
    pool.query
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ id: 1 }]]);

    const req = {
      params: { id: 1 },
      body: {
        moto_id: 1,
        cliente_id: 1,
        fecha_venta: new Date(),
        precio: 100
      }
    };

    const res = mockRes();
    await updateVenta(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  /* ===== deleteVenta ===== */
  it('deleteVenta → elimina', async () => {
    pool.query.mockResolvedValue([{ affectedRows: 1 }]);

    const req = { params: { id: 1 } };
    const res = mockRes();

    await deleteVenta(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  /* ===== getMotosDisponibles ===== */
  it('getMotosDisponibles → lista', async () => {
    pool.query.mockResolvedValue([[{ id: 1 }]]);

    const res = mockRes();
    await getMotosDisponibles({}, res);

    expect(res.json).toHaveBeenCalled();
  });

  it('getMotosDisponibles → 404 si no hay motos', async () => {
    pool.query.mockResolvedValue([[]]);

    const res = mockRes();
    await getMotosDisponibles({}, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

});
