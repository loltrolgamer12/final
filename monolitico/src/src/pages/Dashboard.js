/**
 * Dashboard
 * Página principal del panel ejecutivo.
 * Muestra KPIs, estado del sistema y selector de tipo de camión.
 * - Loader visual mientras se cargan datos.
 * - Manejo de errores amigable.
 * - Selector de tipo reutilizable.
 * - KPIs solo si el usuario selecciona tipo.
 *
 * Componentes usados:
 * - StatusCard: indicador visual de estado.
 * - TipoSelector: selector de tipo de camión.
 * - KpiCharts: gráficas de KPIs.
 *
 * Autor: [Tu nombre]
 */
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import StatusCard from '../components/common/StatusCard';
import TipoSelector from '../components/common/TipoSelector';
import { useNavigate } from 'react-router-dom';
import StorageIcon from '@mui/icons-material/Storage';
import ApiIcon from '@mui/icons-material/Api';
import DevicesIcon from '@mui/icons-material/Devices';
import SpeedIcon from '@mui/icons-material/Speed';
import DashboardIcon from '@mui/icons-material/Dashboard';
import api from '../services/api';
import KpiCharts from '../components/common/KpiCharts';

// Eliminado: StatusCard estilizado local. Usar componente importado.

export default function Dashboard() {
  /**
   * Estado principal del dashboard
   * @param {boolean} loading - Si está cargando datos
   * @param {object} stats - KPIs principales
   * @param {string} tipo - Tipo de camión seleccionado
   * @param {string|null} error - Mensaje de error si ocurre
   */
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInspecciones: 0,
    altoRiesgo: 0,
    medioRiesgo: 0,
    bajoRiesgo: 0,
    uptime: '99.9%',
    responseTime: '<300ms',
    totalRechazados: 0,
    motivosRechazo: []
  });
  const [tipo, setTipo] = useState(''); // El usuario debe elegir explícitamente
  const [error, setError] = useState(null);

  /**
   * Efecto para cargar datos del dashboard cuando cambia el tipo
   */
  useEffect(() => {
    async function fetchData() {
      setError(null);
      try {
        const response = await api.get(`/dashboard${tipo ? `?tipo=${tipo}` : ''}`);
        if (response.data.success) {
          setStats(prev => ({
            ...prev,
            totalInspecciones: response.data.data.totalInspecciones || 0,
            altoRiesgo: response.data.data.altoRiesgo || 0,
            medioRiesgo: response.data.data.medioRiesgo || 0,
            bajoRiesgo: response.data.data.bajoRiesgo || 0,
            totalRechazados: response.data.data.totalRechazados || 0,
            motivosRechazo: response.data.data.motivosRechazo || []
          }));
        } else {
          setError('No se pudo obtener los datos del dashboard.');
        }
      } catch (err) {
        setError('Error al cargar datos del dashboard.');
        console.error('Error al cargar datos del dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tipo]);

  // Indicadores de estado del sistema
  const systemStatusItems = [
    { label: 'Base de Datos', icon: <StorageIcon />, status: 'Conectada' },
    { label: 'API Status', icon: <ApiIcon />, status: 'Operativo' },
    { label: 'Entorno', icon: <DevicesIcon />, status: 'production' },
    { label: 'Performance', icon: <SpeedIcon />, status: 'N/A' }
  ];

  /**
   * Render principal del dashboard
   * - Título y selector de tipo
   * - Loader visual
   * - Error visual
   * - Estado del sistema
   * - KPIs
   */
  return (
    <Box>
      {/* Título principal y filtro de tipo */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 500 }}>
            Panel Ejecutivo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Resumen operativo y estado del sistema. Visualiza el pulso de la operación en tiempo real.
          </Typography>
        </Box>
        <TipoSelector value={tipo} onChange={e => setTipo(e.target.value)} loading={loading} />
      </Box>

      {/* Loader visual */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
          <CircularProgress color="primary" aria-label="Cargando dashboard" />
        </Box>
      )}

      {/* Error visual */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error" role="alert">
            {error}
          </Typography>
        </Box>
      )}

      {/* Estado del sistema */}
      {!loading && !error && (
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
                <StatusCard status={item.status} icon={item.icon} label={<Typography variant="body2">{item.label}</Typography>} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Gráficas de KPIs solo si hay tipo seleccionado */}
      {!loading && !error && tipo && (
        <Box sx={{ mt: 4, mb: 4 }}>
          <KpiCharts stats={stats} />
          {/* KPIs de datos rechazados y motivos */}
          <Paper sx={{ mt: 4, p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Datos rechazados
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Total de registros rechazados: <strong>{stats.totalRechazados}</strong>
            </Typography>
            {stats.motivosRechazo.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Motivos principales de rechazo</Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.motivosRechazo}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="motivo" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#dc3545" />
                  </BarChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Lista de motivos:</Typography>
                  <ul>
                    {stats.motivosRechazo.map((m) => (
                      <li key={m.motivo}><strong>{m.motivo}:</strong> {m.count}</li>
                    ))}
                  </ul>
                </Box>
              </>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
}