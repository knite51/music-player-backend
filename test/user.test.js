import supertest from 'supertest';
import faker from 'faker';
import app from '../app';
import models from '../models';
import { resourceCreator } from '../helpers';

const request = supertest.agent(app);

const adminUser = resourceCreator.createAdminUser();
const regularUser = resourceCreator.createRegularUser();
const regularUserSecond = resourceCreator.createRegularUserSecond();
const inActiveUser = resourceCreator.createInActiveUser();
const emptyUserFields = resourceCreator.createEmptyUserField();
const emptyUsernameField = resourceCreator.createEmptyUsernameField();
const emptyPasswordField = resourceCreator.createEmptyPasswordField();
const emptyEmailField = resourceCreator.createEmptyEmailField();
const noUsernameParams = resourceCreator.createWithNoUsername();
const noEmailParams = resourceCreator.createWithNoEmail();
const noPasswordParams = resourceCreator.createWithNoPassword();
const invalidUserUsername = resourceCreator.userWithInvalidUsername();
const onlyNumsUsername = resourceCreator.userWithOnlyNumsForUsername();
const oneCharUsername = resourceCreator.userWithOneCharUsername();
const invalidUserEmail = resourceCreator.userWithInvalidEmail();
const invalidUserPassword = resourceCreator.userWithInvalidPassword();

const signupRoute = '/api/users/register';
const loginRoute = '/api/users/login';
const deactivateAcctRoute = '/api/users/deactivate';
const activateAcctRoute = '/api/users/activate';
const allUsersRoute = '/api/users/allUsers';
const singleRequestRoute = '/api/users';
const logoutRoute = '/api/users/logout';

