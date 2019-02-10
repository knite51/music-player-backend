import express from 'express';
import { userController } from '../controllers';

const router = express.Router();

const { createUser } = userController;

router.route('/register').post(createUser);

export default router;
