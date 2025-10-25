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
  CircularProgress,
  TextField,
  Stack,
  Button,
  Tooltip,
  IconButton,
  Snackbar
} from '@mui/material';
import StatusCard from '../components/common/StatusCard';
import TipoSelector from '../components/common/TipoSelector';
import { useNavigate } from 'react-router-dom';
import StorageIcon from '@mui/icons-material/Storage';
import ApiIcon from '@mui/icons-material/Api';
import DevicesIcon from '@mui/icons-material/Devices';
import SpeedIcon from '@mui/icons-material/Speed';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';
import KpiCharts from '../components/common/KpiCharts';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

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

  // Filtros avanzados - igual que en Vehiculos y Conductores
  const [filtros, setFiltros] = useState(() => {
    const fav = localStorage.getItem('dashboard_favoritos');
    return fav ? JSON.parse(fav) : {
      dia: '', mes: '', ano: '', conductor: '', placa: '', cumplimiento: '', 
      critico: '', fatiga: '', contrato: '', campo: ''
    };
  });

  // Opciones para contrato y campo
  const [contratoOptions, setContratoOptions] = useState([]);
  const [campoOptions, setCampoOptions] = useState([]);
  
  // Favoritos y notificaciones
  const [esFavorito, setEsFavorito] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Arrays para selects de fecha
  const dias = Array.from({ length: 31 }, (_, i) => i + 1);
  const meses = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
  ];
  const anoActual = new Date().getFullYear();
  const anos = Array.from({ length: 6 }, (_, i) => anoActual - i);

  // Cargar opciones de contrato y campo
  useEffect(() => {
    api.get('/filtros/vehiculos').then(res => {
      setContratoOptions(res.data.data.contratos || []);
      setCampoOptions(res.data.data.campos || []);
    });
  }, []);

  // Verificar si los filtros actuales son favoritos
  useEffect(() => {
    const fav = localStorage.getItem('dashboard_favoritos');
    setEsFavorito(fav && JSON.stringify(filtros) === fav);
  }, [filtros]);

  /**
   * Función para cargar datos del dashboard con filtros
   */
  const fetchDashboardData = async (params = {}) => {
    setError(null);
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (tipo) query.append('tipo', tipo);
      if (params.dia) query.append('dia', params.dia);
      if (params.mes) query.append('mes', params.mes);
      if (params.ano) query.append('ano', params.ano);
      if (params.conductor) query.append('conductor', params.conductor);
      if (params.placa) query.append('placa', params.placa);
      if (params.cumplimiento !== '') query.append('cumplimiento', params.cumplimiento);
      if (params.critico !== '') query.append('critico', params.critico);
      if (params.fatiga !== '') query.append('fatiga', params.fatiga);
      if (params.contrato) query.append('contrato', params.contrato);
      if (params.campo) query.append('campo', params.campo);

      const url = query.toString() ? `/dashboard?${query}` : '/dashboard';
      const response = await api.get(url);
      
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
  };

  /**
   * Efecto para cargar datos del dashboard cuando cambia el tipo
   */
  useEffect(() => {
    fetchDashboardData(filtros);
  }, [tipo]);

  // Manejar cambios en filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBuscar = () => {
    fetchDashboardData(filtros);
    setSnackbar({ open: true, message: 'Filtros aplicados al dashboard', severity: 'success' });
  };

  const handleLimpiar = () => {
    const filtrosLimpios = { dia: '', mes: '', ano: '', conductor: '', placa: '', cumplimiento: '', 
      critico: '', fatiga: '', contrato: '', campo: '' };
    setFiltros(filtrosLimpios);
    fetchDashboardData(filtrosLimpios);
    setSnackbar({ open: true, message: 'Filtros limpiados', severity: 'info' });
    setEsFavorito(false);
  };

  // Favoritos
  const handleFavorito = () => {
    if (esFavorito) {
      localStorage.removeItem('dashboard_favoritos');
      setSnackbar({ open: true, message: 'Favorito eliminado', severity: 'info' });
    } else {
      localStorage.setItem('dashboard_favoritos', JSON.stringify(filtros));
      setSnackbar({ open: true, message: 'Filtro guardado como favorito', severity: 'success' });
    }
    setEsFavorito(!esFavorito);
  };

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

      {/* Filtros avanzados - igual que en Vehículos y Conductores */}
      <Paper sx={{ p: 2, borderRadius: 2, mb: 3, background: '#f7fafd', boxShadow: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Filtros Avanzados
          </Typography>
          <Tooltip title={esFavorito ? 'Eliminar favorito' : 'Guardar filtros como favorito'}>
            <IconButton onClick={handleFavorito} color={esFavorito ? 'warning' : 'default'}>
              {esFavorito ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Tooltip>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="flex-start" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel shrink>Contrato</InputLabel>
            <Select
              label="Contrato"
              name="contrato"
              value={filtros.contrato}
              onChange={handleFiltroChange}
              displayEmpty
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              {contratoOptions.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel shrink>Campo/Coordinación</InputLabel>
            <Select
              label="Campo/Coordinación"
              name="campo"
              value={filtros.campo}
              onChange={handleFiltroChange}
              displayEmpty
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              {campoOptions.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 90 }}>
            <InputLabel shrink>Día</InputLabel>
            <Select label="Día" name="dia" value={filtros.dia} onChange={handleFiltroChange} displayEmpty>
              <MenuItem value=""><em>Todos</em></MenuItem>
              {dias.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel shrink>Mes</InputLabel>
            <Select label="Mes" name="mes" value={filtros.mes} onChange={handleFiltroChange} displayEmpty>
              <MenuItem value=""><em>Todos</em></MenuItem>
              {meses.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel shrink>Año</InputLabel>
            <Select label="Año" name="ano" value={filtros.ano} onChange={handleFiltroChange} displayEmpty>
              <MenuItem value=""><em>Todos</em></MenuItem>
              {anos.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField size="small" label="Conductor" name="conductor" value={filtros.conductor} onChange={handleFiltroChange} sx={{ minWidth: 180 }} />
          <TextField size="small" label="Placa" name="placa" value={filtros.placa} onChange={handleFiltroChange} sx={{ minWidth: 120 }} />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel shrink>Cumplimiento</InputLabel>
            <Select 
              label="Cumplimiento" 
              name="cumplimiento" 
              value={filtros.cumplimiento} 
              onChange={handleFiltroChange}
              displayEmpty
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="true">Cumple</MenuItem>
              <MenuItem value="false">No cumple</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel shrink>Crítico</InputLabel>
            <Select 
              label="Crítico" 
              name="critico" 
              value={filtros.critico} 
              onChange={handleFiltroChange}
              displayEmpty
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="true">Sí</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel shrink>Fatiga</InputLabel>
            <Select 
              label="Fatiga" 
              name="fatiga" 
              value={filtros.fatiga} 
              onChange={handleFiltroChange}
              displayEmpty
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="true">Sí</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleBuscar} sx={{ minWidth: 100 }}>
            Buscar
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleLimpiar} sx={{ minWidth: 100 }}>
            Limpiar
          </Button>
        </Stack>
      </Paper>

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

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: snackbar.severity === 'error' ? '#d32f2f' : 
                           snackbar.severity === 'warning' ? '#ed6c02' : 
                           snackbar.severity === 'success' ? '#2e7d32' : '#1976d2',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 1,
            boxShadow: 3
          }}
        >
          <Typography variant="body2">{snackbar.message}</Typography>
          <IconButton
            size="small"
            onClick={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ color: 'white', ml: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Snackbar>
    </Box>
  );
}