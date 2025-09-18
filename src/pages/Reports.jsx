import { useEffect, useMemo } from 'react';
import {
  Box,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { format, parseISO } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchReportsSnapshot } from '../features/reports/reportsSlice';
import { fetchProjects } from '../features/projects/projectsSlice';
import { fetchTasks } from '../features/tasks/tasksSlice';

const STATUS_COLORS = ['#4f46e5', '#0ea5e9', '#f97316', '#22c55e', '#facc15'];
const CONTRIBUTOR_COLORS = ['#2563eb', '#7c3aed', '#ec4899', '#0f766e', '#f59e0b'];

const ReportsPage = () => {
  const dispatch = useAppDispatch();
  const reportsState = useAppSelector((state) => state.reports);
  const projectsState = useAppSelector((state) => state.projects);
  const tasksState = useAppSelector((state) => state.tasks);

  useEffect(() => {
    if (reportsState.status === 'idle') {
      dispatch(fetchReportsSnapshot());
    }
  }, [dispatch, reportsState.status]);

  useEffect(() => {
    if (projectsState.status === 'idle') {
      dispatch(fetchProjects());
    }
    if (tasksState.status === 'idle') {
      dispatch(fetchTasks());
    }
  }, [dispatch, projectsState.status, tasksState.status]);

  useEffect(() => {
    dispatch(fetchReportsSnapshot());
  }, [dispatch, projectsState.items, tasksState.items]);

  const snapshot = reportsState.data;

  const metrics = useMemo(() => {
    if (!snapshot) {
      return {
        projectCount: 0,
        activeProjects: 0,
        completionRate: 0,
        memberCount: 0,
      };
    }
    const totalTasks = snapshot.tasks.length;
    const doneTasks = snapshot.tasks.filter((task) => task.status === 'done').length;
    const activeProjects = snapshot.projects.filter((project) => project.status !== 'completed').length;
    const memberCount = new Set(snapshot.projects.flatMap((project) => project.memberIds || [])).size;
    return {
      projectCount: snapshot.projects.length,
      activeProjects,
      completionRate: totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0,
      memberCount,
    };
  }, [snapshot]);

  const statusData = useMemo(() => {
    if (!snapshot) return [];
    const map = snapshot.projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(map).map(([status, value]) => ({ name: status.replace('_', ' '), value }));
  }, [snapshot]);

  const completionTrend = useMemo(() => {
    if (!snapshot) return [];
    const buckets = snapshot.tasks.reduce((acc, task) => {
      if (!task.dueDate) return acc;
      const monthKey = format(parseISO(task.dueDate), 'yyyy-MM');
      if (!acc[monthKey]) {
        const label = format(parseISO(`${monthKey}-01`), 'MMM yyyy');
        acc[monthKey] = { month: label, Done: 0, Planned: 0, timestamp: new Date(`${monthKey}-01`).getTime() };
      }
      if (task.status === 'done') {
        acc[monthKey].Done += 1;
      } else {
        acc[monthKey].Planned += 1;
      }
      return acc;
    }, {});
    return Object.values(buckets)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((item) => {
        const { timestamp: _TIMESTAMP, ...rest } = item;
        return rest;
      });
  }, [snapshot]);

  const topContributors = useMemo(() => {
    if (!snapshot) return [];
    const counts = snapshot.tasks.reduce((acc, task) => {
      if (task.status !== 'done' || !task.assigneeId) return acc;
      acc[task.assigneeId] = (acc[task.assigneeId] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([userId, value]) => {
        const user = snapshot.users.find((item) => item.id === userId);
        return { name: user ? user.name : 'Unknown', Tasks: value };
      })
      .sort((a, b) => b.Tasks - a.Tasks)
      .slice(0, 5);
  }, [snapshot]);

  if (reportsState.status === 'loading' && !snapshot) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Reports & Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track delivery health, team throughput, and completion trends for every project.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Active projects
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {metrics.activeProjects}
            </Typography>
            <Chip label={`${metrics.projectCount} total`} size="small" variant="outlined" sx={{ mt: 1 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Task completion rate
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {metrics.completionRate}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Completed tasks vs total.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Team members
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {metrics.memberCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Unique collaborators
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Snapshot updated
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {snapshot ? `${snapshot.projects.length}` : '--'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Projects in scope
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 2, height: 360 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Completion trend
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={completionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Done" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="Planned" stroke="#4f46e5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2, height: 360 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Project status breakdown
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={100} label>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 2, height: 360 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Top contributors
        </Typography>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={topContributors}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="Tasks">
              {topContributors.map((entry, index) => (
                <Cell key={entry.name} fill={CONTRIBUTOR_COLORS[index % CONTRIBUTOR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Stack>
  );
};

export default ReportsPage;
