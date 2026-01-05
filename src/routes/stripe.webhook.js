
import Stripe from "stripe";
import dotenv from "dotenv";
import { pool } from "../db.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function stripeWebhookHandler(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Error validando webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata || {};
    const { motoId, dni, nombre, email, cel, dir, tipo, fechaInicio, fechaFin } = meta;
    const precio = session.amount_total / 100;

    if (!motoId || !dni || !nombre || !email || !tipo) {
      console.error("❌ Metadata incompleta:", meta);
      return res.status(400).send("Metadata incompleta");
    }

    try {
      // Verificar o crear cliente
      let clienteId;
      const [clientes] = await pool.query(
        "SELECT id FROM clientes WHERE dni = ? OR email = ?",
        [dni, email]
      );

      if (clientes.length > 0) {
        clienteId = clientes[0].id;
      } else {
        const [result] = await pool.query(
          "INSERT INTO clientes (dni, nombre, email, cel, dir) VALUES (?, ?, ?, ?, ?)",
          [dni, nombre, email, cel || "", dir || ""]
        );
        clienteId = result.insertId;
      }

      if (tipo === "venta") {
        await pool.query(
          "INSERT INTO ventas (moto_id, cliente_id, fecha_venta, precio) VALUES (?, ?, CURDATE(), ?)",
          [motoId, clienteId, precio]
        );
        await pool.query("UPDATE motos SET disponible = false WHERE id = ?", [motoId]);
        console.log(`✅ Venta registrada: Moto ${motoId} para cliente ${clienteId}`);
      } else if (tipo === "alquiler") {
        await pool.query(
          "INSERT INTO alquileres (moto_id, cliente_id, fecha_inicio, fecha_fin, precio_total) VALUES (?, ?, ?, ?, ?)",
          [motoId, clienteId, fechaInicio, fechaFin, precio]
        );
        console.log(`🏍️ Alquiler registrado: Moto ${motoId} para cliente ${clienteId}`);
      }
    } catch (dbError) {
      console.error("❌ Error registrando en DB:", dbError);
      return res.status(500).send("Error interno al registrar operación");
    }
  }

  res.json({ received: true });
}
