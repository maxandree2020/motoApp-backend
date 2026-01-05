import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { pool } from '../../src/db.js';
import app from '../../src/app.js';

// Mock auth
vi.mock('../../src/middlewares/authMiddleware.js', () => ({
  verifyToken: (req, res, next) => next()
}));

let ventaMotoId;
let alquilerMotoId;

describe('Integración: Marketplace', () => {

  beforeAll(async () => {
    // Limpiar tablas de prueba
    await pool.query("DELETE FROM motos WHERE nombre LIKE 'Moto%'");

    // Insertar moto de venta
    const [ventaMoto] = await pool.query(
      "INSERT INTO motos (nombre, descrip, tipo, precio, disponible) VALUES (?, ?, ?, ?, ?)",
      ['MotoVentaTest', 'Descripcion venta', 'venta', 1000, 1]
    );
    ventaMotoId = ventaMoto.insertId;

    // Insertar moto de alquiler
    const [alquilerMoto] = await pool.query(
      "INSERT INTO motos (nombre, descrip, tipo, precio, disponible) VALUES (?, ?, ?, ?, ?)",
      ['MotoAlquilerTest', 'Descripcion alquiler', 'alquiler', 500, 1]
    );
    alquilerMotoId = alquilerMoto.insertId;
  });

  afterAll(async () => {
    // Limpiar motos de prueba
    await pool.query("DELETE FROM motos WHERE nombre LIKE 'Moto%'");
  });

  it('GET /motosventa/all → motos en venta', async () => {
    const res = await request(app).get('/marketplace/motosventa/all');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const moto = res.body.find(m => m.id === ventaMotoId);
    expect(moto).toBeDefined();
    expect(moto.tipo).toBe('venta');
  });

  it('GET /motosalquiler/all → motos en alquiler', async () => {
    const res = await request(app).get('/marketplace/motosalquiler/all');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const moto = res.body.find(m => m.id === alquilerMotoId);
    expect(moto).toBeDefined();
    expect(moto.tipo).toBe('alquiler');
  });

  it('GET /motos/:id → obtiene moto por ID', async () => {
    const res = await request(app).get(`/marketplace/motos/${ventaMotoId}`);
    expect(res.status).toBe(200);
    expect(Number(res.body.id)).toBe(ventaMotoId);
    expect(Array.isArray(res.body.imagenes)).toBe(true);
  });

  it('GET /motos/:id → retorna 404 si no existe', async () => {
    const res = await request(app).get('/marketplace/motos/999999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Moto no encontrada');
  });

  it('GET /motos/todas → lista todas las motos', async () => {
    const res = await request(app).get('/marketplace/motos/todas');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('GET /motos_general → lista general de motos', async () => {
    const res = await request(app).get('/marketplace/motos_general');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const moto = res.body.find(m => m.id === ventaMotoId);
    expect(moto).toBeDefined();
  });

  it('GET /getActiveAlquilerMotos → motos de alquiler activas disponibles', async () => {
    const res = await request(app).get('/marketplace/getActiveAlquilerMotos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const moto = res.body.find(m => m.id === alquilerMotoId);
    expect(moto).toBeDefined();
  });

});
