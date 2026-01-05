// tests/clientes.integration.test.js
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { pool } from '../../src/db.js';
import app from '../../src/app.js';

// Mock auth si es necesario
vi.mock('../../src/middlewares/authMiddleware.js', () => ({
  verifyToken: (req, res, next) => next()
}));

describe('Integración: Clientes', () => {
  let clienteId;

  beforeAll(async () => {
    // Crear cliente de prueba
    const [clienteResult] = await pool.query(
      "INSERT INTO clientes (dni, nombre, email, cel, dir) VALUES (?, ?, ?, ?, ?)",
      ['12345678', 'ClienteTest', 'test@email.com', '999999999', 'Calle Test 123']
    );
    clienteId = clienteResult.insertId;
  });

  afterAll(async () => {
    // Limpiar base de datos
    await pool.query("DELETE FROM clientes WHERE id = ?", [clienteId]);
    await pool.end();
  });

  it('GET /clientes → lista todos los clientes', async () => {
    const res = await request(app).get('/clientes/all');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /clientes/:id → obtiene cliente por ID', async () => {
    const res = await request(app).get(`/clientes/${clienteId}`);
    expect(res.status).toBe(200);
    expect(res.body[0].nombre).toBe('ClienteTest');
  });

  it('GET /clientes/:id → retorna 400 si no existe', async () => {
    const res = await request(app).get('/clientes/999999');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('cliente not found');
  });

  it('POST /clientes/add → agrega un nuevo cliente', async () => {
    const nuevoCliente = {
      dni: '87654321',
      nombre: 'ClienteNuevo',
      email: 'nuevo@email.com',
      cel: '988888888',
      dir: 'Calle Nueva 456'
    };
    const res = await request(app).post('/clientes/add').send(nuevoCliente);
    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('ClienteNuevo');

    // Limpiar cliente agregado
    await pool.query("DELETE FROM clientes WHERE dni = ?", [nuevoCliente.dni]);
  });

  it('PATCH /clientes/:id → actualiza un cliente', async () => {
    const res = await request(app)
      .patch(`/clientes/${clienteId}`)
      .send({ nombre: 'ClienteActualizado', email: 'actualizado@email.com' });

    expect(res.status).toBe(200);
    expect(res.body[0].nombre).toBe('ClienteActualizado');
    expect(res.body[0].email).toBe('actualizado@email.com');
  });

  it('PATCH /clientes/:id → retorna 400 si no existe', async () => {
    const res = await request(app)
      .patch('/clientes/999999')
      .send({ nombre: 'NoExiste' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('cliente no encontrada');
  });

  it('DELETE /clientes/:id → elimina un cliente', async () => {
    // Crear cliente temporal para eliminar
    const [tempCliente] = await pool.query(
      "INSERT INTO clientes (dni, nombre, email, cel, dir) VALUES (?, ?, ?, ?, ?)",
      ['55555555', 'EliminarCliente', 'elim@email.com', '977777777', 'Calle Eliminar 7']
    );
    const tempId = tempCliente.insertId;

    const res = await request(app).delete(`/clientes/${tempId}`);
    expect(res.status).toBe(204);

    // Verificar que ya no existe
    const [rows] = await pool.query("SELECT * FROM clientes WHERE id = ?", [tempId]);
    expect(rows.length).toBe(0);
  });

  it('DELETE /clientes/:id → retorna 404 si no existe', async () => {
    const res = await request(app).delete('/clientes/999999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('cliente not found');
  });
});