import { sleep, clone } from '../../../utils/mockHelpers';
import { getUsers } from '../../../utils/mockStore';

export const authApi = {
  async login(credentials) {
    await sleep();
    const user = getUsers().find(
      (item) =>
        item.email.toLowerCase() === credentials.email.toLowerCase() &&
        item.password === credentials.password,
    );
    if (!user) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }
    return clone(user);
  },
  async impersonate(userId) {
    await sleep(200);
    const user = getUsers().find((item) => item.id === userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    return clone(user);
  },
};
