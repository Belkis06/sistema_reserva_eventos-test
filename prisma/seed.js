import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Lugares
  const lugar = await prisma.lugares.upsert({
    where: { id_lugar: 1 },
    update: {},
    create: {
      nombre: "Centro de Convenciones",
      direccion: "Calle Principal 456, Ciudad",
      capacidad: 500,
    },
  });

  // Usuarios (Organizador y Asistente)
  const organizador = await prisma.usuarios.upsert({
    where: { correo: "organizador@eventos.com" },
    update: {},
    create: {
      nombre: "Organizador Principal",
      correo: "organizador@eventos.com",
      contrasena: "hashedpass1",
      tipo_usuario: "organizador",
    },
  });

  const asistente = await prisma.usuarios.upsert({
    where: { correo: "asistente@eventos.com" },
    update: {},
    create: {
      nombre: "Asistente Demo",
      correo: "asistente@eventos.com",
      contrasena: "hashedpass2",
      tipo_usuario: "asistente",
    },
  });

  // Eventos
  const evento = await prisma.eventos.upsert({
    where: { id_evento: 1 },
    update: {},
    create: {
      titulo: "Feria Tecnológica 2025",
      descripcion: "Evento sobre innovación tecnológica",
      fecha_hora: new Date('2025-09-01T10:00:00'),
      id_lugar: lugar.id_lugar,
      id_organizador: organizador.id_usuario,
    },
  });

  // Entradas
  const entradaGeneral = await prisma.entradas.upsert({
    where: { id_entrada: 1 },
    update: {},
    create: {
      id_evento: evento.id_evento,
      precio: 100.00,
      total_disponible: 200,
    },
  });

  const entradaVIP = await prisma.entradas.upsert({
    where: { id_entrada: 2 },
    update: {},
    create: {
      id_evento: evento.id_evento,
      precio: 250.00,
      total_disponible: 50,
    },
  });

  // Reservas
  await prisma.reservas.upsert({
    where: { id_reserva: 1 },
    update: {},
    create: {
      id_entrada: entradaGeneral.id_entrada,
      id_usuario: asistente.id_usuario,
      cantidad: 2,
      fecha_reserva: new Date(),
    },
  });

  console.log('✅ Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
