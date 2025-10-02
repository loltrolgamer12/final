import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Tabs,
  Tab,
  Divider,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

// Iconos
import WarningIcon from '@mui/icons-material/Warning';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';

// Componentes estilizados
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
}));

const AlertCard = styled(Card)(({ theme, alertType = 'default' }) => {
  const colors = {
    fatiga: { border: '#f44336', bg: '#fdeded' },
    vehiculo: { border: '#ff9800', bg: '#fff8e1' },
    cumplimiento: { border: '#2196f3', bg: '#e3f2fd' },
    default: { border: '#e0e0e0', bg: '#f5f5f5' }
  };
  
  const color = colors[alertType] || colors.default;
  
  return {
    position: 'relative',
    borderLeft: `4px solid ${color.border}`,
    marginBottom: theme.spacing(2),
    borderRadius: 8,
    backgroundColor: '#ffffff',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: 'inherit',
      background: `linear-gradient(90deg, ${color.bg} 0%, rgba(255,255,255,0) 50%)`,
      opacity: 0.7,
      pointerEvents: 'none'
    }
  };
});

// Página de alertas
export default function AlertsPage() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [tipo, setTipo] = useState('');
  
  // Carga inicial de alertas
  useEffect(() => {
    loadAlertas();
  }, []);
  
  // Función para cargar alertas
  const loadAlertas = async () => {
    setLoading(true);
    setError(null);
    
    try {
  let url = '/api/alerts';
  if (tipo && tipo !== 'todos') url += `?tipo=${tipo}`;
  const res = await axios.get(url);
  setAlertas(res.data.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error al cargar alertas:', error);
      setError('Error al cargar las alertas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Cambiar pestaña
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Separar alertas por tipo
  const alertasVehiculo = Array.isArray(alertas) ? alertas.filter(a => a.tipo === 'VEHICULO_CRITICO') : [];
  const alertasCumplimiento = Array.isArray(alertas) ? alertas.filter(a => a.tipo === 'SIN_TIPO') : [];
  
  // Contenido según pestaña seleccionada
  const alertContent = () => {
    return (
      <>
        <Box sx={{ mb: 2 }}>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="tipo-label" shrink>Tipo</InputLabel>
            <Select
              labelId="tipo-label"
              id="tipo-select"
              value={tipo}
              label="Tipo"
              onChange={e => setTipo(e.target.value)}
              displayEmpty
            >
              <MenuItem value=""><em>Selecciona tipo...</em></MenuItem>
              <MenuItem value="ligero">Ligero</MenuItem>
              <MenuItem value="pesado">Pesado</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 2 }}>
              Alertas de vehículos ({alertasVehiculo.length})
            </Typography>
            {alertasVehiculo.map((alerta, idx) => renderAlertCard(alerta, idx, 'vehiculo'))}
            {alertasVehiculo.length === 0 && renderEmptyAlert('No hay alertas de vehículos')}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 2 }}>
              Cumplimiento ({alertasCumplimiento.length})
            </Typography>
            {alertasCumplimiento.map((alerta, idx) => renderAlertCard(alerta, idx, 'cumplimiento'))}
            {alertasCumplimiento.length === 0 && renderEmptyAlert('No hay alertas de cumplimiento')}
          </Grid>
        </Grid>
      </>
    );
  };
  
  // Estado para modal de motivos
  const [motivosOpen, setMotivosOpen] = useState(false);
  const [motivosData, setMotivosData] = useState(null);

  // Renderizar motivos de fatiga
  const renderMotivosFatiga = (motivos) => {
    if (!motivos) return null;
    const items = [
      { key: 'consumo_medicamentos', label: 'Tomó medicamentos', value: motivos.consumo_medicamentos },
      { key: 'horas_sueno_suficientes', label: 'No durmió 8 horas', value: !motivos.horas_sueno_suficientes },
      { key: 'libre_sintomas_fatiga', label: 'Tiene síntomas de fatiga', value: !motivos.libre_sintomas_fatiga },
      { key: 'condiciones_aptas', label: 'No está en condiciones aptas', value: !motivos.condiciones_aptas }
    ];
    return (
      <List dense>
        {items.filter(i => i.value).map(i => (
          <ListItem key={i.key}>
            <ListItemIcon><CancelIcon color="error" /></ListItemIcon>
            <ListItemText primary={i.label} />
          </ListItem>
        ))}
        {items.filter(i => i.value).length === 0 && (
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText primary="Sin motivos críticos de fatiga" />
          </ListItem>
        )}
      </List>
    );
  };

  // Renderizar tarjeta de alerta
  const renderAlertCard = (alerta, idx, type) => {
    const getIcon = () => {
      switch (type) {
        case 'fatiga': return <ErrorOutlineIcon sx={{ color: '#f44336' }} />;
        case 'vehiculo': return <DirectionsCarIcon sx={{ color: '#ff9800' }} />;
        case 'cumplimiento': return <PersonIcon sx={{ color: '#2196f3' }} />;
        default: return <WarningIcon />;
      }
    };
    
    const getTitle = () => {
      switch (type) {
        case 'fatiga': return 'Fatiga';
        case 'vehiculo': return 'Vehículo crítico';
        case 'cumplimiento': return 'Cumplimiento';
        default: return 'Alerta';
      }
    };
    
    return (
      <AlertCard key={idx} alertType={type}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
              {getIcon()}
              <Box sx={{ ml: 1 }}>{getTitle()}</Box>
            </Typography>
            {alerta.fecha && (
              <Chip 
                size="small" 
                icon={<AccessTimeIcon fontSize="small" />}
                label={new Date(alerta.fecha).toLocaleDateString()} 
                variant="outlined"
              />
            )}
          </Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {alerta.mensaje}
          </Typography>
          {/* Motivos de fatiga resumen */}
          {type === 'fatiga' && alerta.motivos && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="error" sx={{ fontWeight: 500 }}>
                Motivos:
              </Typography>
              {renderMotivosFatiga(alerta.motivos)}
            </Box>
          )}
          <Divider sx={{ my: 1.5, opacity: 0.6 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {alerta.conductor && (
              <Chip 
                size="small" 
                icon={<PersonIcon fontSize="small" />}
                label={alerta.conductor} 
                variant="outlined" 
                onClick={() => { setMotivosData(alerta); setMotivosOpen(true); }}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              />
            )}
            {alerta.placa && (
              <Chip 
                size="small" 
                icon={<DirectionsCarIcon fontSize="small" />}
                label={alerta.placa} 
                variant="outlined" 
              />
            )}
          </Box>
        </CardContent>
      </AlertCard>
    );
  };
  
  // Renderizar mensaje de alerta vacía
  const renderEmptyAlert = (message, fullWidth = false) => (
    <Box 
      sx={{ 
        backgroundColor: '#f5f5f5', 
        border: '1px dashed #e0e0e0', 
        borderRadius: 1, 
        p: 2, 
        textAlign: 'center',
        width: fullWidth ? '100%' : 'auto'
      }}
    >
      <CheckCircleIcon sx={{ color: '#4caf50', mb: 1, fontSize: fullWidth ? 40 : 24 }} />
      <Typography color="text.secondary" variant={fullWidth ? 'subtitle1' : 'body2'}>
        {message}
      </Typography>
    </Box>
  );
  
  // Modal de motivos de fatiga
  const renderMotivosModal = () => (
    <Dialog open={motivosOpen} onClose={() => setMotivosOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Motivos de fatiga</DialogTitle>
      <DialogContent>
        {motivosData && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {motivosData.conductor} - {motivosData.placa}
            </Typography>
            {renderMotivosFatiga(motivosData.motivos)}
          </>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 500 }}>
        Centro de Alertas
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Monitoreo de alertas críticas de seguridad, fatiga y mantenimiento de vehículos.
      </Typography>
      
      {/* Resumen de alertas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorOutlineIcon sx={{ color: '#f44336', mr: 1 }} />
                <Typography variant="h6">Alertas de fatiga</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                {alertasFatiga.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Conductores con signos de fatiga o bajo descanso
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DirectionsCarIcon sx={{ color: '#ff9800', mr: 1 }} />
                <Typography variant="h6">Vehículos críticos</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                {alertasVehiculo.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vehículos con fallas en componentes importantes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon sx={{ color: '#2196f3', mr: 1 }} />
                <Typography variant="h6">Cumplimiento</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                {alertasCumplimiento.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Conductores sin inspección reciente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <StyledPaper>
        {renderMotivosModal()}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsActiveIcon sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant="h6" fontWeight="500">
              Alertas del sistema
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                Actualizado: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
            
            <Button 
              size="small" 
              startIcon={<RefreshIcon />} 
              onClick={loadAlertas}
              disabled={loading}
            >
              Actualizar
            </Button>
          </Box>
        </Box>
        
        {/* Tabs para filtrar alertas */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={`Todas (${alertas.length})`} 
            icon={<WarningIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={`Fatiga (${alertasFatiga.length})`} 
            icon={<ErrorOutlineIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={`Vehículos (${alertasVehiculo.length})`} 
            icon={<DirectionsCarIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={`Cumplimiento (${alertasCumplimiento.length})`} 
            icon={<PersonIcon />} 
            iconPosition="start"
          />
        </Tabs>
        
        {/* Contenido de alertas */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}
        
        {!loading && !error && alertContent()}
      </StyledPaper>
    </Box>
  );
}