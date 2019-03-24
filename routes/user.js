import express from 'express';
import { userController } from '../controllers';
import { userValidation, authorization, authentication } from '../middlewares';

const router = express.Router();

const {
  createUser,
  getOneUser,
  getAllUsers,
  updateUserDetails,
  deleteUser,
  activateUserAccount,
  deactivateUserAccount,
  login,
  logout
} = userController;

const { authenticateUser, verifyLoginDetails } = authentication;
const { authorizeAdmin, authorizeAccountOwner, userIsActive } = authorization;

const {
  checkRequiredUserFields,
  checkEmptyUserFields,
  checkIfUserExists,
  validateUsername,
  validateEmail,
  checkIfIdentifierIsInUse,
  ensureUserParamIsValid,
  validatePassword,
  ensureFalseyValueForDeactivation,
  ensureTruthyValueForReactivation
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
router.route('/allUsers').get(authenticateUser, getAllUsers);

router
  .route('/deactivate/:id')
  .patch(
    ensureUserParamIsValid,
    checkIfUserExists,
    authenticateUser,
    authorizeAccountOwner,
    ensureFalseyValueForDeactivation,
    deactivateUserAccount
  );

router
  .route('/activate/:id')
  .patch(
    ensureUserParamIsValid,
    checkIfUserExists,
    authenticateUser,
    authorizeAccountOwner,
    ensureTruthyValueForReactivation,
    activateUserAccount
  );

router.route('/login').post(verifyLoginDetails, login);

router.route('/logout').delete(logout);

router
  .route('/:id')
  .all(ensureUserParamIsValid, checkIfUserExists, authenticateUser)
  .get(getOneUser)
  .patch(
    userIsActive,
    authorizeAccountOwner,
    validateUsername,
    validateEmail,
    checkIfIdentifierIsInUse,
    updateUserDetails
  )
  .delete(authorizeAdmin, authorizeAccountOwner, deleteUser);

export default router;
