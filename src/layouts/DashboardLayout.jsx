import { useMemo, useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  TextField,
  Tooltip,
  useMediaQuery,
  InputAdornment,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Groups';
import BarChartIcon from '@mui/icons-material/BarChart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { toggleSidebar, toggleTheme, setGlobalSearch } from '../features/ui/uiSlice';
import { logout, stopImpersonation } from '../features/auth/authSlice';
import ConfirmDialog from '../components/common/feedback/ConfirmDialog';

const drawerWidth = 260;

const navigationItems = [
  {
    label: 'Projects',
    icon: DashboardIcon,
    path: '/projects',
    roles: ['admin', 'project_manager', 'developer', 'viewer'],
  },
  {
    label: 'Tasks',
    icon: AssignmentIcon,
    path: '/tasks',
    roles: ['admin', 'project_manager', 'developer', 'viewer'],
  },
  {
    label: 'Teams',
    icon: GroupIcon,
    path: '/teams',
    roles: ['admin', 'project_manager', 'developer', 'viewer'],
  },
  {
    label: 'Reports',
    icon: BarChartIcon,
    path: '/reports',
    roles: ['admin', 'project_manager', 'developer', 'viewer'],
  },
  {
    label: 'Admin',
    icon: AdminPanelSettingsIcon,
    path: '/admin/users',
    roles: ['admin'],
  },
];

const DrawerContent = ({ onNavigate }) => {
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);

  const items = useMemo(
    () => navigationItems.filter((item) => item.roles.includes(user?.role)),
    [user?.role],
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Fixl Projects
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {items.map((item) => {
          const Icon = item.icon;
          const selected = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton selected={selected} onClick={() => onNavigate(item.path)}>
                <ListItemIcon>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar>{user?.name?.charAt(0) || '?'}</Avatar>
        <Box>
          <Typography variant="subtitle2">{user?.name}</Typography>
          <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
            {user?.role?.replace('_', ' ')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const AppShell = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const ui = useAppSelector((state) => state.ui);
  const originalUser = useAppSelector((state) => state.auth.originalUser);
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (!isDesktop) {
      dispatch(toggleSidebar());
    }
  };

  const handleLogoutRequest = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          borderBottom: 1,
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ display: { lg: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <TextField
            size="small"
            placeholder="Search projects, tasks, people"
            value={ui.globalSearch}
            onChange={(event) => dispatch(setGlobalSearch(event.target.value))}
            sx={{ maxWidth: 320, flexGrow: 1 }}
            InputProps={{
              endAdornment: ui.globalSearch ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => dispatch(setGlobalSearch(''))}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          <Tooltip title="Toggle theme">
            <IconButton color="inherit" onClick={() => dispatch(toggleTheme())}>
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          {originalUser && (
            <Button
              color="warning"
              variant="contained"
              size="small"
              onClick={() => dispatch(stopImpersonation())}
              startIcon={<PersonIcon />}
            >
              Return to {originalUser.name.split(' ')[0]}
            </Button>
          )}
          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={handleLogoutRequest}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
        aria-label="navigation"
      >
        <Drawer
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop ? true : !ui.sidebarCollapsed}
          onClose={isDesktop ? undefined : handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          <DrawerContent onNavigate={handleNavigate} />
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          minHeight: '100vh',
          backgroundColor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
        }}
      >
        <Outlet key={location.pathname} />
      </Box>
      <ConfirmDialog
        open={logoutDialogOpen}
        title="Confirm logout"
        description="You will be signed out of your current session."
        confirmLabel="Logout"
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </Box>
  );
};

export default AppShell;
