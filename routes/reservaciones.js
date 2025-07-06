import express from 'express';
const router = express.Router();

// Ruta GET para listar reservaciones (ejemplo)
router.get('/', (req, res) => {
  res.json({ message: 'Lista de reservaciones' });
});

// Puedes agregar aquí más rutas: POST, PUT, DELETE...

export default router;
