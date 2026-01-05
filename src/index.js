/*import express, { request, response } from 'express'
import motosRoutes from './routes/motos.route.js'
import clientesRoutes from './routes/clientes.route.js'
import alquileresRoutes from './routes/alquiler.route.js'
import ventasRoutes from './routes/ventas.route.js'

import motoImagenesRoutes from './routes/motoImagenes.route.js'

import './config.js'

const app = express();

app.use(express.json());

app.use(motosRoutes);
app.use(clientesRoutes);
app.use(alquileresRoutes);
app.use(ventasRoutes);

app.use('/motos',motoImagenesRoutes);
// Servir carpeta de imágenes como estática
app.use('/uploads', express.static('uploads'));






app.use((req,res,next)=>{
    res.status(404).json({message:"endopoint not found"})
});

app.listen(8000,()=>{
    console.log("iniciando en puerto 8000")
})

*/


/*version funcionando
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// 📦 Rutas
import motosRoutes from './routes/motos.route.js';
import clientesRoutes from './routes/clientes.route.js';
import alquileresRoutes from './routes/alquiler.route.js';
import ventasRoutes from './routes/ventas.route.js';
import motoImagenesRoutes from './routes/motoImagenes.route.js';



// 📌 Configuración de entorno
import './config.js';

// Necesario para usar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// 🛡 Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Cambia por el dominio de tu frontend
    methods: 'GET,POST,PATCH,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));
app.use(express.json());

// 📂 Rutas API
app.use(motosRoutes);
app.use(clientesRoutes);
app.use(alquileresRoutes);
app.use(ventasRoutes);
app.use('/motos', motoImagenesRoutes);

// 📷 Servir imágenes de forma estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 📌 Ruta base de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API funcionando 🚀' });
});

// 🚫 Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ message: 'endpoint not found' });
});

// 🚀 Servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
*/
/*
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// 📦 Rutas
import motosRoutes from './routes/motos.route.js';
import clientesRoutes from './routes/clientes.route.js';
import alquileresRoutes from './routes/alquiler.route.js';
import ventasRoutes from './routes/ventas.route.js';
import motoImagenesRoutes from './routes/motoImagenes.route.js';
import loginRoutes from './routes/auth.route.js'; // Ruta de login

// 📌 Middleware de autenticación
import { verifyToken } from './middlewares/authMiddleware.js';

// 📌 Configuración de entorno
import './config.js';

// Necesario para usar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// 🛡 Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Cambia por tu frontend
    methods: 'GET,POST,PATCH,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));
app.use(express.json());

// 🔓 Rutas públicas
app.use('/login', loginRoutes);

// 🔒 Middleware para proteger rutas privadas
app.use(verifyToken);

// 📂 Rutas privadas
app.use(motosRoutes);
app.use(clientesRoutes);
app.use(alquileresRoutes);
app.use(ventasRoutes);
app.use('/motos', motoImagenesRoutes);

// 📷 Servir imágenes de forma estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 📌 Ruta base de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API funcionando 🚀' });
});

// 🚫 Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ message: 'endpoint not found' });
});

// 🚀 Servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
*/


