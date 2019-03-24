import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import models from '../models';

const { Users } = models;

const secretOrPrivateKey = process.env.SECRET;

function jwtCreateToken(payload) {
  const ONE_WEEK = 60 * 60;
  return jwt.sign(payload, secretOrPrivateKey, {
    expiresIn: ONE_WEEK
  });
}

export default {
  async createUser(req, res) {
    let { username, email } = req.body;
    username = username && username.trim();
    email = email && email.trim();
    const requestBody = {
      ...req.body,
      username,
      email
    };
    const user = await Users.create(requestBody);

    const token = jwtCreateToken({
      id: user.id,
      username: user.username,
      isActive: user.isActive,
      isAdmin: user.isAdmin
    });

    const normalizedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isActive: user.isActive,
      isAdmin: user.isAdmin
    };
    const responseObject = { ...normalizedUser, token };
    return res.status(201).send({
      data: { ...responseObject },
      status: 201
    });
  },

  async getOneUser(req, res) {
    const user = await Users.findByPk(req.params.id);
    const data = {
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isActive: user.isActive,
      isAdmin: user.isAdmin
    };
    const responseObject = { data, status: 200 };
    return res.send(responseObject);
  },

  async getAllUsers(req, res) {
    const users = await Users.findAll().map(user => {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        isAdmin: user.isAdmin
      };
    });
    const responseObject = { users, status: 200 };
    return res.send(responseObject);
  },

  async updateUserDetails(req, res) {
    let { username, email } = req.body;
    username = username && username.trim();
    email = email && email.trim();

    const user = await Users.findByPk(req.params.id);
    const updatedUser = await user.update({
      username: username || user.username,
      email: email || user.email
    });

    const data = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      isActive: updatedUser.isActive,
      isAdmin: updatedUser.isAdmin
    };

    const message = 'Update Successful';

    const responseObject = { data, message, status: 200 };
    return res.send(responseObject);
  },

  async deleteUser(req, res) {
    await Users.destroy({ where: { id: req.params.id } });
    return res.json({ message: 'User Deleted' });
  },

  async deactivateUserAccount(req, res) {
    const {
      params: { id },
      body: { isActive }
    } = req;
    const user = await Users.findByPk(id);
    const deactivatedUser = await user.update({ isActive });

    jwtCreateToken({
      id: deactivatedUser.id,
      username: deactivatedUser.username,
      isActive: deactivatedUser.isActive,
      isAdmin: deactivatedUser.isAdmin
    });
    return res.json({ message: 'Account deactivated' });
  },

  async activateUserAccount(req, res) {
    const {
      params: { id },
      body: { isActive }
    } = req;
    const user = await Users.findByPk(id);
    const reactivatedUser = await user.update({ isActive });
    jwtCreateToken({
      id: reactivatedUser.id,
      username: reactivatedUser.username,
      isActive: reactivatedUser.isActive,
      isAdmin: reactivatedUser.isAdmin
    });
    return res.send({ message: 'Account reactivated' });
  },

  async login(req, res) {
    let { identifier } = req.body;
    identifier = identifier && identifier.trim();

    const user = await Users.findOne({
      where: {
        [Op.or]: [
          { username: { [Op.regexp]: `^${identifier}$` } },
          { email: { [Op.regexp]: `^${identifier}$` } }
        ]
      }
    });

    const token = jwtCreateToken({
      id: user.id,
      username: user.username,
      isActive: user.isActive,
      isAdmin: user.isAdmin
    });

    const normalizedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
      token
    };
    const message = 'Login Successful! Token expires in one hour.';

    const data = { ...normalizedUser };

    const responseObject = { data, message, status: 200 };
    return res.send(responseObject);
  },

  logout(req, res) {
    return res.redirect('/');
  }
};
