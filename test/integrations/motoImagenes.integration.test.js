import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import path from 'node:path';
import fs from 'node:fs';
import app from '../../src/app.js';
import { pool } from '../../src/db.js';

// Mock auth
vi.mock('../../src/middlewares/authMiddleware.js', () => ({
  verifyToken: (req, res, next) => next()
}));

let motoId;
let imagenId;

describe('Integración: Moto Imágenes', () => {

  beforeAll(async () => {
    // Crear moto
    const [result] = await pool.query(
      "INSERT INTO motos (nombre, descrip, tipo, precio, disponible) VALUES (?,?,?,?,?)",
      ['Moto Test', 'Test', 'venta', 1000, 1]
    );
    motoId = result.insertId;

    // Imagen dummy
    const dir = path.join(process.cwd(), 'test/fixtures');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'imagen1.jpg'), 'fake-image');
  });

  it('POST /motos/:id/imagenes → subir imágenes', async () => {
    const res = await request(app)
      .post(`/motos/${motoId}/imagenes`)
      .attach('imagenes', path.join(process.cwd(), 'test/fixtures/imagen1.jpg'));

    expect(res.status).toBe(201);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(Number(res.body.data[0][0])).toBe(motoId);
  });

  it('GET /motos/:id/imagenes → obtener imágenes', async () => {
    const res = await request(app).get(`/motos/${motoId}/imagenes`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);

    imagenId = res.body[0].id; // ✅ AQUÍ se obtiene bien
    expect(imagenId).toBeDefined();
  });

  it('DELETE /motos/imagenes/:id → eliminar imagen', async () => {
    const res = await request(app).delete(`/motos/imagenes/${imagenId}`);
    expect(res.status).toBe(204);
  });

  it('GET /motos/:id/imagenes → retorna 404 si no hay imágenes', async () => {
    const res = await request(app).get(`/motos/${motoId}/imagenes`);
    expect(res.status).toBe(404);
    expect(res.body.message).toContain('No se encontraron imágenes');
  });

});
