import express from 'express';
const router = express.Router();

// Define tus rutas aquí
router.get('/', (req, res) => {
  res.send('Rutas de entradas');
});

export default router; // <-- export default
