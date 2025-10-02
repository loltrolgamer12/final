import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import {
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

// Iconos
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoIcon from '@mui/icons-material/Info';

// Componentes estilizados
const UploadBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  border: '2px dashed #cccccc',
  borderRadius: '8px',
  textAlign: 'center',
  backgroundColor: '#fafafa',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  marginBottom: theme.spacing(3),
  '&:hover': {
    backgroundColor: '#f0f0f0',
    borderColor: theme.palette.primary.main,
  },
}));

const HiddenInput = styled('input')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
  cursor: 'pointer',
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
  overflow: 'hidden',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 500,
  boxShadow: 'none',
  padding: '10px 24px',
  '&.MuiButton-contained': {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
  }
}));

// Página de carga de Excel
export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [alreadyProcessed, setAlreadyProcessed] = useState(false);
  const [tipo, setTipo] = useState('');

  // Manejador de cambio de archivo
  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
      setAlreadyProcessed(false);
      // Detección automática por nombre de archivo
      if (/pesad/i.test(selectedFile.name) || /veh[ií]culos? pesad/i.test(selectedFile.name)) {
        setTipo('pesado');
      } else if (/liger/i.test(selectedFile.name) || /veh[ií]culos? liger/i.test(selectedFile.name)) {
        setTipo('ligero');
      } else {
        setTipo('');
      }
    }
  };

  // Manejador de carga de archivo
  const handleUpload = async () => {
    if (!file || !tipo) {
      setError('Debes seleccionar el tipo de camión antes de subir el archivo.');
      return;
    }
    setLoading(true);
    setProgress(0);
    setResult(null);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipo);
    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        }
      });
      setResult(res.data.data);
      setAlreadyProcessed(false);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Error al cargar el archivo';
      setError(msg);
      if (msg.includes('ya fue procesado')) {
        setAlreadyProcessed(true);
      } else {
        setAlreadyProcessed(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 500 }}>
        Carga de Archivos Excel
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Sube archivos Excel con registros de inspecciones para procesar e incorporar al sistema.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <StyledPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FileUploadIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h6" fontWeight="500">
                Cargar archivo Excel de inspecciones
              </Typography>
            </Box>
            <FormControl fullWidth sx={{ mb: 2 }} required error={!tipo}>
              <InputLabel id="tipo-label" shrink>Tipo de camión *</InputLabel>
              <Select
                labelId="tipo-label"
                id="tipo-select"
                value={tipo}
                label="Tipo de camión *"
                onChange={e => setTipo(e.target.value)}
                displayEmpty
              >
                <MenuItem value=""><em>Selecciona tipo...</em></MenuItem>
                <MenuItem value="ligero">Ligero</MenuItem>
                <MenuItem value="pesado">Pesado</MenuItem>
              </Select>
            </FormControl>
            
            {alreadyProcessed && (
              <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                <strong>Este archivo Excel ya fue procesado anteriormente.</strong><br />
                Si necesitas volver a cargarlo, modifica el archivo o usa uno diferente.
              </Alert>
            )}
            
            <UploadBox>
              <CloudUploadIcon sx={{ fontSize: 50, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Arrastra y suelta el archivo aquí
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                o haz clic para seleccionar un archivo
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Formatos aceptados: .xlsx, .xls (Máximo 50MB)
              </Typography>
              <HiddenInput type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
            </UploadBox>
            
            {file && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2, 
                mb: 2, 
                bgcolor: '#f5f5f5', 
                borderRadius: 1 
              }}>
                <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
              </Box>
            )}
            
            <StyledButton 
              variant="contained" 
              startIcon={<CloudUploadIcon />} 
              onClick={handleUpload} 
              disabled={!file || loading} 
              fullWidth
              sx={{ mt: 2 }}
            >
              {loading ? 'Subiendo archivo...' : 'Subir archivo'}
            </StyledButton>
            
            {loading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {progress === 100 ? 'Procesando archivo...' : `Subiendo archivo: ${progress}%`}
                </Typography>
                <LinearProgress sx={{ height: 8, borderRadius: 4 }} value={progress} variant="determinate" />
              </Box>
            )}
          </StyledPaper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <StyledPaper>
            <Typography variant="h6" fontWeight="500" gutterBottom>
              <InfoIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
              Información
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <List disablePadding>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Formato requerido" 
                  secondary="Asegúrate de utilizar la plantilla oficial de inspección."
                />
              </ListItem>
              
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Validación automática" 
                  secondary="El sistema verifica y rechaza archivos incorrectos o duplicados."
                />
              </ListItem>
              
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <WarningIcon color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Procesamiento por lotes" 
                  secondary="Cargar grandes cantidades de datos puede tomar varios minutos."
                />
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Resumen de procesamiento" 
                  secondary="Al finalizar se mostrará un resumen con los registros procesados."
                />
              </ListItem>
            </List>
            
            {/* Mostrar resultados */}
            {result && (
              <Card sx={{ mt: 3, border: '1px solid #e0f2f1', bgcolor: '#e8f5e9' }}>
                <CardContent>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Archivo procesado correctamente
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Total registros:</Typography>
                        <Typography variant="body1" fontWeight="500">{result.totalRegistros}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Insertados:</Typography>
                        <Typography variant="body1" fontWeight="500" color="success.main">
                          {result.registrosInsertados}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Duplicados:</Typography>
                        <Typography variant="body1" fontWeight="500" color="warning.main">
                          {result.registrosDuplicados}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Errores:</Typography>
                        <Typography variant="body1" fontWeight="500" color="error">
                          {result.registrosError}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            )}
            
            {/* Mostrar errores */}
            {error && !alreadyProcessed && (
              <Alert 
                severity="error" 
                sx={{ mt: 3 }}
                icon={<ErrorIcon />}
              >
                <Typography variant="subtitle2">No se pudo cargar el archivo</Typography>
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
                {error.includes('tipo') && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="error">
                      <strong>Motivo:</strong> El tipo detectado por el nombre del archivo no coincide con el tipo seleccionado.
                    </Typography>
                    <Typography variant="caption" color="error">
                      Ejemplo: Si el archivo se llama "VEHÍCULOS PESADOS.xlsx" y seleccionaste "ligero", el sistema lo rechaza para evitar errores en la base de datos.
                    </Typography>
                    <Typography variant="caption" color="error">
                      Solución: Verifica que el tipo seleccionado corresponda al archivo que estás subiendo.
                    </Typography>
                  </Box>
                )}
              </Alert>
            )}
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
}