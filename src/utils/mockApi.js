import usersSeed from '../data/users.json';
import projectsSeed from '../data/projects.json';
import tasksSeed from '../data/tasks.json';

const sleep = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const clone = (payload) => JSON.parse(JSON.stringify(payload));

let users = clone(usersSeed);
let projects = clone(projectsSeed);
let tasks = clone(tasksSeed);

const generateId = (prefix) => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
};

export const authApi = {
  async login(credentials) {
    await sleep();
    const user = users.find(
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
    const user = users.find((item) => item.id === userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    return clone(user);
  },
};

export const userApi = {
  async fetchUsers() {
    await sleep();
    return clone(users);
  },
  async updateRole({ userId, role }) {
    await sleep(250);
    users = users.map((user) => (user.id === userId ? { ...user, role } : user));
    const updated = users.find((item) => item.id === userId);
    return clone(updated);
  },
};

export const projectApi = {
  async fetchProjects() {
    await sleep();
    return clone(projects);
  },
  async createProject(payload) {
    await sleep(300);
    const newProject = {
      id: generateId('p'),
      memberIds: [],
      status: 'planning',
      ...payload,
    };
    projects = [newProject, ...projects];
    return clone(newProject);
  },
  async updateProject(payload) {
    await sleep(300);
    projects = projects.map((project) =>
      project.id === payload.id ? { ...project, ...payload } : project,
    );
    return clone(projects.find((project) => project.id === payload.id));
  },
  async deleteProject(projectId) {
    await sleep(200);
    projects = projects.filter((project) => project.id !== projectId);
    tasks = tasks.filter((task) => task.projectId !== projectId);
    return projectId;
  },
  async assignMembers({ projectId, memberIds }) {
    await sleep(250);
    projects = projects.map((project) =>
      project.id === projectId ? { ...project, memberIds } : project,
    );
    return clone(projects.find((project) => project.id === projectId));
  },
};

export const taskApi = {
  async fetchTasks() {
    await sleep();
    return clone(tasks);
  },
  async createTask(payload) {
    await sleep(250);
    const newTask = {
      id: generateId('t'),
      status: 'todo',
      ...payload,
    };
    tasks = [newTask, ...tasks];
    return clone(newTask);
  },
  async updateTask(payload) {
    await sleep(200);
    tasks = tasks.map((task) => (task.id === payload.id ? { ...task, ...payload } : task));
    return clone(tasks.find((task) => task.id === payload.id));
  },
  async deleteTask(taskId) {
    await sleep(200);
    tasks = tasks.filter((task) => task.id !== taskId);
    return taskId;
  },
};

export const reportsApi = {
  async fetchSnapshot() {
    await sleep(200);
    return {
      users: clone(users),
      projects: clone(projects),
      tasks: clone(tasks),
    };
  },
};

export const resetMockApi = () => {
  users = clone(usersSeed);
  projects = clone(projectsSeed);
  tasks = clone(tasksSeed);
};

export const hydrateMockApi = ({ usersSnapshot, projectsSnapshot, tasksSnapshot }) => {
  if (usersSnapshot?.length) {
    users = clone(usersSnapshot);
  }
  if (projectsSnapshot?.length) {
    projects = clone(projectsSnapshot);
  }
  if (tasksSnapshot?.length) {
    tasks = clone(tasksSnapshot);
  }
};
