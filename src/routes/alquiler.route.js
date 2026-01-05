import { Router } from "express";
import {getAlquileres,getAlquiler,addAlquiler,updateAlquiler,deleteAlquiler,getFacturaAlquiler}
 from "../controllers/alquiler.controller.js";

const router = Router()

router.get("/alquileres/all",getAlquileres)
router.get("/alquileres/:id",getAlquiler)
router.post("/alquileres/add",addAlquiler)
router.patch("/alquileres/:id",updateAlquiler)
router.delete("/alquileres/:id",deleteAlquiler)

router.get("/alquileres/factura/:id",getFacturaAlquiler)

export default router;