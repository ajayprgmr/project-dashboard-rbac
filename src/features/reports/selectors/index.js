import { createSelector } from '@reduxjs/toolkit';

export const selectReportsState = (state) => state.reports;

export const selectProjectStatusBreakdown = createSelector(selectReportsState, (reports) => {
  if (!reports.data) return [];
  const counts = reports.data.projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).map(([status, value]) => ({ name: status, value }));
});

export const selectTaskCompletionTrend = createSelector(selectReportsState, (reports) => {
  if (!reports.data) return [];
  const byStatus = reports.data.tasks.reduce((acc, task) => {
    const key = task.status === 'done' ? 'done' : 'open';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return [
    { name: 'Completed', value: byStatus.done || 0 },
    { name: 'Open', value: byStatus.open || 0 },
  ];
});
