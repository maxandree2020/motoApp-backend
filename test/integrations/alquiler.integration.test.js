import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Mock del middleware de autenticación
vi.mock('../../src/middlewares/authMiddleware.js', () => ({
  verifyToken: (req, res, next) => next()
}));

import app from '../../src/app.js';


/* ======================================================
   Integración: Alquileres (GET y POST)
====================================================== */

describe('Integración: Alquileres', () => {

  it('GET /alquileres/all → lista alquileres', async () => {
    const res = await request(app).get('/alquileres/all');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /alquileres/add → crea alquiler', async () => {
    const alquiler = {
      moto_id: 6,
      cliente_id: 1,
      fecha_inicio: '2026-01-01',
      fecha_fin: '2026-01-03',
      precio_total: 150
    };

    const res = await request(app)
      .post('/alquileres/add')
      .send(alquiler);

    expect(res.status).toBe(201);
    expect(res.body).toBeDefined();
  });

});




describe('Integración: updateAlquiler y deleteAlquiler', () => {

  let alquilerId=32;

  it('PATCH /alquileres/:id → actualiza un alquiler', async () => {
    const res = await request(app)
      .patch(`/alquileres/${alquilerId}`)
      .send({
        moto_id: 6,
        cliente_id: 1,
        fecha_inicio: '2026-01-01',
        fecha_fin: '2026-01-05',
        precio_total: 250
      });

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });


  it('DELETE /alquileres/:id → elimina un alquiler', async () => {
    const res = await request(app)
      .delete(`/alquileres/${alquilerId}`);

    expect(res.status).toBe(204);
  });

});
