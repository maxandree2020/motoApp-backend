import { Router } from "express";
import {getVenta,getVentas,addVenta,updateVenta,deleteVenta,getMotosDisponibles}
 from "../controllers/ventas.controller.js";

const router = Router()

// Rutas estáticas primero
router.get("/ventas/all", getVentas);
router.get("/ventas/disponible", getMotosDisponibles);

// Rutas con parámetros al final
router.get("/ventas/:id", getVenta);
router.post("/ventas/add", addVenta);
router.patch("/ventas/:id", updateVenta);
router.delete("/ventas/:id", deleteVenta);

export default router;
