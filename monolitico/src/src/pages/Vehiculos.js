
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemIcon, ListItemText, Paper, TextField, MenuItem, FormControl, InputLabel, Select, Stack, Button, Tooltip, Snackbar, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TablePagination
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import api from '../services/api';


export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  // Filtros avanzados
  const [filtros, setFiltros] = useState(() => {
    const fav = localStorage.getItem('vehiculos_favoritos');
    return fav ? JSON.parse(fav) : {
      dia: '', mes: '', ano: '', placa: '', conductor: '', cumplimiento: '', critico: '', tipo: '', contrato: '', campo: ''
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
  const [orderBy, setOrderBy] = useState('placa');

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
    fetchVehiculos(filtros);
    // eslint-disable-next-line
  }, []);

  const fetchVehiculos = async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params.dia) query.append('dia', params.dia);
      if (params.mes) query.append('mes', params.mes);
      if (params.ano) query.append('ano', params.ano);
      if (params.placa) query.append('placa', params.placa);
      if (params.conductor) query.append('conductor', params.conductor);
      if (params.cumplimiento !== '') query.append('cumplimiento', params.cumplimiento);
      if (params.critico !== '') query.append('critico', params.critico);
  if (params.tipo && params.tipo !== 'todos') query.append('tipo', params.tipo);
  if (params.contrato) query.append('contrato', params.contrato);
  if (params.campo) query.append('campo', params.campo);
  const url = query.toString() ? `/dashboard/vehiculos?${query}` : '/dashboard/vehiculos';
  const res = await api.get(url);
      setVehiculos(res.data.data);
      setPage(0);
    } catch (e) {
      setVehiculos([]);
      setSnackbar({ open: true, message: 'Error al cargar vehículos', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBuscar = () => {
    fetchVehiculos(filtros);
    setSnackbar({ open: true, message: 'Búsqueda aplicada', severity: 'success' });
  };

  const handleLimpiar = () => {
    setFiltros({ dia: '', mes: '', ano: '', placa: '', conductor: '', cumplimiento: '', critico: '' });
    fetchVehiculos({});
    setSnackbar({ open: true, message: 'Filtros limpiados', severity: 'info' });
    setEsFavorito(false);
  };

  // Favoritos
  const handleFavorito = () => {
    if (esFavorito) {
      localStorage.removeItem('vehiculos_favoritos');
      setSnackbar({ open: true, message: 'Favorito eliminado', severity: 'info' });
    } else {
      localStorage.setItem('vehiculos_favoritos', JSON.stringify(filtros));
      setSnackbar({ open: true, message: 'Favorito guardado', severity: 'success' });
    }
    setEsFavorito(!esFavorito);
  };
  useEffect(() => {
    const fav = localStorage.getItem('vehiculos_favoritos');
    setEsFavorito(fav && JSON.stringify(filtros) === fav);
  }, [filtros]);

  // Ordenamiento
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const sortedRows = vehiculos.slice().sort((a, b) => {
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

  const handleOpenDetalle = (vehiculo) => {
    setDetalle(vehiculo);
    setModalOpen(true);
  };

  const handleCloseDetalle = () => {
    setModalOpen(false);
    setDetalle(null);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 500 }}>
        Control de Vehículos
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Visualiza el estado, alertas y detalles de cada vehículo.
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
          <TextField size="small" label="Placa" name="placa" value={filtros.placa} onChange={handleFiltroChange} sx={{ minWidth: 120 }} />
          <TextField size="small" label="Conductor" name="conductor" value={filtros.conductor} onChange={handleFiltroChange} sx={{ minWidth: 180 }} />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel id="cumplimiento-label" shrink>Cumplimiento</InputLabel>
            <Select 
              labelId="cumplimiento-label" 
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
            <InputLabel id="critico-label" shrink>Crítico</InputLabel>
            <Select 
              labelId="critico-label" 
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
          <Button variant="contained" color="primary" onClick={handleBuscar} sx={{ minWidth: 100 }}>Buscar</Button>
          <Button variant="outlined" color="secondary" onClick={handleLimpiar} sx={{ minWidth: 100 }}>Limpiar</Button>
        </Stack>
      </Paper>
      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Vehículos</Typography>
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
                    <TableSortLabel active={orderBy === 'placa'} direction={orderBy === 'placa' ? order : 'asc'} onClick={() => handleRequestSort('placa')}>
                      <Tooltip title="Placa del vehículo" arrow>Placa</Tooltip>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel active={orderBy === 'conductor'} direction={orderBy === 'conductor' ? order : 'asc'} onClick={() => handleRequestSort('conductor')}>
                      <Tooltip title="Nombre del conductor" arrow>Conductor</Tooltip>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Fecha de la inspección" arrow>Fecha</Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <TableSortLabel active={orderBy === 'alertas'} direction={orderBy === 'alertas' ? order : 'asc'} onClick={() => handleRequestSort('alertas')}>
                      <Tooltip title="Inspecciones con fallas" arrow>Total</Tooltip>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Inspecciones con fallas críticas" arrow>Críticas</Tooltip>
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
                {sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((v, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{v.placa}</TableCell>
                    <TableCell>{v.conductor}</TableCell>
                    <TableCell align="center">{v.fecha || '-'}</TableCell>
                    <TableCell align="center">
                      <Chip label={v.alertas} size="small" color="warning" />
                    </TableCell>
                    <TableCell align="center">
                      {v.alertasCriticas > 0 ? (
                        <Chip label={v.alertasCriticas} size="small" color="error" icon={<WarningIcon />} />
                      ) : (
                        <Chip label="0" size="small" color="success" />
                      )}
                    </TableCell>
                    <TableCell align="center">{v.cumplimiento ? <Chip label="Cumple" color="info" size="small" icon={<CheckCircleIcon />} /> : ''}</TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined" onClick={() => handleOpenDetalle(v)}>Ver</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={vehiculos.length}
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
        <DialogTitle>Detalle del Vehículo</DialogTitle>
        <DialogContent>
          {detalle && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>{detalle.placa} - {detalle.conductor}</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><DirectionsCarIcon /></ListItemIcon>
                  <ListItemText primary={`Placa: ${detalle.placa}`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText primary={`Conductor: ${detalle.conductor}`} />
                </ListItem>
                {detalle.fecha && (
                  <ListItem>
                    <ListItemIcon><CalendarTodayIcon /></ListItemIcon>
                    <ListItemText primary={`Última Inspección: ${detalle.fecha}`} />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                  <ListItemText 
                    primary={`Inspecciones con fallas: ${detalle.alertas} total`}
                    secondary={detalle.alertasCriticas > 0 ? `${detalle.alertasCriticas} son críticas` : 'Ninguna crítica'}
                  />
                </ListItem>
                {detalle.motivoCritico && (
                  <ListItem>
                    <ListItemIcon><WarningIcon color={detalle.alertasCriticas > 0 ? 'error' : 'warning'} /></ListItemIcon>
                    <ListItemText primary={detalle.motivoCritico} />
                  </ListItem>
                )}
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
