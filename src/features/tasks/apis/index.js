import { sleep, clone, generateId } from '../../../utils/mockHelpers';
import { getTasks, setTasks } from '../../../utils/mockStore';

export const taskApi = {
  async fetchTasks() {
    await sleep();
    return clone(getTasks());
  },
  async createTask(payload) {
    await sleep(250);
    const newTask = {
      id: generateId('t'),
      status: 'todo',
      ...payload,
    };
    setTasks([newTask, ...getTasks()]);
    return clone(newTask);
  },
  async updateTask(payload) {
    await sleep(200);
    const nextTasks = getTasks().map((task) => (task.id === payload.id ? { ...task, ...payload } : task));
    setTasks(nextTasks);
    return clone(nextTasks.find((task) => task.id === payload.id));
  },
  async deleteTask(taskId) {
    await sleep(200);
    setTasks(getTasks().filter((task) => task.id !== taskId));
    return taskId;
  },
};
