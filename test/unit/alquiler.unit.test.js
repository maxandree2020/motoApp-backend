import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAlquileres,getAlquiler, addAlquiler,deleteAlquiler,updateAlquiler} from '../../src/controllers/alquiler.controller.js'
import { pool } from '../../src/db.js'


vi.mock('../../src/db.js', () => ({
  pool: {
    query: vi.fn()
  }
}))

const mockReq = () => ({})

const mockRes = () => {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  res.sendStatus = vi.fn().mockReturnValue(res)
  return res
}
describe('Controller: getAlquileres', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna lista de alquileres', async () => {
    const fakeData = [
      { id: 1, precio_total: 100 },
      { id: 2, precio_total: 200 }
    ]

    pool.query.mockResolvedValueOnce([fakeData])

    const req = mockReq()
    const res = mockRes()

    await getAlquileres(req, res)

    expect(pool.query).toHaveBeenCalledOnce()
    expect(res.json).toHaveBeenCalledWith(fakeData)
  })

  it('retorna error 500 si falla la consulta', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'))

    const req = mockReq()
    const res = mockRes()

    await getAlquileres(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
  })

})



describe('Controller: getAlquiler', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna un alquiler por ID', async () => {
    const fakeData = [{ id: 1, precio_total: 150 }]
    pool.query.mockResolvedValueOnce([fakeData])

    const req = { params: { id: 1 } }
    const res = mockRes()

    await getAlquiler(req, res)

    expect(pool.query).toHaveBeenCalledOnce()
    expect(res.json).toHaveBeenCalledWith(fakeData)
  })

  it('retorna 400 si no existe el alquiler', async () => {
    pool.query.mockResolvedValueOnce([[]])

    const req = { params: { id: 99 } }
    const res = mockRes()

    await getAlquiler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      message: 'alquiler not found'
    })
  })

})

describe('Controller: addAlquiler', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registra un alquiler correctamente', async () => {
    pool.query.mockResolvedValueOnce([{}])

    const req = {
      body: {
        moto_id: 1,
        cliente_id: 2,
        fecha_inicio: '2026-01-01',
        fecha_fin: '2026-01-05',
        precio_total: 300
      }
    }

    const res = mockRes()

    await addAlquiler(req, res)

    expect(pool.query).toHaveBeenCalledOnce()
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        precio_total: 300
      })
    )
  })

})


describe('Controller: deleteAlquiler', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('elimina alquiler correctamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }])

    const req = { params: { id: 1 } }
    const res = mockRes()

    await deleteAlquiler(req, res)

    expect(res.sendStatus).toHaveBeenCalledWith(204)
  })

  it('retorna 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }])

    const req = { params: { id: 99 } }
    const res = mockRes()

    await deleteAlquiler(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
  })

})


describe('Controller: updateAlquiler', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('actualiza un alquiler correctamente', async () => {
    pool.query
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE
      .mockResolvedValueOnce([[{ id: 1, precio_total: 400 }]]) // SELECT

    const req = {
      params: { id: 1 },
      body: {
        moto_id: 1,
        cliente_id: 2,
        fecha_inicio: '2026-01-01',
        fecha_fin: '2026-01-04',
        precio_total: 400
      }
    }

    const res = mockRes()

    await updateAlquiler(req, res)

    expect(pool.query).toHaveBeenCalledTimes(2)
    expect(res.json).toHaveBeenCalled()
  })

  it('retorna 400 si el alquiler no existe', async () => {
  pool.query.mockResolvedValueOnce([{ affectedRows: 0 }])

  const req = {
    params: { id: 99 },
    body: {
      moto_id: 1,
      cliente_id: 1,
      fecha_inicio: '2026-01-01',
      fecha_fin: '2026-01-02',
      precio_total: 100
    }
  }

  const res = mockRes()

  await updateAlquiler(req, res)

  expect(res.status).toHaveBeenCalledWith(400)
  expect(res.json).toHaveBeenCalledWith({
    message: 'alquiler no encontrada'
  })
})

})