import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../app.js';

// Configurar Prisma para tests
const prisma = new PrismaClient();

// Función para limpiar la base de datos en orden inverso para evitar problemas con claves foráneas
async function cleanDatabase() {
  try {
    await prisma.entrada.deleteMany();
    await prisma.reservacion.deleteMany();
    await prisma.evento.deleteMany();
    await prisma.lugar.deleteMany();
    await prisma.usuario.deleteMany();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error limpiando base de datos:', error);
  }
}



// Función para crear datos de prueba usando datos únicos y realistas de tu proyecto
async function seedTestData() {
  try {
    const uniqueData1 = generateUniqueData();
    const uniqueData2 = generateUniqueData();

    // Crear lugares
    const lugares = await Promise.all([
      prisma.lugar.upsert({
        where: { nombre: uniqueData1.lugar.nombre },
        update: {},
        create: uniqueData1.lugar
      }),
      prisma.lugar.upsert({
        where: { nombre: uniqueData2.lugar.nombre },
        update: {},
        create: uniqueData2.lugar
      }),
    ]);

    // Crear eventos asociados a lugares
    const eventos = await Promise.all([
      prisma.evento.upsert({
        where: { nombre: uniqueData1.evento.nombre },
        update: {},
        create: {
          ...uniqueData1.evento,
          lugar_id: lugares[0].id,
        }
      }),
      prisma.evento.upsert({
        where: { nombre: uniqueData2.evento.nombre },
        update: {},
        create: {
          ...uniqueData2.evento,
          lugar_id: lugares[1].id,
        }
      }),
    ]);

    // Crear usuarios con contraseñas hasheadas
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    const usuarios = await Promise.all([
      prisma.usuario.upsert({
        where: { email: 'admin@sistemaeventos.com' },
        update: {},
        create: {
          nombre: 'Administrador',
          email: 'admin@sistemaeventos.com',
          password: hashedPassword,
          rol: 'admin'
        }
      }),
      prisma.usuario.upsert({
        where: { email: 'usuario1@sistemaeventos.com' },
        update: {},
        create: {
          nombre: 'Usuario 1',
          email: 'usuario1@sistemaeventos.com',
          password: hashedPassword,
          rol: 'usuario'
        }
      }),
    ]);

    // Crear reservaciones asociadas a eventos y usuarios
    const reservaciones = await Promise.all([
      prisma.reservacion.upsert({
        where: { id: 1 },
        update: {},
        create: {
          id: 1,
          evento_id: eventos[0].id,
          usuario_id: usuarios[1].id,
          fecha_reserva: new Date(),
          estado: 'confirmada',
        }
      }),
    ]);

    // Crear entradas asociadas a reservaciones
    await Promise.all([
      prisma.entrada.upsert({
        where: { id: 1 },
        update: {},
        create: {
          id: 1,
          reservacion_id: reservaciones[0].id,
          tipo: 'general',
          precio: 50.0,
          estado: 'activa'
        }
      }),
    ]);

    // eslint-disable-next-line no-console
    console.log('Datos de prueba creados exitosamente');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creando datos de prueba:', error);
  }
}

// Función para generar datos únicos para tests
function generateUniqueData() {
  const hrtime = process.hrtime.bigint();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  const uniqueId = `${hrtime}${timestamp}${random}`;

  return {
    lugar: {
      nombre: `Lugar Test ${uniqueId}`,
      direccion: 'Dirección de prueba',
      capacidad: 100,
      estado: 'activo'
    },
    evento: {
      nombre: `Evento Test ${uniqueId}`,
      descripcion: 'Evento de prueba',
      fecha_inicio: new Date(),
      fecha_fin: new Date(Date.now() + 3600000), // +1 hora
      estado: 'activo'
    },
    usuario: {
      nombre: `Usuario Test ${uniqueId}`,
      email: `usuario.test.${uniqueId}@sistemaeventos.com`,
      password: 'test123',
      rol: 'usuario'
    }
  };
}

// Configuración global para Jest
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'supersecretuml2024';
process.env.JWT_EXPIRES_IN = '24h';

// Helper para obtener token de autenticación
async function getAuthToken(email, password) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return res.body.token;
}

// Hacer funciones disponibles globalmente
global.getAuthToken = getAuthToken;
global.cleanDatabase = cleanDatabase; // Asegúrate de que cleanDatabase esté definida en este scope o importada
global.seedTestData = seedTestData;
global.generateUniqueData = generateUniqueData;
global.prisma = prisma;

export {
  prisma,
  cleanDatabase,
  seedTestData,
  generateUniqueData,
  getAuthToken
};