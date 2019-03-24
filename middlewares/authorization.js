import models from '../models';

const { Users } = models;

export default {
  authorizeAdmin(req, res, next) {
    const { isAdmin } = req.decoded;
    if (!isAdmin) {
      const error = new Error('Unauthorized');
      error.status = 403;
      return next(error);
    }
    return next();
  },

  authorizeAccountOwner(req, res, next) {
    if (req.decoded.id.toString() !== req.params.id.toString()) {
      const error = new Error("Operation not permitted on another user's account");
      error.status = 403;
      next(error);
    }
    next();
  },

  async userIsActive(req, res, next) {
    const user = await Users.findByPk(req.params.id);

    if (!user.isActive) {
      const error = new Error('Currently inactive. Activate to perform operation');
      error.status = 403;
      return next(error);
    }
    return next();
  }
};
