import { clone, sleep } from '../../../utils/mockHelpers';
import { getProjects, getUsers, getTasks } from '../../../utils/mockStore';
import { projectApi } from '../../projects/apis';

export const teamsApi = {
  fetchTeams: projectApi.fetchProjects,
  assignMembers: projectApi.assignMembers,
  async fetchTeamSnapshot(projectId) {
    await sleep(150);
    const project = getProjects().find((item) => item.id === projectId);
    if (!project) {
      const error = new Error('Team not found');
      error.status = 404;
      throw error;
    }

    const members = (project.memberIds || [])
      .map((memberId) => getUsers().find((user) => user.id === memberId))
      .filter(Boolean);

    const tasks = getTasks().filter((task) => task.projectId === projectId);

    return clone({
      project,
      members,
      tasks,
      stats: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter((task) => task.status === 'done').length,
      },
    });
  },
};
