import React from 'react';
import { 
  Box, 
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Badge,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';

// Iconos
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import WarningIcon from '@mui/icons-material/Warning';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SearchIcon from '@mui/icons-material/Search';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';

// Ruta relativa al logo
const logoUrl = '/logo.jpeg';

// Menú lateral estilizado
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 205,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 205,
    boxSizing: 'border-box',
    borderRight: 'none',
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.05)',
  },
}));

// Item de menú estilizado
const StyledMenuItem = styled(ListItem)(({ theme, selected }) => ({
  margin: '4px 8px',
  borderRadius: '8px',
  backgroundColor: selected ? '#e3f2fd' : 'transparent',
  color: selected ? theme.palette.primary.main : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: selected ? '#e3f2fd' : '#f5f5f5',
  },
  '& .MuiListItemIcon-root': {
    color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
    minWidth: '40px',
  },
  transition: 'background-color 0.2s ease-in-out',
}));

// Barra de navegación estilizada
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'white',
  color: theme.palette.text.primary,
  boxShadow: 'none',
  borderBottom: '1px solid #f0f0f0',
}));

// Contenido principal
const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  backgroundColor: '#f8f9fa',
  padding: theme.spacing(3),
  minHeight: '100vh',
}));

// Chip de versión
const VersionChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#47d16c',
  color: 'white',
  fontWeight: 'bold',
  borderRadius: '8px',
  '& .MuiChip-label': {
    padding: '0 10px',
  }
}));

// Opciones del menú
const menuItems = [
  { text: 'Inicio', icon: <HomeIcon />, path: '/' },
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Conductores', icon: <PersonIcon />, path: '/conductores' },
  { text: 'Vehículos', icon: <DirectionsCarIcon />, path: '/vehiculos' },
  { text: 'Control de Fatiga', icon: <WarningIcon />, path: '/alerts' },
  { text: 'Carga Excel', icon: <FileUploadIcon />, path: '/upload' },
  { text: 'Reportes', icon: <AssessmentIcon />, path: '/reportes' },
  { text: 'Búsqueda', icon: <SearchIcon />, path: '/search' },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [logoError, setLogoError] = React.useState(false);

  // Manejar errores de carga del logo
  const handleLogoError = () => {
    console.error('Error al cargar el logo');
    setLogoError(true);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Menú lateral */}
      <StyledDrawer variant="permanent">
        {/* Título del sistema */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1.5,
            bgcolor: '#3474eb',
            color: 'white',
            height: '64px'
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" align="center">
            Sistema de Inspección Vehicular
          </Typography>
        </Box>

        {/* Elementos del menú */}
        <List sx={{ py: 2 }}>
          {menuItems.map((item) => (
            <StyledMenuItem
              key={item.text}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </StyledMenuItem>
          ))}
        </List>
      </StyledDrawer>

      {/* Contenido principal */}
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Barra superior */}
        <StyledAppBar position="sticky" elevation={0}>
          <Toolbar>
            {/* Logo y título */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ display: 'flex', mr: 1.5 }}>
                <ElectricBoltIcon sx={{ color: '#3474eb' }} />
              </Box>
              <Typography variant="h6" fontWeight="500">
                Sistema de Inspección Vehicular
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Badge de versión */}
            <Box sx={{ mr: 2 }}>
              <VersionChip 
                size="small" 
                label="v3.0.0 PROFESIONAL" 
                icon={<Badge variant="dot" color="success" />} 
              />
            </Box>

            {/* Logo de la empresa */}
            {!logoError && (
              <Avatar 
                src={logoUrl} 
                alt="Logo Empresa"
                onError={handleLogoError}
                sx={{ 
                  width: 40, 
                  height: 40,
                  border: '1px solid #f0f0f0',
                  backgroundColor: 'white'
                }}
              />
            )}
          </Toolbar>
        </StyledAppBar>

        {/* Contenido */}
        <Main>
          {children}
        </Main>
      </Box>
    </Box>
  );
}