import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  LinearProgress,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Iconos
import StorageIcon from '@mui/icons-material/Storage';
import ApiIcon from '@mui/icons-material/Api';
import DevicesIcon from '@mui/icons-material/Devices';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import api from '../services/api';
import KpiCharts from '../components/common/KpiCharts';

// Componentes estilizados
const StatusCard = styled(Box)(({ theme, status }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderRadius: 8,
  backgroundColor: '#f8f9fa',
  border: '1px solid #f0f0f0',
  '& .MuiChip-root': {
    backgroundColor: status === 'Conectada' ? '#47d16c' : status === 'Operativo' ? '#47d16c' : status === 'N/A' ? '#ffc107' : '#e0e0e0',
    color: status === 'Conectada' || status === 'Operativo' ? 'white' : status === 'N/A' ? '#333' : 'initial',
  }
}));

const ModuleCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
}));

const StyledButton = styled(Button)(({ theme, color = 'primary' }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 500,
  backgroundColor: color === 'primary' ? '#1976d2' : color === 'success' ? '#2e7d32' : '#9c27b0',
  '&:hover': {
    backgroundColor: color === 'primary' ? '#1565c0' : color === 'success' ? '#2e7d32' : '#7b1fa2',
  }
}));

const FeatureItem = styled(ListItem)({
  padding: '4px 0',
});

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInspecciones: 0,
    altoRiesgo: 0,
    medioRiesgo: 0,
    bajoRiesgo: 0,
    uptime: '99.9%',
    responseTime: '<300ms'
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/dashboard');
        if (response.data.success) {
          setStats({
            ...stats,
            totalInspecciones: response.data.data.total || 0,
            altoRiesgo: response.data.data.altoRiesgo || 0,
            medioRiesgo: response.data.data.medioRiesgo || 0,
            bajoRiesgo: response.data.data.bajoRiesgo || 0,
          });
        }
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleCardClick = (path) => {
    navigate(path);
  };

  // Indicadores de estado del sistema
  const systemStatusItems = [
    { label: 'Base de Datos', icon: <StorageIcon />, status: 'Conectada' },
    { label: 'API Status', icon: <ApiIcon />, status: 'Operativo' },
    { label: 'Entorno', icon: <DevicesIcon />, status: 'production' },
    { label: 'Performance', icon: <SpeedIcon />, status: 'N/A' }
  ];

  return (
    <Box>
      {/* Título principal */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 500 }}>
          Panel Ejecutivo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Resumen operativo y estado del sistema. Visualiza el pulso de la operación en tiempo real.
        </Typography>
      </Box>

      {/* Estado del sistema */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 4, 
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          borderLeft: '4px solid #1976d2'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <DashboardIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6">Estado del Sistema</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Monitoreo de servicios críticos y conexiones principales.
        </Typography>
        <Grid container spacing={2}>
          {systemStatusItems.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.label}>
              <StatusCard status={item.status}>
                <Box sx={{ mr: 1 }}>{item.icon}</Box>
                <Box sx={{ flexGrow: 1, mr: 1 }}>
                  <Typography variant="body2">{item.label}</Typography>
                </Box>
                <Chip 
                  label={item.status} 
                  size="small" 
                />
              </StatusCard>
            </Grid>
          ))}
        </Grid>
      </Paper>


      {/* Gráficas de KPIs */}
      <Box sx={{ mt: 4, mb: 4 }}>
        <KpiCharts stats={stats} />
      </Box>

      {/* Métricas de resumen */}
      <Paper sx={{ p: 3, mt: 4, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Resumen Operativo</Typography>
        {loading ? <LinearProgress /> : (
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="text.primary">{stats.totalInspecciones}</Typography>
                <Typography variant="body2" color="text.secondary">Inspecciones Totales</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="error.main">{stats.altoRiesgo}</Typography>
                <Typography variant="body2" color="text.secondary">Alertas Críticas</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="warning.main">{stats.medioRiesgo}</Typography>
                <Typography variant="body2" color="text.secondary">Riesgo Medio</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="success.main">{stats.bajoRiesgo}</Typography>
                <Typography variant="body2" color="text.secondary">Condiciones Normales</Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
} 