import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";


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
    if (Number.isNaN(precioCentavos) || precioCentavos <= 0) {
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
