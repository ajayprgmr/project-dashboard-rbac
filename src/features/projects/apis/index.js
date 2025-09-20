import { sleep, clone, generateId } from '../../../utils/mockHelpers';
import { getProjects, setProjects, getTasks, setTasks } from '../../../utils/mockStore';

export const projectApi = {
  async fetchProjects() {
    await sleep();
    return clone(getProjects());
  },
  async createProject(payload) {
    await sleep(300);
    const newProject = {
      id: generateId('p'),
      memberIds: [],
      status: 'planning',
      ...payload,
    };
    setProjects([newProject, ...getProjects()]);
    return clone(newProject);
  },
  async updateProject(payload) {
    await sleep(300);
    const nextProjects = getProjects().map((project) =>
      project.id === payload.id ? { ...project, ...payload } : project,
    );
    setProjects(nextProjects);
    return clone(nextProjects.find((project) => project.id === payload.id));
  },
  async deleteProject(projectId) {
    await sleep(200);
    setProjects(getProjects().filter((project) => project.id !== projectId));
    setTasks(getTasks().filter((task) => task.projectId !== projectId));
    return projectId;
  },
  async assignMembers({ projectId, memberIds }) {
    await sleep(250);
    const nextProjects = getProjects().map((project) =>
      project.id === projectId ? { ...project, memberIds } : project,
    );
    setProjects(nextProjects);
    return clone(nextProjects.find((project) => project.id === projectId));
  },
};
