import faker from 'faker';

export default {
  createRegularUser: () => {
    return {
      username: 'KniteDeveloper',
      email: faker.internet.email(),
      password: 'regularPassword'
    };
  }
};
