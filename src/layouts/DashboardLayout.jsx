import { useEffect, useMemo, useRef, useState } from 'react';
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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { toggleSidebar, toggleTheme, setGlobalSearch } from '../features/ui/uiSlice';
import { logout, stopImpersonation } from '../features/auth/authSlice';
import ConfirmDialog from '../components/common/feedback/ConfirmDialog';

const drawerWidth = 260;
const collapsedDrawerWidth = 76;

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

const DrawerContent = ({ onNavigate, collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);

  const items = useMemo(
    () => navigationItems.filter((item) => item.roles.includes(user?.role)),
    [user?.role],
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 0 : 2,
          py: 2,
        }}
      >
        {!collapsed && (
          <Typography variant="h6" noWrap component="div">
            Fixl Projects
          </Typography>
        )}
        <Tooltip title={collapsed ? 'Expand navigation' : 'Collapse navigation'} placement="right">
          <IconButton size="small" onClick={onToggleCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1, py: 1 }}>
        {items.map((item) => {
          const Icon = item.icon;
          const selected = location.pathname.startsWith(item.path);
          const button = (
            <ListItemButton
              selected={selected}
              onClick={() => onNavigate(item.path)}
              sx={{
                minHeight: 44,
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1.5 : 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 0 : 2,
                  justifyContent: 'center',
                  color: selected ? 'primary.main' : 'text.secondary',
                }}
              >
                <Icon fontSize="small" />
              </ListItemIcon>
              {!collapsed && <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: selected ? 600 : 500 }} />}
            </ListItemButton>
          );
          return (
            <ListItem key={item.path} disablePadding>
              {collapsed ? (
                <Tooltip title={item.label} placement="right">
                  {button}
                </Tooltip>
              ) : (
                button
              )}
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : 2,
          }}
        >
          <Avatar>{user?.name?.charAt(0) || '?'}</Avatar>
          {!collapsed && (
            <Box>
              <Typography variant="subtitle2" noWrap>
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ textTransform: 'capitalize' }} color="text.secondary">
                {user?.role?.replace('_', ' ')}
              </Typography>
            </Box>
          )}
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
  const [desktopInitialized, setDesktopInitialized] = useState(false);
  const prevIsDesktop = useRef(isDesktop);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    if (isDesktop && !desktopInitialized) {
      setDesktopInitialized(true);
      if (ui.sidebarCollapsed) {
        dispatch(toggleSidebar());
      }
    }
  }, [dispatch, isDesktop, desktopInitialized, ui.sidebarCollapsed]);

  useEffect(() => {
    if (!isDesktop && prevIsDesktop.current && !ui.sidebarCollapsed) {
      dispatch(toggleSidebar());
    }
    prevIsDesktop.current = isDesktop;
  }, [dispatch, isDesktop, ui.sidebarCollapsed]);

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

  const isCollapsed = isDesktop ? ui.sidebarCollapsed : false;
  const currentDrawerWidth = isDesktop ? (isCollapsed ? collapsedDrawerWidth : drawerWidth) : drawerWidth;
  const drawerVariant = isDesktop ? 'permanent' : 'temporary';
  const isDrawerOpen = isDesktop ? true : !ui.sidebarCollapsed;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          width: { lg: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { lg: `${currentDrawerWidth}px` },
          borderBottom: 1,
          borderColor: 'divider',
          boxShadow: 'none',
          transition: (themeArg) =>
            themeArg.transitions.create(['margin-left', 'width'], {
              easing: themeArg.transitions.easing.sharp,
              duration: themeArg.transitions.duration.standard,
            }),
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
        sx={{
          width: { lg: currentDrawerWidth },
          flexShrink: { lg: 0 },
          transition: (themeArg) =>
            themeArg.transitions.create('width', {
              easing: themeArg.transitions.easing.easeInOut,
              duration: themeArg.transitions.duration.standard,
            }),
        }}
        aria-label="navigation"
      >
        <Drawer
          variant={drawerVariant}
          open={drawerVariant === 'temporary' ? isDrawerOpen : undefined}
          onClose={drawerVariant === 'temporary' ? handleDrawerToggle : undefined}
          ModalProps={{ keepMounted: true }}
          sx={{
            width: { lg: currentDrawerWidth },
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentDrawerWidth,
              overflowX: 'hidden',
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.standard,
              }),
            },
          }}
        >
          <DrawerContent
            onNavigate={handleNavigate}
            collapsed={isCollapsed}
            onToggleCollapse={() => dispatch(toggleSidebar())}
          />
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          transition: (themeArg) =>
            themeArg.transitions.create(['margin-left', 'padding'], {
              easing: themeArg.transitions.easing.sharp,
              duration: themeArg.transitions.duration.standard,
            }),
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
