import { sleep, clone } from '../../../utils/mockHelpers';
import { getUsers, getProjects, getTasks } from '../../../utils/mockStore';

export const reportsApi = {
  async fetchSnapshot() {
    await sleep(200);
    return {
      users: clone(getUsers()),
      projects: clone(getProjects()),
      tasks: clone(getTasks()),
    };
  },
};
