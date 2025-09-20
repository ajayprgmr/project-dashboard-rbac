import usersSeed from '../data/users.json';
import projectsSeed from '../data/projects.json';
import tasksSeed from '../data/tasks.json';
import { clone } from './mockHelpers';

let users = clone(usersSeed);
let projects = clone(projectsSeed);
let tasks = clone(tasksSeed);

export const getUsers = () => users;
export const setUsers = (next) => {
  users = next;
  return users;
};

export const getProjects = () => projects;
export const setProjects = (next) => {
  projects = next;
  return projects;
};

export const getTasks = () => tasks;
export const setTasks = (next) => {
  tasks = next;
  return tasks;
};

export const resetMockStore = () => {
  users = clone(usersSeed);
  projects = clone(projectsSeed);
  tasks = clone(tasksSeed);
};

export const hydrateMockStore = ({ usersSnapshot, projectsSnapshot, tasksSnapshot }) => {
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
