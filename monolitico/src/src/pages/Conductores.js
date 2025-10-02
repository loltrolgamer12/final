
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemIcon, ListItemText, Paper, TextField, MenuItem, FormControl, InputLabel, Select, Stack, Button, Tooltip, Snackbar, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TablePagination
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import api from '../services/api';


export default function ConductoresPage() {
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  // Filtros avanzados
  const [filtros, setFiltros] = useState(() => {
    // Cargar favoritos si existen
    const fav = localStorage.getItem('conductores_favoritos');
    return fav ? JSON.parse(fav) : {
      dia: '', mes: '', ano: '', nombre: '', placa: '', cumplimiento: '', fatiga: '', tipo: '', contrato: '', campo: ''
    };
  });
  // Opciones para contrato y campo
  const [contratoOptions, setContratoOptions] = useState([]);
  const [campoOptions, setCampoOptions] = useState([]);

  useEffect(() => {
    // Obtener opciones de contrato y campo al montar
    api.get('/filtros/vehiculos').then(res => {
      setContratoOptions(res.data.data.contratos || []);
      setCampoOptions(res.data.data.campos || []);
    });
  }, []);
  // Favoritos
  const [esFavorito, setEsFavorito] = useState(false);
  // Notificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  // Paginación y ordenamiento
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('nombre');

  // Generar arrays para selects de día, mes, año
  const dias = Array.from({ length: 31 }, (_, i) => i + 1);
  const meses = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
  ];
  const anoActual = new Date().getFullYear();
  const anos = Array.from({ length: 6 }, (_, i) => anoActual - i);

  useEffect(() => {
    fetchConductores(filtros);
    // eslint-disable-next-line
  }, []);

  const fetchConductores = async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params.dia) query.append('dia', params.dia);
      if (params.mes) query.append('mes', params.mes);
      if (params.ano) query.append('ano', params.ano);
      if (params.nombre) query.append('conductor', params.nombre);
      if (params.placa) query.append('placa', params.placa);
      if (params.cumplimiento !== '') query.append('cumplimiento', params.cumplimiento);
      if (params.fatiga !== '') query.append('fatiga', params.fatiga);
  if (params.tipo && params.tipo !== 'todos') query.append('tipo', params.tipo);
  if (params.contrato) query.append('contrato', params.contrato);
  if (params.campo) query.append('campo', params.campo);
  const url = query.toString() ? `/dashboard/conductores?${query}` : '/dashboard/conductores';
  const res = await api.get(url);
      setConductores(res.data.data);
      setPage(0);
    } catch (e) {
      setConductores([]);
      setSnackbar({ open: true, message: 'Error al cargar conductores', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value
    }));
  };

  const handleBuscar = () => {
    fetchConductores(filtros);
    setSnackbar({ open: true, message: 'Búsqueda aplicada', severity: 'success' });
  };

  const handleLimpiar = () => {
    setFiltros({ dia: '', mes: '', ano: '', nombre: '', placa: '', cumplimiento: '', fatiga: '' });
    fetchConductores({});
    setSnackbar({ open: true, message: 'Filtros limpiados', severity: 'info' });
    setEsFavorito(false);
  };

  // Favoritos
  const handleFavorito = () => {
    if (esFavorito) {
      localStorage.removeItem('conductores_favoritos');
      setSnackbar({ open: true, message: 'Favorito eliminado', severity: 'info' });
    } else {
      localStorage.setItem('conductores_favoritos', JSON.stringify(filtros));
      setSnackbar({ open: true, message: 'Favorito guardado', severity: 'success' });
    }
    setEsFavorito(!esFavorito);
  };
  useEffect(() => {
    const fav = localStorage.getItem('conductores_favoritos');
    setEsFavorito(fav && JSON.stringify(filtros) === fav);
  }, [filtros]);

  // Ordenamiento
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const sortedRows = conductores.slice().sort((a, b) => {
    if (orderBy === 'alertas') {
      return order === 'asc' ? a.alertas - b.alertas : b.alertas - a.alertas;
    }
    if (a[orderBy] < b[orderBy]) return order === 'asc' ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return order === 'asc' ? 1 : -1;
    return 0;
  });
  // Paginación
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDetalle = (conductor) => {
    setDetalle(conductor);
    setModalOpen(true);
  };

  const handleCloseDetalle = () => {
    setModalOpen(false);
    setDetalle(null);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 500 }}>
        Gestión de Conductores
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Visualiza el estado, alertas y detalles de cada conductor.
      </Typography>
      {/* Filtros avanzados */}
      <Paper sx={{ p: 2, borderRadius: 2, mb: 3, background: '#f7fafd', boxShadow: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="flex-start" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel shrink>Tipo</InputLabel>
            <Select label="Tipo" name="tipo" value={filtros.tipo} onChange={handleFiltroChange} displayEmpty>
              <MenuItem value=""><em>Selecciona tipo...</em></MenuItem>
              <MenuItem value="ligero">Ligero</MenuItem>
              <MenuItem value="pesado">Pesado</MenuItem>
            </Select>
          </FormControl>
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
          <TextField size="small" label="Nombre conductor" name="nombre" value={filtros.nombre} onChange={handleFiltroChange} sx={{ minWidth: 180 }} />
          <TextField size="small" label="Placa" name="placa" value={filtros.placa} onChange={handleFiltroChange} sx={{ minWidth: 120 }} />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Cumplimiento</InputLabel>
            <Select label="Cumplimiento" name="cumplimiento" value={filtros.cumplimiento} onChange={handleFiltroChange} displayEmpty>
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="true">Cumple</MenuItem>
              <MenuItem value="false">No cumple</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel>Fatiga</InputLabel>
            <Select label="Fatiga" name="fatiga" value={filtros.fatiga} onChange={handleFiltroChange} displayEmpty>
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="true">Sí</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleBuscar} sx={{ minWidth: 100 }}>Buscar</Button>
          <Button variant="outlined" color="secondary" onClick={handleLimpiar} sx={{ minWidth: 100 }}>Limpiar</Button>
        </Stack>
      </Paper>
      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Conductores</Typography>
          <Tooltip title={esFavorito ? 'Eliminar favorito' : 'Guardar filtros como favorito'}>
            <IconButton onClick={handleFavorito} color={esFavorito ? 'warning' : 'default'}>
              {esFavorito ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Tooltip>
        </Box>
        {loading ? <CircularProgress /> : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel active={orderBy === 'nombre'} direction={orderBy === 'nombre' ? order : 'asc'} onClick={() => handleRequestSort('nombre')}>
                      <Tooltip title="Nombre del conductor" arrow>Nombre</Tooltip>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel active={orderBy === 'placa'} direction={orderBy === 'placa' ? order : 'asc'} onClick={() => handleRequestSort('placa')}>
                      <Tooltip title="Placa del vehículo" arrow>Placa</Tooltip>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">
                    <TableSortLabel active={orderBy === 'alertas'} direction={orderBy === 'alertas' ? order : 'asc'} onClick={() => handleRequestSort('alertas')}>
                      <Tooltip title="Cantidad de alertas" arrow>Alertas</Tooltip>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="¿Fatiga detectada?" arrow>Fatiga</Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="¿Cumple con requisitos?" arrow>Cumplimiento</Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalle" arrow>Detalle</Tooltip>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((c, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{c.nombre}</TableCell>
                    <TableCell>{c.placa}</TableCell>
                    <TableCell align="center">{c.alertas}</TableCell>
                    <TableCell align="center">{c.fatiga ? <Chip label="Fatiga" color="error" size="small" icon={<WarningIcon />} /> : ''}</TableCell>
                    <TableCell align="center">{c.cumplimiento ? <Chip label="Cumple" color="info" size="small" icon={<CheckCircleIcon />} /> : ''}</TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined" onClick={() => handleOpenDetalle(c)}>Ver</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={conductores.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 9, 15, 30]}
              labelRowsPerPage="Filas por página"
            />
          </TableContainer>
        )}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
          action={
            <IconButton size="small" color="inherit" onClick={() => setSnackbar({ ...snackbar, open: false })}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
      </Paper>
      <Dialog open={modalOpen} onClose={handleCloseDetalle} maxWidth="xs" fullWidth>
        <DialogTitle>Detalle del Conductor</DialogTitle>
        <DialogContent>
          {detalle && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>{detalle.nombre} - {detalle.placa}</Typography>
              <List dense>
                {detalle.fatiga && (
                  <ListItem>
                    <ListItemIcon><WarningIcon color="error" /></ListItemIcon>
                    <ListItemText primary={`Motivo de fatiga: ${detalle.motivoFatiga || 'No especificado'}`} />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText primary={`Nombre: ${detalle.nombre}`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><DirectionsCarIcon /></ListItemIcon>
                  <ListItemText primary={`Placa: ${detalle.placa}`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><WarningIcon color={detalle.fatiga ? 'error' : 'disabled'} /></ListItemIcon>
                  <ListItemText primary={`Fatiga: ${detalle.fatiga ? 'Sí' : 'No'}`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color={detalle.cumplimiento ? 'info' : 'disabled'} /></ListItemIcon>
                  <ListItemText primary={`Cumplimiento: ${detalle.cumplimiento ? 'Sí' : 'No'}`} />
                </ListItem>
                {/* Agrega más detalles según datos disponibles */}
              </List>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
