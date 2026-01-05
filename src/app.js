import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Rutas
import motosRoutes from './routes/motos.route.js';
import clientesRoutes from './routes/clientes.route.js';
import alquileresRoutes from './routes/alquiler.route.js';
import ventasRoutes from './routes/ventas.route.js';
import motoImagenesRoutes from './routes/motoImagenes.route.js';
import loginRoutes from './routes/auth.route.js';
import stripeRoutes from './routes/stripe.route.js';
import stripeWebhook from './routes/stripe.webhook.js';
import marketplaceRoutes from './routes/marketplace.route.js';
import loginClientesRoutes from './routes/auth.cliente.route.js';
import pedidosRoutes from "./routes/pedidos.route.js";

import { verifyToken } from './middlewares/authMiddleware.js';
import './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: 'GET,POST,PATCH,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

// Stripe webhook (raw)
app.post(
  '/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

// Static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// JSON
app.use(express.json());

// Rutas públicas
app.use('/marketplace', marketplaceRoutes);
app.use('/stripe', stripeRoutes);
app.use('/login', loginRoutes);
app.use('/registroCliesntes', loginClientesRoutes);
app.use("/api", pedidosRoutes);

// Middleware auth
app.use(verifyToken);

// Rutas privadas
app.use(motosRoutes);
app.use(clientesRoutes);
app.use(alquileresRoutes);
app.use(ventasRoutes);
app.use('/motos', motoImagenesRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando 🚀' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'endpoint not found' });
});

export default app;
