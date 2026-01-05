// tests/motos.integration.test.js
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { pool } from '../../src/db.js';
import app from '../../src/app.js';

// Mock auth si es necesario
vi.mock('../../src/middlewares/authMiddleware.js', () => ({
  verifyToken: (req, res, next) => next()
}));

describe('Integración: Motos', () => {
  let motoId;

  beforeAll(async () => {
    // Crear moto de prueba
    const [result] = await pool.query(
      "INSERT INTO motos (nombre, descrip, tipo, precio, disponible) VALUES (?, ?, ?, ?, ?)",
      ['MotoTest', 'Descripcion Test', 'venta', 1000, true]
    );
    motoId = result.insertId;
  });

  afterAll(async () => {
    // Limpiar base de datos
    await pool.query("DELETE FROM motos WHERE id = ?", [motoId]);
    await pool.end();
  });

  it('GET /motos/all → lista todas las motos', async () => {
    const res = await request(app).get('/motos/all');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /motos/:id → obtiene moto por ID', async () => {
    const res = await request(app).get(`/motos/${motoId}`);
    expect(res.status).toBe(200);
    expect(res.body[0].nombre).toBe('MotoTest');
  });

  it('GET /motos/:id → retorna 400 si no existe', async () => {
    const res = await request(app).get('/motos/999999');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('moto not found');
  });

  it('POST /motos/add → agrega una nueva moto', async () => {
    const nuevaMoto = {
      nombre: 'MotoNueva',
      descrip: 'Nueva Descripción',
      tipo: 'venta',
      precio: 2000,
      disponible: true
    };
    const res = await request(app).post('/motos/add').send(nuevaMoto);
    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('MotoNueva');

    // Limpiar moto agregada
    await pool.query("DELETE FROM motos WHERE id = ?", [res.body.id]);
  });

  it('PATCH /motos/:id → actualiza una moto', async () => {
    const res = await request(app)
      .patch(`/motos/${motoId}`)
      .send({ nombre: 'MotoActualizada', precio: 1500 });

    expect(res.status).toBe(200);
    expect(res.body[0].nombre).toBe('MotoActualizada');
    expect(Number(res.body[0].precio)).toBe(1500); // DECIMAL como number
  });

  it('PATCH /motos/:id → retorna 400 si no existe', async () => {
    const res = await request(app)
      .patch('/motos/999999')
      .send({ nombre: 'NoExiste' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('motos no encontrada');
  });

  it('DELETE /motos/:id → elimina una moto', async () => {
    // Crear moto temporal para eliminar
    const [tempMoto] = await pool.query(
      "INSERT INTO motos (nombre, descrip, tipo, precio, disponible) VALUES (?, ?, ?, ?, ?)",
      ['EliminarMoto', 'Desc Eliminar', 'venta', 500, true]
    );
    const tempId = tempMoto.insertId;

    const res = await request(app).delete(`/motos/${tempId}`);
    expect(res.status).toBe(204);

    // Verificar que ya no existe
    const [rows] = await pool.query("SELECT * FROM motos WHERE id = ?", [tempId]);
    expect(rows.length).toBe(0);
  });

  it('DELETE /motos/:id → retorna 404 si no existe', async () => {
    const res = await request(app).delete('/motos/999999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('moto not found');
  });
});
