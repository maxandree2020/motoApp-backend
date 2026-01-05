import { Router } from "express";
import { getMotos,getMoto,addMoto,updateMoto,deleteMoto}
 from "../controllers/motos.controller.js";

const router = Router()

router.get("/motos/all",getMotos)
router.get("/motos/:id",getMoto)
router.post("/motos/add",addMoto)
router.patch("/motos/:id",updateMoto)
router.delete("/motos/:id",deleteMoto)
export default router;

