import { sleep, clone } from '../../../utils/mockHelpers';
import { getUsers, setUsers } from '../../../utils/mockStore';

export const userApi = {
  async fetchUsers() {
    await sleep();
    return clone(getUsers());
  },
  async updateRole({ userId, role }) {
    await sleep(250);
    const updatedUsers = getUsers().map((user) => (user.id === userId ? { ...user, role } : user));
    setUsers(updatedUsers);
    const updated = updatedUsers.find((item) => item.id === userId);
    return clone(updated);
  },
};