describe('USER TEST SUITE', () => {
  let adminUserToken;
  let adminUserID;
  let regularUserSecondToken;
  let regularUserSecondID;
  let inActiveUserToken;
  let inActiveUserID;

  beforeAll(done => {
    request
      .post(signupRoute)
      .send(adminUser)
      .then(response => {
        adminUserToken = response.body.data.token;
        adminUserID = response.body.data.id;
        request
          .post(signupRoute)
          .send(regularUserSecond)
          .then(res => {
            regularUserSecondToken = res.body.data.token;
            regularUserSecondID = res.body.data.id;
            request
              .post(signupRoute)
              .send(inActiveUser)
              .then(result => {
                inActiveUserToken = result.body.data.token;
                inActiveUserID = result.body.data.id;
                done();
              });
          });
      });
  });

  afterAll(() => models.sequelize.sync({ force: true }));

  describe(`CREATION OF USERS: ${signupRoute}`, () => {
    it('should create a user when all params are valid', done => {
      request
        .post(signupRoute)
        .send(regularUser)
        .expect(201)
        .then(response => {
          expect(response.status).toBe(201);
          expect(response.body.data).toHaveProperty(
            'username',
            regularUser.username,
            'email',
            regularUser.email,
            'isActive',
            true
          );
          done();
        });
    });

    it('should not create a user when username supplied already exist', done => {
      request
        .post(signupRoute)
        .send({
          ...regularUser,
          password: 'unusedPassword',
          email: 'unusedemail@dev.com'
        })
        .then(response => {
          expect(response.status).toBe(409);
          expect(response.body.error).toHaveProperty(
            'message',
            'Username already in use'
          );
          done();
        });
    });

    it('should not create user when email supplied already exist', done => {
      request
        .post(signupRoute)
        .send({
          ...regularUser,
          username: 'unusedUsername',
          password: 'unusedPassword'
        })
        .then(response => {
          expect(response.status).toBe(409);
          expect(response.body.error).toHaveProperty(
            'message',
            'Email already in use'
          );
          done();
        });
    });

    it('should fail to create user when fields are empty', done => {
      request
        .post(signupRoute)
        .send(emptyUserFields)
        .then(response => {
          const errorArray = JSON.parse(response.body.error.message);
          expect(response.status).toBe(400);
          expect(errorArray).toHaveLength(3);
          expect(errorArray[0]).toEqual('username cannot be empty');
          expect(errorArray[1]).toEqual('email cannot be empty');
          expect(errorArray[2]).toEqual('password cannot be empty');
          done();
        });
    });

    it('should fail to create when username field is empty', done => {
      request
        .post(signupRoute)
        .send(emptyUsernameField)
        .then(response => {
          const errorArray = JSON.parse(response.body.error.message);
          expect(response.status).toBe(400);
          expect(errorArray).toHaveLength(1);
          expect(errorArray[0]).toEqual('username cannot be empty');
          done();
        });
    });

    it('should fail to create when email field is empty', done => {
      request
        .post(signupRoute)
        .send(emptyEmailField)
        .then(response => {
          const errorArray = JSON.parse(response.body.error.message);
          expect(response.status).toBe(400);
          expect(errorArray).toHaveLength(1);
          expect(errorArray[0]).toEqual('email cannot be empty');
          done();
        });
    });

    it('should fail to create when password field is empty', done => {
      request
        .post(signupRoute)
        .send(emptyPasswordField)
        .then(response => {
          const errorArray = JSON.parse(response.body.error.message);
          expect(response.status).toBe(400);
          expect(errorArray).toHaveLength(1);
          expect(errorArray[0]).toEqual('password cannot be empty');
          done();
        });
    });

    it('should fail creation when no required field is supplied', done => {
      request
        .post(signupRoute)
        .send({})
        .then(response => {
          const errorArray = JSON.parse(response.body.error.message);
          expect(response.status).toBe(400);
          expect(errorArray).toHaveLength(3);
          expect(errorArray[0]).toEqual('username is required');
          expect(errorArray[1]).toEqual('email is required');
          expect(errorArray[2]).toEqual('password is required');
          done();
        });
    });

    it('should fail to create when username is not supplied', done => {
      request
        .post(signupRoute)
        .send(noUsernameParams)
        .then(response => {
          const errorArray = JSON.parse(response.body.error.message);
          expect(response.status).toBe(400);
          expect(errorArray).toHaveLength(1);
          expect(errorArray[0]).toEqual('username is required');
          done();
        });
    });

    it('should fail to create when email is not supplied', done => {
      request
        .post(signupRoute)
        .send(noEmailParams)
        .then(response => {
          const errorArray = JSON.parse(response.body.error.message);
          expect(response.status).toBe(400);
          expect(errorArray).toHaveLength(1);
          expect(errorArray[0]).toEqual('email is required');
          done();
        });
    });

    it('should fail to create when password is not supplied', done => {
      request
        .post(signupRoute)
        .send(noPasswordParams)
        .then(response => {
          const errorArray = JSON.parse(response.body.error.message);
          expect(response.status).toBe(400);
          expect(errorArray).toHaveLength(1);
          expect(errorArray[0]).toEqual('password is required');
          done();
        });
    });

    it('Should fail creation when username does not match rules', done => {
      request
        .post(signupRoute)
        .send(invalidUserUsername)
        .then(response => {
          expect(response.status).toEqual(400);
          expect(response.body.error.message).toMatch('Username is invalid');
          done();
        });
    });

    it('Should fail creation when username is numbers only', done => {
      request
        .post(signupRoute)
        .send(onlyNumsUsername)
        .then(response => {
          expect(response.status).toEqual(400);
          expect(response.body.error.message).toMatch('A two-character username must have only letters');
          done();
        });
    });

    it('Should fail creation when username is one character only', done => {
      request
        .post(signupRoute)
        .send(oneCharUsername)
        .then(response => {
          expect(response.status).toEqual(400);
          expect(response.body.error.message).toMatch('Username must be at least two characters');
          done();
        });
    });

    it('Should fail creation when email address in payload is invalid', done => {
      request
        .post(signupRoute)
        .send(invalidUserEmail)
        .then(response => {
          expect(response.status).toEqual(400);
          expect(response.body.error).toHaveProperty(
            'message',
            'The email address provided is invalid'
          );
          done();
        });
    });

    it('Should fail creation when password fails to match rules', done => {
      request
        .post(signupRoute)
        .send(invalidUserPassword)
        .then(response => {
          expect(response.status).toEqual(400);
          expect(response.body.error.message).toMatch('The password failed to match');
          done();
        });
    });
  });

  describe(`LOGIN OF A USER: ${loginRoute}`, () => {
    it('should allow a user to login when details are valid', done => {
      const requestObject = {
        identifier: regularUser.username,
        password: regularUser.password
      };
      request
        .post(loginRoute)
        .send(requestObject)
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body.message).toEqual('Login Successful! Token expires in one hour.');
          done();
        });
    });

    it('should fail when user user doesnt exist', done => {
      const nonExistentUser = {
        identifier: 'regularUseusername',
        password: 'incorrect password'
      };
      request
        .post(loginRoute)
        .send(nonExistentUser)
        .then(response => {
          expect(response.status).toBe(401);
          expect(response.body.error.message).toEqual('Incorrect login Credentials');
          done();
        });
    });

    it('should fail when password is incorrect', done => {
      const incorrectPassword = {
        identifier: regularUser.username,
        password: 'incorrectpassword'
      };
      request
        .post(loginRoute)
        .send(incorrectPassword)
        .then(response => {
          expect(response.status).toBe(401);
          expect(response.body.error.message).toEqual('Invalid credentials');
          done();
        });
    });

    it('should redirect user if account is inactive', done => {
      const inActiveUserLogin = {
        identifier: inActiveUser.username,
        password: inActiveUser.password
      };
      request
        .post(loginRoute)
        .send(inActiveUserLogin)
        .then(response => {
          expect(response.status).toEqual(302);
          expect(response.headers.location).toEqual(`/activate/${inActiveUserID}`);
          done();
        });
    });
  });

  describe(`DEACTIVATE USER: ${deactivateAcctRoute}/:id`, () => {
    it('Should not deactivate user if userId is invalid', done => {
      request
        .patch(`${deactivateAcctRoute}/invalidId`)
        .set({ Authorization: regularUserSecondToken })
        .send({ isActive: 'false' })
        .then(response => {
          expect(response.status).toEqual(400);
          expect(response.body.error).toHaveProperty(
            'message',
            'Invalid uuid user id param'
          );
          done();
        });
    });

    it('Should not deactivate user if user does not exist', done => {
      const fakeUserId = '93fc4b00-4c15-11e9-a0c1-a57798e721cc';
      request
        .patch(`${deactivateAcctRoute}/${fakeUserId}`)
        .send({ isActive: 'false' })
        .then(response => {
          expect(response.status).toEqual(404);
          expect(response.body.error).toHaveProperty(
            'message',
            `No user with id ${fakeUserId}`
          );
          done();
        });
    });

    it('Should not deactivate user if token is not supplied', done => {
      request
        .patch(`${deactivateAcctRoute}/${regularUserSecondID}`)
        .send({ isActive: 'false' })
        .then(response => {
          expect(response.status).toEqual(400);
          expect(response.body.error).toHaveProperty(
            'message',
            'No token Supplied'
          );
          done();
        });
    });

    it('Should not deactivate user if token is invalid', done => {
      request
        .patch(`${deactivateAcctRoute}/${regularUserSecondID}`)
        .set({ Authorization: 'invalidToken' })
        .send({ isActive: 'false' })
        .then(response => {
          expect(response.status).toEqual(401);
          expect(response.body.error).toHaveProperty(
            'message',
            'Invalid token'
          );
          done();
        });
    });

    it('Should not deactivate user by another user account', done => {
      request
        .patch(`${deactivateAcctRoute}/${regularUserSecondID}`)
        .set({ Authorization: adminUserToken })
        .send({ isActive: 'false' })
        .then(response => {
          expect(response.status).toEqual(403);
          expect(response.body.error).toHaveProperty(
            'message',
            "Operation not permitted on another user's account"
          );
          done();
        });
    });

    it('Should not deactivate user if isActive status has a truthy value', done => {
      request
        .patch(`${deactivateAcctRoute}/${regularUserSecondID}`)
        .set({ Authorization: regularUserSecondToken })
        .send({ isActive: 'true' })
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.error.message).toEqual('Paramaters are incorrect. Try again.');
          done();
        });
    });

    it('Should allow the successful deactivation of a user if isActive value is falsey', done => {
      request
        .patch(`${deactivateAcctRoute}/${regularUserSecondID}`)
        .set({ Authorization: regularUserSecondToken })
        .send({ isActive: 'false' })
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body).toHaveProperty(
            'message',
            'Account deactivated'
          );
          done();
        });
    });
  });

  describe(`RE-ACTIVATE USER: ${activateAcctRoute}/:id`, () => {
    it('Should not re-activate user if userId is invalid', done => {
      request
        .patch(`${activateAcctRoute}/invalidId`)
        .set({ Authorization: regularUserSecondToken })
        .send({ isActive: 'true' })
        .then(response => {
          expect(response.status).toEqual(400);
          expect(response.body.error).toHaveProperty(
            'message',
            'Invalid uuid user id param'
          );
          done();
        });
    });

    it('Should not re-activate user if user does not exist', done => {
      const fakeUserId = '93fc4b00-4c15-11e9-a0c1-a57798e721cc';
      request
        .patch(`${activateAcctRoute}/${fakeUserId}`)
        .send({ isActive: 'true' })
        .then(response => {
          expect(response.status).toEqual(404);
          expect(response.body.error).toHaveProperty(
            'message',
            `No user with id ${fakeUserId}`
          );
          done();
        });
    });

    it('Should not re-activate user if token is not supplied', done => {
      request
        .patch(`${activateAcctRoute}/${regularUserSecondID}`)
        .send({ isActive: 'true' })
        .then(response => {
          expect(response.status).toEqual(400);
          expect(response.body.error).toHaveProperty(
            'message',
            'No token Supplied'
          );
          done();
        });
    });

    it('Should not re-activate user if token is invalid', done => {
      request
        .patch(`${activateAcctRoute}/${regularUserSecondID}`)
        .set({ Authorization: 'invalidToken' })
        .send({ isActive: 'true' })
        .then(response => {
          expect(response.status).toEqual(401);
          expect(response.body.error).toHaveProperty(
            'message',
            'Invalid token'
          );
          done();
        });
    });

    it('Should not re-activate user by another user account', done => {
      request
        .patch(`${activateAcctRoute}/${regularUserSecondID}`)
        .set({ Authorization: adminUserToken })
        .send({ isActive: 'true' })
        .then(response => {
          expect(response.status).toEqual(403);
          expect(response.body.error).toHaveProperty(
            'message',
            "Operation not permitted on another user's account"
          );
          done();
        });
    });

    it('Should not re-activate user if isActive status has a falsey value', done => {
      request
        .patch(`${activateAcctRoute}/${regularUserSecondID}`)
        .set({ Authorization: regularUserSecondToken })
        .send({ isActive: 'false' })
        .then(response => {
          expect(response.status).toBe(403);
          expect(response.body.error.message).toEqual('Paramaters are incorrect. Try again.');
          done();
        });
    });

    it('Should allow the successful re-activate of a user if isActive value is truthy', done => {
      request
        .patch(`${activateAcctRoute}/${regularUserSecondID}`)
        .set({ Authorization: regularUserSecondToken })
        .send({ isActive: 'true' })
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body).toHaveProperty(
            'message',
            'Account reactivated'
          );
          done();
        });
    });
  });

  describe(`GET ALL USERS: ${allUsersRoute}`, () => {
    it('Should not get all users if token is not supplied', done => {
      request.get(`${allUsersRoute}`).then(response => {
        expect(response.status).toEqual(400);
        expect(response.body.error).toHaveProperty(
          'message',
          'No token Supplied'
        );
        done();
      });
    });

    it('Should not get all users if token is invalid', done => {
      request
        .get(`${allUsersRoute}`)
        .set({ Authorization: 'invalidToken' })
        .then(response => {
          expect(response.status).toEqual(401);
          expect(response.body.error).toHaveProperty(
            'message',
            'Invalid token'
          );
          done();
        });
    });

    it('Should get all users if user is authenticated', done => {
      request
        .get(`${allUsersRoute}`)
        .set({ Authorization: adminUserToken })
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body.users[0]).toHaveProperty(
            'username',
            adminUser.username
          );
          done();
        });
    });
  });

  describe(`GET A USER: ${singleRequestRoute}/:id`, () => {
    it('Should not get a single user if userId is invalid', done => {
      request
        .get(`${singleRequestRoute}/invalidId`)
        .set({ Authorization: adminUserToken })
        .then(response => {
          expect(response.status).toEqual(400);
          expect(response.body.error).toHaveProperty(
            'message',
            'Invalid uuid user id param'
          );
          done();
        });
    });

    it('Should not get a single user if user does not exist', done => {
      const fakeUserId = '93fc4b00-4c15-11e9-a0c1-a57798e721cc';
      request
        .get(`${singleRequestRoute}/${fakeUserId}`)
        .set({ Authorization: adminUserToken })
        .then(response => {
          expect(response.status).toEqual(404);
          expect(response.body.error).toHaveProperty(
            'message',
            `No user with id ${fakeUserId}`
          );
          done();
        });
    });

    it('Should not get a single user if token is not supplied', done => {
      request.get(`${singleRequestRoute}/${adminUserID}`).then(response => {
        expect(response.status).toEqual(400);
        expect(response.body.error).toHaveProperty(
          'message',
          'No token Supplied'
        );
        done();
      });
    });

    it('Should not get a single user if token is invalid', done => {
      request
        .get(`${singleRequestRoute}/${adminUserID}`)
        .set({ Authorization: 'invalidToken' })
        .then(response => {
          expect(response.status).toEqual(401);
          expect(response.body.error).toHaveProperty(
            'message',
            'Invalid token'
          );
          done();
        });
    });

    it('Should get a single user if user is authenticated', done => {
      request
        .get(`${singleRequestRoute}/${adminUserID}`)
        .set({ Authorization: adminUserToken })
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body.data).toHaveProperty(
            'username',
            adminUser.username
          );
          done();
        });
    });
  });

  describe(`UPDATE A USER: ${singleRequestRoute}/:id`, () => {
    it('Should not update user if userId is invalid', done => {
      const requestObject = {
        username: 'updatedUsername',
        email: faker.internet.email()
      };
      request
        .patch(`${singleRequestRoute}/invalidId`)
        .set({ Authorization: inActiveUserToken })
        .send(requestObject)
        .then(response => {
          expect(response.status).toEqual(400);
          expect(response.body.error).toHaveProperty(
            'message',
            'Invalid uuid user id param'
          );
          done();
        });
    });

    it('Should not update user if user does not exist', done => {
      const fakeUserId = '93fc4b00-4c15-11e9-a0c1-a57798e721cc';
      const requestObject = {
        username: 'updatedUsername',
        email: faker.internet.email()
      };
      request
        .patch(`${singleRequestRoute}/${fakeUserId}`)
        .set({ Authorization: adminUserToken })
        .send(requestObject)
        .then(response => {
          expect(response.status).toEqual(404);
          expect(response.body.error).toHaveProperty(
            'message',
            `No user with id ${fakeUserId}`
          );
          done();
        });
    });

    it('Should not update user if token is not supplied', done => {
      const requestObject = {
        username: 'updatedUsername',
        email: faker.internet.email()
      };
      request
        .patch(`${singleRequestRoute}/${adminUserID}`)
        .send(requestObject)
        .then(response => {
          expect(response.status).toEqual(400);
          expect(response.body.error).toHaveProperty(
            'message',
            'No token Supplied'
          );
          done();
        });
    });

    it('Should not update user if token is invalid', done => {
      const requestObject = {
        username: 'updatedUsername',
        email: faker.internet.email()
      };
      request
        .patch(`${singleRequestRoute}/${adminUserID}`)
        .set({ Authorization: 'invalidToken' })
        .send(requestObject)
        .then(response => {
          expect(response.status).toEqual(401);
          expect(response.body.error).toHaveProperty(
            'message',
            'Invalid token'
          );
          done();
        });
    });

    it('Should not update user if user account is not active', done => {
      const requestObject = {
        username: 'updatedUsername',
        email: faker.internet.email()
      };
      request
        .patch(`${singleRequestRoute}/${inActiveUserID}`)
        .set({ Authorization: inActiveUserToken })
        .send(requestObject)
        .then(response => {
          expect(response.status).toEqual(403);
          expect(response.body.error).toHaveProperty(
            'message',
            'Currently inactive. Activate to perform operation'
          );
          done();
        });
    });

    it('Should not update user account by another user account', done => {
      const requestObject = {
        username: 'updatedUsername',
        email: faker.internet.email()
      };
      request
        .patch(`${singleRequestRoute}/${regularUserSecondID}`)
        .set({ Authorization: adminUserToken })
        .send(requestObject)
        .then(response => {
          expect(response.status).toEqual(403);
          expect(response.body.error).toHaveProperty(
            'message',
            "Operation not permitted on another user's account"
          );
          done();
        });
    });

    it('Should fail update when username does not match rules', done => {
      const requestObject = {
        username: invalidUserUsername.username
      };
      request
        .patch(`${singleRequestRoute}/${regularUserSecondID}`)
        .set({ Authorization: regularUserSecondToken })
        .send(requestObject)
        .then(response => {
          expect(response.status).toEqual(400);
          expect(response.body.error.message).toMatch('Username is invalid');
          done();
        });
    });

    it('Should fail update when username is numbers only', done => {
      const requestObject = {
        username: onlyNumsUsername.username
      };
      request
        .patch(`${singleRequestRoute}/${regularUserSecondID}`)
        .set({ Authorization: regularUserSecondToken })
        .send(requestObject)
        .then(response => {
          expect(response.status).toEqual(400);
          expect(response.body.error.message).toMatch('A two-character username must have only letters');
          done();
        });
    });

    it('Should fail update when username is one character only', done => {
      const requestObject = {
        username: oneCharUsername.username
      };
      request
        .patch(`${singleRequestRoute}/${regularUserSecondID}`)
        .set({ Authorization: regularUserSecondToken })
        .send(requestObject)
        .then(response => {
          expect(response.status).toEqual(400);
          expect(response.body.error.message).toMatch('Username must be at least two characters');
          done();
        });
    });

    it('Should fail update when email address in payload is invalid', done => {
      const requestObject = {
        email: invalidUserEmail.email
      };
      request
        .patch(`${singleRequestRoute}/${regularUserSecondID}`)
        .set({ Authorization: regularUserSecondToken })
        .send(requestObject)
        .then(response => {
          expect(response.status).toEqual(400);
          expect(response.body.error).toHaveProperty(
            'message',
            'The email address provided is invalid'
          );
          done();
        });
    });

    it('should not update a user when username supplied already exist', done => {
      const requestObject = {
        username: regularUser.username
      };
      request
        .patch(`${singleRequestRoute}/${regularUserSecondID}`)
        .set({ Authorization: regularUserSecondToken })
        .send(requestObject)
        .then(response => {
          expect(response.status).toBe(409);
          expect(response.body.error).toHaveProperty(
            'message',
            'Username already in use'
          );
          done();
        });
    });

    it('should not create user when email supplied already exist', done => {
      const requestObject = {
        email: regularUser.email
      };
      request
        .patch(`${singleRequestRoute}/${regularUserSecondID}`)
        .set({ Authorization: regularUserSecondToken })
        .send(requestObject)
        .then(response => {
          expect(response.status).toBe(409);
          expect(response.body.error).toHaveProperty(
            'message',
            'Email already in use'
          );
          done();
        });
    });

    it('Should update user if user is username is valid', done => {
      const requestObject = {
        username: 'updatedUsername'
      };
      request
        .patch(`${singleRequestRoute}/${adminUserID}`)
        .set({ Authorization: adminUserToken })
        .send(requestObject)
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body).toHaveProperty('message', 'Update Successful');
          done();
        });
    });

    it('Should update user if user is email is valid', done => {
      const requestObject = {
        email: faker.internet.email()
      };
      request
        .patch(`${singleRequestRoute}/${adminUserID}`)
        .set({ Authorization: adminUserToken })
        .send(requestObject)
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body).toHaveProperty('message', 'Update Successful');
          done();
        });
    });
  });

  describe(`DELETE A USER: ${singleRequestRoute}/:id`, () => {
    it('Should not delete user if userId is invalid', done => {
      request
        .delete(`${singleRequestRoute}/invalidId`)
        .set({ Authorization: inActiveUserToken })
        .then(response => {
          expect(response.status).toEqual(400);
          expect(response.body.error).toHaveProperty(
            'message',
            'Invalid uuid user id param'
          );
          done();
        });
    });

    it('Should not delete user if user does not exist', done => {
      const fakeUserId = '93fc4b00-4c15-11e9-a0c1-a57798e721cc';
      request
        .delete(`${singleRequestRoute}/${fakeUserId}`)
        .set({ Authorization: adminUserToken })
        .then(response => {
          expect(response.status).toEqual(404);
          expect(response.body.error).toHaveProperty(
            'message',
            `No user with id ${fakeUserId}`
          );
          done();
        });
    });

    it('Should not delete user if token is not supplied', done => {
      request.delete(`${singleRequestRoute}/${adminUserID}`).then(response => {
        expect(response.status).toEqual(400);
        expect(response.body.error).toHaveProperty(
          'message',
          'No token Supplied'
        );
        done();
      });
    });

    it('Should not delete user if token is invalid', done => {
      request
        .delete(`${singleRequestRoute}/${adminUserID}`)
        .set({ Authorization: 'invalidToken' })
        .then(response => {
          expect(response.status).toEqual(401);
          expect(response.body.error).toHaveProperty(
            'message',
            'Invalid token'
          );
          done();
        });
    });

    it('Should not delete user if user is not an admin', done => {
      request
        .delete(`${singleRequestRoute}/${regularUserSecondID}`)
        .set({ Authorization: regularUserSecondToken })
        .then(response => {
          expect(response.status).toEqual(403);
          expect(response.body.error).toHaveProperty('message', 'Unauthorized');
          done();
        });
    });

    it('Should not delete user account by another user account', done => {
      request
        .delete(`${singleRequestRoute}/${regularUserSecondID}`)
        .set({ Authorization: adminUserToken })
        .then(response => {
          expect(response.status).toEqual(403);
          expect(response.body.error).toHaveProperty(
            'message',
            "Operation not permitted on another user's account"
          );
          done();
        });
    });

    it('Should delete user account if user is an Admin', done => {
      request
        .delete(`${singleRequestRoute}/${adminUserID}`)
        .set({ Authorization: adminUserToken })
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body).toHaveProperty('message', 'User Deleted');
          done();
        });
    });
  });

  describe(`LOG OUT A USER: ${logoutRoute}`, () => {
    it('should log user out of the application', done => {
      request.delete(`${logoutRoute}`).then(response => {
        expect(response.status).toEqual(302);
        expect(response.headers.location).toEqual('/');
        done();
      });
    });
  });
});
