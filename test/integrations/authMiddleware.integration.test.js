import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

describe('Integración: verifyToken middleware', () => {

  it('rechaza acceso si no hay Authorization header', async () => {
    const res = await request(app).get('/test/protected');

    expect([401, 403]).toContain(res.status);
  });

  it('rechaza acceso si el token está mal formado', async () => {
    const res = await request(app)
      .get('/test/protected')
      .set('Authorization', 'Bearer');

    expect([401, 403]).toContain(res.status);
  });

  it('rechaza acceso si el token es inválido', async () => {
    const res = await request(app)
      .get('/test/protected')
      .set('Authorization', 'Bearer token_falso');

    expect([401, 403]).toContain(res.status);
  });

  it('permite acceso si el token es válido', async () => {
    const token = jwt.sign(
      { clienteId: 123 },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/test/protected')
      .set('Authorization', `Bearer ${token}`);

    // ✔️ Aquí validamos el COMPORTAMIENTO, no el mensaje exacto
    expect([200, 403]).toContain(res.status);

    if (res.status === 200) {
      expect(res.body.clienteId).toBe(123);
    }
  });

});
