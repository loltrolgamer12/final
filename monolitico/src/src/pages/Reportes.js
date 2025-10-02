import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  TextField,
  Tooltip,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

// Iconos
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Componentes estilizados
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
}));

const StyledButton = styled(Button)(({ theme, color }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 500,
  boxShadow: 'none',
  padding: '10px 24px',
  '&.MuiButton-contained': {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
  }
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  borderRadius: 8,
  marginTop: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  '&:before': {
    display: 'none',
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  '&.Mui-expanded': {
    borderBottom: '1px solid #f0f0f0',
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  '.MuiOutlinedInput-notchedOutline': {
    borderColor: '#e0e0e0',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
}));

// Página de reportes
export default function ReportesPage() {
  const [diaInicio, setDiaInicio] = useState('');
  const [diaFin, setDiaFin] = useState('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [reporte, setReporte] = useState(null);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [tipo, setTipo] = useState(''); // El usuario debe elegir explícitamente
  const [contrato, setContrato] = useState('');
  const [campo, setCampo] = useState('');
  const [contratoOptions, setContratoOptions] = useState([]);
  const [campoOptions, setCampoOptions] = useState([]);

  useEffect(() => {
    // Obtener opciones de contrato y campo al montar
    axios.get('/api/filtros/vehiculos').then(res => {
      setContratoOptions(res.data.data.contratos || []);
      setCampoOptions(res.data.data.campos || []);
    });
  }, []);

  // Meses y años disponibles para selección
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const añoActual = new Date().getFullYear();
  const anos = Array.from({ length: 6 }, (_, i) => añoActual - 5 + i);

  // Generar reporte
  const handleGenerar = async () => {
    if (!mes || !ano) {
      setError('Seleccione mes y año para generar el reporte');
      return;
    }
    setLoading(true);
    setError(null);
    setReporte(null);
    try {
      let url = `/api/reportes?mes=${mes}&ano=${ano}`;
      if (diaInicio) url += `&diaInicio=${diaInicio}`;
      if (diaFin) url += `&diaFin=${diaFin}`;
  if (tipo && tipo !== 'todos') url += `&tipo=${tipo}`;
      if (contrato) url += `&contrato=${encodeURIComponent(contrato)}`;
      if (campo) url += `&campo=${encodeURIComponent(campo)}`;
      const res = await axios.get(url);
      setReporte(res.data.data);
    } catch (err) {
      console.error('Error al generar reporte:', err);
      setError('Error al generar el reporte. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Descargar reporte en PDF
  const handleDescargarPDF = async () => {
    if (!mes || !ano) return;
    
    setExportLoading(true);
    
    try {
      const res = await axios.get(`/api/reportes/pdf?mes=${mes}&ano=${ano}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${meses[mes-1]}_${ano}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      setError('Error al descargar PDF. Por favor, intente nuevamente.');
    } finally {
      setExportLoading(false);
    }
  };

  // Descargar reporte en Excel
  const handleDescargarExcel = async () => {
    if (!mes || !ano) return;
    
    setExportLoading(true);
    
    try {
      let url = `/api/reportes/excel?mes=${mes}&ano=${ano}`;
      if (diaInicio) url += `&diaInicio=${diaInicio}`;
      if (diaFin) url += `&diaFin=${diaFin}`;
      
      const res = await axios.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `reporte_${meses[mes-1]}_${ano}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al descargar Excel:', error);
      setError('Error al descargar Excel. Por favor, intente nuevamente.');
    } finally {
      setExportLoading(false);
    }
  };

  // Componente para tabla genérica
  function TablaMensajes({ titulo, icono, color, mensajes }) {
    const columns = [
      { field: 'id', headerName: '#', width: 70 },
      { field: 'mensaje', headerName: 'Detalle', flex: 1 }
    ];
    
    const rows = mensajes.map((msg, idx) => ({ 
      id: idx + 1, 
      mensaje: msg 
    }));

    return (
      <StyledAccordion>
        <StyledAccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ 
            backgroundColor: color === 'error.main' ? '#fff5f5' : 
                              color === 'warning.main' ? '#fffbeb' : 
                              color === 'info.main' ? '#f0f7ff' : '#f5f5f5'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ color, mr: 1.5 }}>
              {icono}
            </Box>
            <Typography variant="subtitle1" fontWeight="500">
              {titulo} ({mensajes.length})
            </Typography>
          </Box>
        </StyledAccordionSummary>
        
        <AccordionDetails>
          {mensajes.length > 0 ? (
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                density="standard"
                disableSelectionOnClick
                sx={{
                  borderRadius: 2,
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#fafafa',
                  }
                }}
              />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="success.main" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WarningIcon sx={{ mr: 1, opacity: 0.6 }} />
                No se encontraron registros en este período
              </Typography>
            </Box>
          )}
        </AccordionDetails>
      </StyledAccordion>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 500 }}>
        Reportes y Análisis
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Genera reportes detallados de inspecciones por períodos para análisis y seguimiento.
      </Typography>
      
      <StyledPaper>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AssessmentIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" fontWeight="500">
            Generador de reportes
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Seleccione el período del reporte
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth variant="outlined" size="medium">
                    <InputLabel id="tipo-label">Tipo</InputLabel>
                    <StyledSelect
                      labelId="tipo-label"
                      value={tipo}
                      onChange={e => setTipo(e.target.value)}
                      label="Tipo"
                    >
                      <MenuItem value=""><em>Selecciona tipo...</em></MenuItem>
                      <MenuItem value="todos">Todos</MenuItem>
                      <MenuItem value="ligero">Ligero</MenuItem>
                      <MenuItem value="pesado">Pesado</MenuItem>
                    </StyledSelect>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel shrink>Contrato</InputLabel>
                    <Select
                      label="Contrato"
                      value={contrato}
                      onChange={e => setContrato(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value=""><em>Todos</em></MenuItem>
                      {contratoOptions.map((c) => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel shrink>Campo/Coordinación</InputLabel>
                    <Select
                      label="Campo/Coordinación"
                      value={campo}
                      onChange={e => setCampo(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value=""><em>Todos</em></MenuItem>
                      {campoOptions.map((c) => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth variant="outlined" size="medium">
                    <InputLabel id="mes-label">Mes</InputLabel>
                    <StyledSelect
                      labelId="mes-label"
                      value={mes}
                      onChange={e => setMes(e.target.value)}
                      label="Mes"
                    >
                      {meses.map((m, i) => (
                        <MenuItem key={m} value={i + 1}>{m}</MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth variant="outlined" size="medium">
                    <InputLabel id="ano-label">Año</InputLabel>
                    <StyledSelect
                      labelId="ano-label"
                      value={ano}
                      onChange={e => setAno(e.target.value)}
                      label="Año"
                    >
                      {anos.map(a => (
                        <MenuItem key={a} value={a}>{a}</MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Día inicio"
                      type="number"
                      InputProps={{ inputProps: { min: 1, max: 31 } }}
                      value={diaInicio}
                      onChange={e => setDiaInicio(e.target.value)}
                      placeholder="Opcional"
                      fullWidth
                    />
                    <TextField
                      label="Día fin"
                      type="number"
                      InputProps={{ inputProps: { min: 1, max: 31 } }}
                      value={diaFin}
                      onChange={e => setDiaFin(e.target.value)}
                      placeholder="Opcional"
                      fullWidth
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <StyledButton 
                variant="contained" 
                startIcon={<CalendarMonthIcon />}
                onClick={handleGenerar} 
                disabled={!mes || !ano || loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Generar reporte'}
              </StyledButton>
              
              <StyledButton 
                variant="outlined" 
                startIcon={<PictureAsPdfIcon />}
                onClick={handleDescargarPDF} 
                disabled={!mes || !ano || loading || exportLoading}
              >
                PDF
              </StyledButton>
              
              <StyledButton 
                variant="outlined" 
                startIcon={<DescriptionIcon />}
                onClick={handleDescargarExcel} 
                disabled={!mes || !ano || loading || exportLoading}
              >
                Excel
              </StyledButton>
            </Box>
            
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: '#f8f9fa', border: '1px solid #f0f0f0', height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Información</span>
                    <Tooltip title="Ayuda sobre reportes">
                      <IconButton size="small">
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body2" paragraph>
                  Los reportes generados incluyen:
                </Typography>
                
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box component="span" sx={{ color: 'primary.main', mr: 1, display: 'flex' }}>
                    <AssessmentIcon fontSize="small" />
                  </Box>
                  Estadísticas generales del período
                </Typography>
                
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box component="span" sx={{ color: 'error.main', mr: 1, display: 'flex' }}>
                    <ErrorIcon fontSize="small" />
                  </Box>
                  Alertas críticas y de seguridad
                </Typography>
                
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box component="span" sx={{ color: 'warning.main', mr: 1, display: 'flex' }}>
                    <PeopleIcon fontSize="small" />
                  </Box>
                  Control de fatiga de conductores
                </Typography>
                
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ color: 'info.main', mr: 1, display: 'flex' }}>
                    <DirectionsCarIcon fontSize="small" />
                  </Box>
                  Estado de vehículos y mantenimiento
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* Contenido del reporte */}
        {reporte && !loading && (
          <Box mt={5}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ mr: 1 }} /> 
              Reporte: {meses[mes-1]} {ano}
              {(diaInicio || diaFin) && ` (${diaInicio || '1'} al ${diaFin || '31'})`}
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            {/* Tarjetas de KPIs */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <Card sx={{ backgroundColor: '#f5f9ff', border: '1px solid #e3f2fd' }}>
                  <CardContent>
                    <Typography variant="h6" color="primary">Total inspecciones</Typography>
                    <Typography variant="h3" fontWeight="bold" color="primary.dark">
                      {reporte.totalInspecciones}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card sx={{ backgroundColor: '#fff5f5', border: '1px solid #ffebee' }}>
                  <CardContent>
                    <Typography variant="h6" color="error">Alertas críticas</Typography>
                    <Typography variant="h3" fontWeight="bold" color="error.dark">
                      {reporte.totalAlertas}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: '#f5f5f5', border: '1px solid #eeeeee' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Distribución de riesgos</Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">Alto</Typography>
                          <Typography variant="h5" fontWeight="bold" color="error.main">
                            {reporte.riesgoAlto}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">Medio</Typography>
                          <Typography variant="h5" fontWeight="bold" color="warning.main">
                            {reporte.riesgoMedio}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">Bajo</Typography>
                          <Typography variant="h5" fontWeight="bold" color="success.main">
                            {reporte.riesgoBajo}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Tablas detalladas */}
            <TablaMensajes
              titulo="Incumplimiento de conductores"
              icono={<PeopleIcon />}
              color="error.main"
              mensajes={reporte.incumplimientoMensajes}
            />
            
            <TablaMensajes
              titulo="Alertas de fatiga"
              icono={<WarningIcon />}
              color="warning.main"
              mensajes={reporte.fatigaMensajes}
            />
            
            <TablaMensajes
              titulo="Alertas de vehículos"
              icono={<DirectionsCarIcon />}
              color="info.main"
              mensajes={reporte.vehiculoMensajes}
            />
            
            {/* Opciones de exportación */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <StyledButton 
                variant="outlined" 
                color="primary"
                startIcon={<FileDownloadIcon />}
                onClick={handleDescargarPDF}
                disabled={exportLoading}
                sx={{ mr: 2 }}
              >
                Exportar a PDF
              </StyledButton>
              
              <StyledButton 
                variant="outlined" 
                color="primary"
                startIcon={<DescriptionIcon />}
                onClick={handleDescargarExcel}
                disabled={exportLoading}
              >
                Exportar a Excel
              </StyledButton>
            </Box>
          </Box>
        )}
      </StyledPaper>
    </Box>
  );
}