import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import models from '../models';

const { Users } = models;

const secretOrPrivateKey = process.env.SECRET;

export default {
  authenticateUser: (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      const error = new Error('No token Supplied');
      error.status = 400;
      return next(error);
    }
    jwt.verify(token, secretOrPrivateKey, (err, decoded) => {
      if (err) {
        const error = new Error('Invalid token');
        error.status = 401;
        return next(error);
      }
      req.decoded = decoded;
      return next();
    });
  },
  async verifyLoginDetails(req, res, next) {
    let { identifier, password } = req.body;
    identifier = identifier && identifier.trim();
    password = password && password.trim();
    const user = await Users.findOne({
      where: {
        [Op.or]: [
          { username: { [Op.regexp]: `^${identifier}$` } },
          { email: { [Op.regexp]: `^${identifier}$` } }
        ]
      }
    });

    if (!user) {
      const error = new Error('Incorrect login Credentials');
      error.status = 401;
      return next(error);
    }

    if (!user.validPassword(password)) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      return next(error);
    }

    if (!user.isActive) {
      res.status = 302;
      return res.redirect(`/activate/${user.id}`);
    }

    return next();
  }
};
