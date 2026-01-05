import { Router } from "express";
import {getMotosEnVenta,getMotosEnAlquiler,getMotoPorId,getTodasMotos,getMotosGeneral, getActiveAlquilerMotos}
 from "../controllers/marketplace.controller.js";

const router = Router()

router.get("/motosventa/all",getMotosEnVenta)
router.get("/motosalquiler/all",getMotosEnAlquiler)
router.get("/motos/todas", getTodasMotos);
router.get("/motos_general", getMotosGeneral);
router.get("/motos/:id",getMotoPorId)
router.get("/getActiveAlquilerMotos",getActiveAlquilerMotos)
export default router;
