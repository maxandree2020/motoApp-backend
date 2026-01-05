// import { describe, it, expect, vi } from 'vitest'
// import request from 'supertest'

// // mock auth
// vi.mock('../../src/middlewares/authMiddleware.js', () => ({
//   verifyToken: (req, res, next) => next()
// }))

// import app from '../../src/app.js'

// describe('Integración: Ventas', () => {

//   it('GET /ventas/all → lista ventas', async () => {
//     const res = await request(app).get('/ventas/all')

//     expect(res.status).toBe(200)
//     expect(Array.isArray(res.body)).toBe(true)
//   })

//   it('POST /ventas/add → valida reglas de negocio', async () => {
//     const venta = {
//       moto_id: 99999,      // ❌ moto inexistente (controlado)
//       cliente_id: 1
//     }

//     const res = await request(app)
//       .post('/ventas/add')
//       .send(venta)

//     // ✔ comportamiento esperado según tu controller
//     expect([201, 404, 409]).toContain(res.status)

//     if (res.status === 201) {
//       expect(res.body.ventaId).toBeDefined()
//     }

//     if (res.status === 404) {
//       expect(res.body.message).toContain('Moto')
//     }

//     if (res.status === 409) {
//       expect(res.body.message).toContain('vendida')
//     }
//   })

// })


import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { pool } from '../../src/db.js';
import { format } from 'date-fns';

// mock auth
vi.mock('../../src/middlewares/authMiddleware.js', () => ({
  verifyToken: (req, res, next) => next()
}));

import app from '../../src/app.js';

describe('Integración: Ventas', () => {
  let ventaId;
  let motoId;
  let clienteId;

  beforeAll(async () => {
    // Crear datos de prueba
    const [motoResult] = await pool.query(
      "INSERT INTO motos (nombre, tipo, precio, disponible) VALUES ('MotoTest', 'venta', 1000, true)"
    );
    motoId = motoResult.insertId;

    const [clienteResult] = await pool.query(
      "INSERT INTO clientes (dni,nombre, email,cel,dir) VALUES ('34567898','ClienteTest','mjdhf@jkjk','3334355','uygsfdhdg')"
    );
    clienteId = clienteResult.insertId;

    const [ventaResult] = await pool.query(
      "INSERT INTO ventas (moto_id, cliente_id, fecha_venta, precio) VALUES (?, ?, NOW(), ?)",
      [motoId, clienteId, 1000]
    );
    ventaId = ventaResult.insertId;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await pool.query("DELETE FROM ventas WHERE id = ?", [ventaId]);
    await pool.query("DELETE FROM motos WHERE id = ?", [motoId]);
    await pool.query("DELETE FROM clientes WHERE id = ?", [clienteId]);
    await pool.end();
  });

  it('GET /ventas/all → lista ventas', async () => {
    const res = await request(app).get('/ventas/all');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /ventas/add → valida reglas de negocio', async () => {
    const venta = { moto_id: 99999, cliente_id: 1 };
    const res = await request(app).post('/ventas/add').send(venta);

    expect([201, 404, 409]).toContain(res.status);

    if (res.status === 201) expect(res.body.ventaId).toBeDefined();
    if (res.status === 404) expect(res.body.message).toContain('Moto');
    if (res.status === 409) expect(res.body.message).toContain('vendida');
  });

  it('PATCH /ventas/:id → actualiza correctamente una venta', async () => {
    const nuevaFecha = new Date("2026-01-01 10:00:00");
    const nuevoPrecio = 1500;

    const res = await request(app)
      .patch(`/ventas/${ventaId}`)
      .send({
        moto_id: motoId,
        cliente_id: clienteId,
        fecha_venta: nuevaFecha,
        precio: nuevoPrecio
      });

    expect(res.status).toBe(200);
    // expect(res.body[0].precio).toBe(nuevoPrecio);
      expect(parseFloat(res.body[0].precio)).toBe(nuevoPrecio);

    expect(
      format(new Date(res.body[0].fecha_venta), "yyyy-MM-dd HH:mm:ss")
    ).toBe(format(nuevaFecha, "yyyy-MM-dd HH:mm:ss"));
  });

  it('PATCH /ventas/:id → retorna 404 si la venta no existe', async () => {
    const res = await request(app)
      .patch("/ventas/999999")
      .send({
        moto_id: motoId,
        cliente_id: clienteId,
        fecha_venta: new Date(),
        precio: 500
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("venta no encontrada");
  });
});
