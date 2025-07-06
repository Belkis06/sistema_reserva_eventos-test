import express from 'express';
const router = express.Router();

// Ejemplo de login
router.post('/login', (req, res) => {
  res.json({ success: true, token: 'fake-token-for-now' });
});

export default router;