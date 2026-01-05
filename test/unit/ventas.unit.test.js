
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 🔥 mock db.js (TODO dentro del factory)
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

// ahora sí se importa el controller
import {
  getVentas,
  getVenta,
  addVenta,
  updateVenta,
  deleteVenta,
  getMotosDisponibles
} from '../../src/controllers/ventas.controller.js';

// helper para res
const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.sendStatus = vi.fn().mockReturnValue(res);
  return res;
};

// acceso al mock
import { pool } from '../../src/db.js';

describe('Controller: Ventas (Unitarias)', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getVentas → retorna ventas', async () => {
    pool.query.mockResolvedValue([[{ id: 1 }]]);

    const res = mockRes();
    await getVentas({}, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it('getVentas → error 500', async () => {
    pool.query.mockRejectedValue(new Error());

    const res = mockRes();
    await getVentas({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('getVenta → no encontrada', async () => {
    pool.query.mockResolvedValue([[]]);

    const req = { params: { id: 99 } };
    const res = mockRes();

    await getVenta(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updateVenta → actualiza', async () => {
    pool.query
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ id: 1 }]]);

    const req = {
      params: { id: 1 },
      body: { moto_id: 1, cliente_id: 1, fecha_venta: new Date(), precio: 100 }
    };

    const res = mockRes();
    await updateVenta(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  it('deleteVenta → elimina', async () => {
    pool.query.mockResolvedValue([{ affectedRows: 1 }]);

    const req = { params: { id: 1 } };
    const res = mockRes();

    await deleteVenta(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  it('getMotosDisponibles → lista', async () => {
    pool.query.mockResolvedValue([[{ id: 1 }]]);

    const res = mockRes();
    await getMotosDisponibles({}, res);

    expect(res.json).toHaveBeenCalled();
  });
});
