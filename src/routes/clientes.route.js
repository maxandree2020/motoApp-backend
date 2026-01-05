import { Router } from "express";
import {getClientes,getCliente,addCliente,updateCliente,deleteCliente }
 from "../controllers/clientes.controller.js";

const router = Router()

router.get("/clientes/all",getClientes)
router.get("/clientes/:id",getCliente)
router.post("/clientes/add",addCliente)
router.patch("/clientes/:id",updateCliente)
router.delete("/clientes/:id",deleteCliente)

export default router;