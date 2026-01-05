// src/routes/stripe.route.js
/*import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { pool } from "../db.js"; // Asegúrate que tu pool esté exportado desde db.js

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Endpoint para crear sesión de checkout
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { motoId, nombre, email, direccion } = req.body;

    // Obtener datos de la moto
    const [rows] = await pool.query(
      `SELECT nombre, precio FROM motos WHERE id = ?`,
      [motoId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Moto no encontrada" });
    }

    const moto = rows[0];

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: moto.nombre,
              description: `Compra de moto: ${moto.nombre}`,
            },
            unit_amount: moto.precio * 1, // Stripe trabaja en centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email,
      success_url: `${process.env.FRONTEND_URL}/comprar`,
      cancel_url: `${process.env.FRONTEND_URL}/comprar/${motoId}`,
      metadata: {
        nombre,
        direccion,
        motoId,
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creando sesión de Stripe:", error);
    res.status(500).json({ message: "Error creando sesión de pago" });
  }
});

export default router;
*/
// ⚠️ Importante: usar express.raw para Stripe
/*import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { pool } from "../db.js";

dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Webhook de Stripe (sin JSON parser)
router.post("/webhook", express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`⚠️  Error verificando webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar evento
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log("✅ Pago completado:", session);
    // Aquí podrías guardar en la base de datos
  }

  res.json({ received: true });
});

export default router;
*/
/*
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


router.post("/create-checkout-session", async (req, res) => {
  try {
    const { motoId, dni, nombre, email, cel, dir, precio } = req.body;

    if (!motoId || !dni || !nombre || !email || !cel || !dir || !precio) {
      return res.status(400).json({ error: "Faltan datos para crear el pago" });
    }

    // Convertir a número y centavos
    const precioCentavos = Math.round(Number(precio) * 100);

    if (isNaN(precioCentavos) || precioCentavos <= 0) {
      return res.status(400).json({ error: "Precio inválido" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Compra Moto #${motoId}`,
              description: "Pago seguro vía Stripe",
            },
            unit_amount: precioCentavos, // en centavos
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: { motoId, dni, nombre, email, cel, dir },
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Error creando sesión de Stripe:", error);
    res.status(500).json({ error: "No se pudo crear la sesión de pago" });
  }
});



router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Error validando webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Cuando el pago se complete
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata;

    try {
      // 1️⃣ Verificar si el cliente existe
      let clienteId;
      const [clientes] = await pool.query(
        "SELECT id FROM clientes WHERE email = ?",
        [meta.email]
      );

      if (clientes.length > 0) {
        clienteId = clientes[0].id;
        console.log(`👤 Cliente existente con ID ${clienteId}`);
      } else {
        // 2️⃣ Crear cliente
        const [result] = await pool.query(
          "INSERT INTO clientes (dni, nombre, email, cel, dir) VALUES (?, ?, ?, ?, ?)",
          [meta.dni, meta.nombre, meta.email, meta.cel, meta.dir]
        );
        clienteId = result.insertId;
        console.log(`🆕 Cliente creado con ID ${clienteId}`);
      }

      // 3️⃣ Insertar venta
      const precioUSD = session.amount_total / 100;
      await pool.query(
        "INSERT INTO ventas (moto_id, cliente_id, fecha_venta, precio) VALUES (?, ?, CURDATE(), ?)",
        [meta.motoId, clienteId, precioUSD]
      );

      console.log(`✅ Venta registrada: Moto ${meta.motoId} para cliente ${clienteId}`);
    } catch (error) {
      console.error("❌ Error guardando venta:", error);
    }
  }

  res.json({ received: true });
});

export default router;
*/

// src/routes/stripe.route.js
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { pool } from "../db.js";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { motoId, dni, nombre, email, cel, dir, precio, tipo, fechaInicio, fechaFin } = req.body;

    if (!motoId || !dni || !nombre || !email || !cel || !dir || !precio || !tipo) {
      return res.status(400).json({ error: "Faltan datos para crear el pago" });
    }

    const precioCentavos = Math.round(Number(precio) * 100);
    if (isNaN(precioCentavos) || precioCentavos <= 0) {
      return res.status(400).json({ error: "Precio inválido" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "pen",
            product_data: {
              name: `${tipo === "venta" ? "Compra" : "Alquiler"} Moto #${motoId}`,
              description: "Pago seguro vía Stripe",
            },
            unit_amount: precioCentavos,
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: { motoId, dni, nombre, email, cel, dir, tipo, fechaInicio, fechaFin },
      success_url: `${process.env.FRONTEND_URL}/mis-pedidos`,
      cancel_url: `${process.env.FRONTEND_URL}/`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Error creando sesión de Stripe:", error);
    res.status(500).json({ error: "No se pudo crear la sesión de pago" });
  }
});

export default router;
