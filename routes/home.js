import express from 'express';

const router = express.Router();

router
  .route('/')
  .get((req, res) => res.send({ message: 'Welcome to Knites Music Player' }));

export default router;
