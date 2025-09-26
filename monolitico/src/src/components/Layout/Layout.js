import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Carga Excel', icon: <UploadFileIcon />, path: '/upload' },
  { text: 'Búsqueda', icon: <SearchIcon />, path: '/search' },
  { text: 'Alertas', icon: <WarningIcon />, path: '/alerts' },
  { text: 'Reportes', icon: <WarningIcon />, path: '/reportes' }
];

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f4f6f8' }}>
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            HQ-FO-40 Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 240 }}>
          <List>
            {menuItems.map(item => (
              <ListItem button key={item.text} component={Link} to={item.path} selected={location.pathname === item.path} onClick={() => setDrawerOpen(false)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, pt: 8, px: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
