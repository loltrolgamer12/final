import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  InputAdornment,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '../services/api';
// Utilidad para obtener fechas en formato ISO
function getLastNDaysRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  return {
    fechaInicio: start.toISOString().slice(0, 10),
    fechaFin: end.toISOString().slice(0, 10)
  };
}

// Iconos
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventIcon from '@mui/icons-material/Event';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Componentes estilizados
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
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

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: 8,
  border: '1px solid #f0f0f0',
  '& .MuiTableCell-root': {
    padding: '12px 16px',
  },
  '& .MuiTableHead-root': {
    backgroundColor: '#fafafa',
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: '#f5f5f5',
  },
}));

// Chip de nivel de riesgo
const RiskChip = ({ level }) => {
  let color = 'success';
  let icon = <CheckCircleIcon />;
  
  if (level === 'ALTO') {
    color = 'error';
    icon = <WarningIcon />;
  } else if (level === 'MEDIO') {
    color = 'warning';
    icon = <InfoOutlinedIcon />;
  }
  
  return (
    <Chip 
      label={level} 
      color={color} 
      size="small"
      icon={icon}
      sx={{ fontWeight: 500 }}
    />
  );
};

// Página de búsqueda
export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  // Realizar búsqueda
  const handleSearch = async (opts = {}) => {
    // Si opts.ultimosDias está presente, usar búsqueda avanzada por fecha
    if (opts.ultimosDias) {
      setLoading(true);
      setError(null);
      setSearched(true);
      try {
        const { fechaInicio, fechaFin } = getLastNDaysRange(opts.ultimosDias);
        const res = await api.get('/search/advanced', { params: { fechaInicio, fechaFin } });
        setResults(res.data.data);
      } catch (err) {
        setError('Error en la búsqueda. Por favor, intente nuevamente.');
        console.error('Error en búsqueda:', err);
      } finally {
        setLoading(false);
      }
      return;
    }
    // Búsqueda normal por texto
    if (query.length < 2) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await api.get('/search', { params: { query } });
      setResults(res.data.data);
    } catch (err) {
      setError('Error en la búsqueda. Por favor, intente nuevamente.');
      console.error('Error en búsqueda:', err);
    } finally {
      setLoading(false);
    }
  };

  // Manejar tecla Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 500 }}>
        Búsqueda de Inspecciones
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Encuentra rápidamente registros de inspecciones por conductor, placa, contrato o fecha.
      </Typography>
      
      <StyledPaper>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SearchIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" fontWeight="500">
            Búsqueda instantánea
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField 
            label="Buscar" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            fullWidth
            variant="outlined"
            placeholder="Ingresa conductor, placa, contrato o coordinación"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            helperText="Mínimo 2 caracteres para buscar"
          />
          
          <StyledButton 
            variant="contained" 
            onClick={handleSearch} 
            disabled={loading || query.length < 2}
            sx={{ minWidth: '120px' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Buscar'}
          </StyledButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <FilterAltIcon sx={{ color: 'action.active', mr: 1, fontSize: '1rem' }} />
          <Typography variant="body2" color="text.secondary">
            Filtros populares:
          </Typography>
          <Chip label="Alto riesgo" size="small" sx={{ ml: 1 }} onClick={() => setQuery('ALTO')} />
          <Chip label="Últimas inspecciones (3 días)" size="small" sx={{ ml: 1 }} onClick={() => handleSearch({ ultimosDias: 3 })} />
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
  {!loading && searched && Array.isArray(results) && results.length === 0 && (
          <Card sx={{ mt: 3, backgroundColor: '#f5f5f5', border: '1px solid #eeeeee' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom>
                No se encontraron resultados
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Intenta con otros términos de búsqueda o revisa los filtros aplicados.
              </Typography>
            </CardContent>
          </Card>
        )}
        
        {!loading && results.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="500">
                Resultados ({results.length})
              </Typography>
            </Box>
            
            <StyledTableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                        Conductor
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DirectionsCarIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                        Placa
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EventIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                        Fecha
                      </Box>
                    </TableCell>
                    <TableCell>Contrato</TableCell>
                    <TableCell align="center">Riesgo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.conductor_nombre}</TableCell>
                      <TableCell>{row.placa_vehiculo}</TableCell>
                      <TableCell>{new Date(row.fecha).toLocaleDateString()}</TableCell>
                      <TableCell>{row.contrato}</TableCell>
                      <TableCell align="center">
                        <RiskChip level={row.nivel_riesgo} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </>
        )}
      </StyledPaper>
    </Box>
  );
}