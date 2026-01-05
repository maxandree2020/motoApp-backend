import { describe, it, expect, vi, beforeEach } from 'vitest';

// ✅ mock primero
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn()
  }
}));

import jwt from 'jsonwebtoken';
import { verifyToken } from '../../src/middlewares/authMiddleware.js';

describe('Unit: verifyToken middleware', () => {

  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    next = vi.fn();

    vi.clearAllMocks();
  });

  it('401 si no se envía Authorization header', () => {
    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token no proporcionado'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it(' 401 si el header no contiene token', () => {
    req.headers.authorization = 'Bearer';

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token inválido'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it(' 403 si jwt.verify lanza error', () => {
    req.headers.authorization = 'Bearer token_falso';

    jwt.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token expirado o inválido'
    });
    expect(next).not.toHaveBeenCalled();
  });

});
