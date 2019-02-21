import supertest from 'supertest';
import app from '../app';
import models from '../models';
import { resourceCreator } from '../helpers';

const request = supertest.agent(app);

const regularUser = resourceCreator.createRegularUser();

const signupRoute = '/api/user/register';

describe('USER TEST SUITE', () => {
  beforeAll(() => models.sequelize.sync({ force: true }));
  afterAll(() => models.sequelize.sync({ force: true }));

  describe(`CREATION OF HABITS: ${signupRoute}`, () => {
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
            regularUser.email
          );
          done();
        });
    });
  });
});