/*
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// 📦 Rutas
import motosRoutes from './routes/motos.route.js';
import clientesRoutes from './routes/clientes.route.js';
import alquileresRoutes from './routes/alquiler.route.js';
import ventasRoutes from './routes/ventas.route.js';
import motoImagenesRoutes from './routes/motoImagenes.route.js';
import loginRoutes from './routes/auth.route.js'; // Ruta de login
import stripeRoutes from'./routes/stripe.route.js'
//obteniendo rutas del marketplacw
import marketplaceRoutes from './routes/marketplace.route.js'

// 📌 Middleware de autenticación
import { verifyToken } from './middlewares/authMiddleware.js';

// 📌 Configuración de entorno
import './config.js';

// Necesario para usar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// 🛡 Middleware
app.use(cors({
  origin: ['http://localhost:5173','http://localhost:3000'], // Cambia por tu frontend
  methods: 'GET,POST,PATCH,DELETE',
  allowedHeaders: 'Content-Type,Authorization'
}));

app.use(express.json());

// 📷 Servir imágenes y archivos estáticos (sin autenticación)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔓 Rutas públicas
app.use('/login', loginRoutes);
app.use('/marketplace',marketplaceRoutes);
app.use('/stripe', stripeRoutes); // <-- NUEVA RUTA PÚBLICA

// 🔒 Middleware para proteger rutas privadas
app.use(verifyToken);

// 📂 Rutas privadas
app.use(motosRoutes);
app.use(clientesRoutes);
app.use(alquileresRoutes);
app.use(ventasRoutes);
app.use('/motos', motoImagenesRoutes);

// 📌 Ruta base de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando 🚀' });
});

// 🚫 Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'endpoint not found' });
});

// 🚀 Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
*/
/*
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
// 📦 Rutas
import motosRoutes from './routes/motos.route.js';
import clientesRoutes from './routes/clientes.route.js';
import alquileresRoutes from './routes/alquiler.route.js';
import ventasRoutes from './routes/ventas.route.js';
import motoImagenesRoutes from './routes/motoImagenes.route.js';
import loginRoutes from './routes/auth.route.js';
import stripeRoutes from './routes/stripe.route.js';
import stripeWebhook from './routes/stripe.webhook.js'; // ← Webhook de Stripe
import marketplaceRoutes from './routes/marketplace.route.js';

// 📌 Middleware de autenticación
import { verifyToken } from './middlewares/authMiddleware.js';

// 📌 Configuración de entorno
import './config.js';

// Necesario para usar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// 🛡 Middleware CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Cambia por tu frontend
  methods: 'GET,POST,PATCH,DELETE',
  allowedHeaders: 'Content-Type,Authorization'
}));

// ⚠️ El webhook de Stripe necesita el cuerpo en bruto
app.use('/stripe/webhook', stripeWebhook);

// Ahora sí, para el resto usamos JSON normal
app.use(express.json());

// 📷 Servir imágenes y archivos estáticos (sin autenticación)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔓 Rutas públicas
app.use('/stripe', stripeRoutes); // Rutas de checkout
app.use('/login', loginRoutes);
app.use('/marketplace', marketplaceRoutes);

// 🔒 Middleware para proteger rutas privadas
app.use(verifyToken);

// 📂 Rutas privadas
app.use(motosRoutes);
app.use(clientesRoutes);
app.use(alquileresRoutes);
app.use(ventasRoutes);
app.use('/motos', motoImagenesRoutes);

// 📌 Ruta base de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando 🚀' });
});

// 🚫 Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'endpoint not found' });
});

// 🚀 Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
*/
// src/index.js



/*
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// 📦 Rutas
import motosRoutes from './routes/motos.route.js';
import clientesRoutes from './routes/clientes.route.js';
import alquileresRoutes from './routes/alquiler.route.js';
import ventasRoutes from './routes/ventas.route.js';
import motoImagenesRoutes from './routes/motoImagenes.route.js';
import loginRoutes from './routes/auth.route.js';
import stripeRoutes from './routes/stripe.route.js';
import stripeWebhook from './routes/stripe.webhook.js'; // ✅ Import default
import marketplaceRoutes from './routes/marketplace.route.js';

//import de rutas de autenticacion de clientes
import loginClientesRoutes from './routes/auth.cliente.route.js'

// 📌 Middleware de autenticación
import { verifyToken } from './middlewares/authMiddleware.js';

// 📌 Configuración de entorno
import './config.js';

//pedidos del cliente 
import pedidosRoutes from "./routes/pedidos.route.js";


// Necesario para usar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// 🛡 Middleware CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Cambia por tu frontend
  methods: 'GET,POST,PATCH,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  //credentials: true
}));

// ⚠️ El webhook de Stripe necesita el cuerpo en bruto (antes de express.json)


//app.use('/stripe/webhook', stripeWebhook);
app.post(
  '/stripe/webhook',
  express.raw({ type: 'application/json' }), // body en crudo para Stripe
  stripeWebhook
);


//app.use('/stripe/webhook', express.raw({ type: 'application/json' }));
// Ahora sí, para el resto usamos JSON normal
//app.use(express.json());

// 📷 Servir imágenes y archivos estáticos (sin autenticación)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
// 🔓 Rutas públicas
app.use('/marketplace', marketplaceRoutes);
app.use('/stripe', stripeRoutes); // Rutas de checkout
app.use('/login', loginRoutes);
//app.use('/marketplace', marketplaceRoutes);

//rutas para autentica clientes
app.use('/registroCliesntes', loginClientesRoutes);
//pediso cliente
app.use("/api", pedidosRoutes);


// 🔒 Middleware para proteger rutas privadas
app.use(verifyToken);

// 📂 Rutas privadas
app.use(motosRoutes);
app.use(clientesRoutes);
app.use(alquileresRoutes);
app.use(ventasRoutes);
app.use('/motos', motoImagenesRoutes);


// 📌 Ruta base de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando 🚀' });
});

// 🚫 Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'endpoint not found' });
});

// 🚀 Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
*/

import app from './app.js';

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
