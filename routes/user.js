import express from 'express';
import { userController } from '../controllers';
import { userValidation } from '../middlewares';

const router = express.Router();

const { createUser } = userController;
const {
  checkRequiredUserFields,
  checkEmptyUserFields,
  validateUsername,
  validateEmail,
  checkIfIdentifierIsInUse,
  validatePassword
} = userValidation;

router
  .route('/register')
  .post(
    checkRequiredUserFields,
    checkEmptyUserFields,
    validateUsername,
    validateEmail,
    checkIfIdentifierIsInUse,
    validatePassword,
    createUser
  );

export default router;
