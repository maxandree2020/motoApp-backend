import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAlquileres,
  getAlquiler,
  addAlquiler,
  updateAlquiler,
  deleteAlquiler,
  getFacturaAlquiler
} from '../../src/controllers/alquiler.controller.js';
import { pool } from '../../src/db.js';

vi.mock('../../src/db.js', () => ({
  pool: { query: vi.fn() }
}));

/**
 * Helpers para mocks de req y res
 */
const mockReq = (overrides = {}) => ({ ...overrides });
const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.sendStatus = vi.fn().mockReturnValue(res);
  return res;
};

describe('Alquiler Controller', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================
  // GET /alquileres
  // ============================
  describe('getAlquileres', () => {
    it('retorna lista de alquileres', async () => {
      const fakeData = [{ id: 1, precio_total: 100 }, { id: 2, precio_total: 200 }];
      pool.query.mockResolvedValueOnce([fakeData]);

      const req = mockReq();
      const res = mockRes();

      await getAlquileres(req, res);

      expect(pool.query).toHaveBeenCalledOnce();
      expect(res.json).toHaveBeenCalledWith(fakeData);
    });

    it('retorna 500 si falla la consulta', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB error'));

      const req = mockReq();
      const res = mockRes();

      await getAlquileres(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error interno del servidor' });
    });
  });

  // ============================
  // GET /alquileres/:id
  // ============================
  describe('getAlquiler', () => {
    it('retorna un alquiler por ID', async () => {
      const fakeData = [{ id: 1, precio_total: 150 }];
      pool.query.mockResolvedValueOnce([fakeData]);

      const req = mockReq({ params: { id: 1 } });
      const res = mockRes();

      await getAlquiler(req, res);

      expect(pool.query).toHaveBeenCalledOnce();
      expect(res.json).toHaveBeenCalledWith(fakeData[0]);
    });

    it('retorna 404 si no existe el alquiler', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const req = mockReq({ params: { id: 99 } });
      const res = mockRes();

      await getAlquiler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Alquiler no encontrado' });
    });
  });

  // ============================
  // POST /alquileres
  // ============================
  describe('addAlquiler', () => {
    it('registra un alquiler correctamente', async () => {
      pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

      const req = mockReq({
        body: { moto_id: 1, cliente_id: 2, fecha_inicio: '2026-01-01', fecha_fin: '2026-01-05', precio_total: 300 }
      });
      const res = mockRes();

      await addAlquiler(req, res);

      expect(pool.query).toHaveBeenCalledOnce();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, precio_total: 300 })
      );
    });
  });

  // ============================
  // PUT /alquileres/:id
  // ============================
  describe('updateAlquiler', () => {
    it('actualiza un alquiler correctamente', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE
      pool.query.mockResolvedValueOnce([[{ id: 1, precio_total: 400 }]]); // SELECT

      const req = mockReq({
        params: { id: 1 },
        body: { moto_id: 1, cliente_id: 2, fecha_inicio: '2026-01-01', fecha_fin: '2026-01-04', precio_total: 400 }
      });
      const res = mockRes();

      await updateAlquiler(req, res);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({ id: 1, precio_total: 400 });
    });

    it('retorna 404 si el alquiler no existe', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const req = mockReq({
        params: { id: 99 },
        body: { moto_id: 1, cliente_id: 1, fecha_inicio: '2026-01-01', fecha_fin: '2026-01-02', precio_total: 100 }
      });
      const res = mockRes();

      await updateAlquiler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Alquiler no encontrado' });
    });
  });

  // ============================
  // DELETE /alquileres/:id
  // ============================
  describe('deleteAlquiler', () => {
    it('elimina alquiler correctamente', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const req = mockReq({ params: { id: 1 } });
      const res = mockRes();

      await deleteAlquiler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it('retorna 404 si no existe', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const req = mockReq({ params: { id: 99 } });
      const res = mockRes();

      await deleteAlquiler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Alquiler no encontrado' });
    });
  });

  // ============================
  // GET /alquileres/:id/factura
  // ============================
  describe('getFacturaAlquiler', () => {
    it('retorna la factura correctamente', async () => {
      const fakeFactura = [{ nombre: 'Juan', precio_total: 500 }];
      pool.query.mockResolvedValueOnce([fakeFactura]);

      const req = mockReq({ params: { id: 1 } });
      const res = mockRes();

      await getFacturaAlquiler(req, res);

      expect(res.json).toHaveBeenCalledWith(fakeFactura[0]);
    });

    it('retorna 404 si no existe la factura', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const req = mockReq({ params: { id: 99 } });
      const res = mockRes();

      await getFacturaAlquiler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Factura no encontrada' });
    });

    it('retorna 503 si falla la conexión a la DB', async () => {
      pool.query.mockRejectedValueOnce({ code: 'ECONNREFUSED' });

      const req = mockReq({ params: { id: 1 } });
      const res = mockRes();

      await getFacturaAlquiler(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({ message: 'Servicio de base de datos no disponible' });
    });
  });
});
