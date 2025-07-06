import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}


// Cargar variables de entorno según el entorno
if (process.env.NODE_ENV === 'test') {
  import('dotenv').then(dotenv => dotenv.config({ path: '.env.test' }));
} else {
  import('dotenv').then(dotenv => dotenv.config());
}

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import logger from './utils/logger.js';

// Importar rutas
import authRoutes from './routes/auth.js'; // si tienes autenticación
import usuarioRoutes from './routes/usuarios.js';
import eventoRoutes from './routes/eventos.js';
import lugarRoutes from './routes/lugares.js';
import reservacionRoutes from './routes/reservaciones.js';
import entradaRoutes from './routes/entradas.js';


// Importar middleware de manejo de errores
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware de seguridad
app.use(helmet());

// Configuración de CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-dominio.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos'
  }
});
app.use('/api/', limiter);

// Compresión
app.use(compression());

// Parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Ruta de salud y estado del sistema
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Sistema Reserva Eventos',
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/info', (req, res) => {
  res.json({
    success: true,
    name: 'API Sistema Reserva Eventos',
    description: 'Sistema para gestión de eventos, lugares, reservaciones, entradas y usuarios',
    version: '1.0.0',
    author: 'Belkis Yamali Gonzalez Gomez',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      eventos: '/api/eventos',
      lugares: '/api/lugares',
      reservaciones: '/api/reservaciones',
      entradas: '/api/entradas'
    }
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes); // si tienes autenticación
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/lugares', lugarRoutes);
app.use('/api/reservaciones', reservacionRoutes);
app.use('/api/entradas', entradaRoutes);

// Ruta 404
app.use(/(.*)/, (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.originalUrl
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

export default app; 