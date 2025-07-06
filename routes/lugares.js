import express from 'express';
const router = express.Router();

// Ruta GET básica para lugares
router.get('/', (req, res) => {
  res.json({ message: 'Lista de lugares' });
});

// Aquí puedes agregar más rutas: POST, PUT, DELETE, etc.

export default router;
