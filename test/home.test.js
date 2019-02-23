import supertest from 'supertest';
import app from '../app';

const request = supertest.agent(app);

describe('TEST FOR HOME ROUTE', () => {
  describe('This is a test for the home route: /api/', () => {
    it('Should successfully access the home endpoint', done => {
      request
        .get('/api')
        .expect(200)
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body).toHaveProperty(
            'message',
            'Welcome to Knites Music Player'
          );
          done();
        });
    });
  });
});
