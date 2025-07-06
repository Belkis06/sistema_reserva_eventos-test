import express from 'express';
const router = express.Router();

// Ruta de ejemplo
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ruta de usuarios funcionando correctamente'
  });
});

export default router;
