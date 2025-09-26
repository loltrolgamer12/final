import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, MenuItem, Select, FormControl,
  InputLabel, CircularProgress, Alert, Grid, Card, CardContent, Accordion,
  AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  DirectionsCar as CarIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

export default function ReportesPage() {
  const [diaInicio, setDiaInicio] = useState('');
  const [diaFin, setDiaFin] = useState('');

  const handleDescargarExcel = async () => {
    try {
      let url = `/api/reportes/excel?mes=${mes}&ano=${ano}`;
      if (diaInicio) url += `&diaInicio=${diaInicio}`;
      if (diaFin) url += `&diaFin=${diaFin}`;
      const res = await axios.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `reporte_${mes}_${ano}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError('Error al descargar Excel');
    }
  };
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [loading, setLoading] = useState(false);
  const [reporte, setReporte] = useState(null);
  const [error, setError] = useState(null);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const anos = Array.from({ length: 6 }, (_, i) => 2020 + i);

  const handleGenerar = async () => {
    setLoading(true);
    setError(null);
    setReporte(null);
    try {
      let url = `/api/reportes?mes=${mes}&ano=${ano}`;
      if (diaInicio) url += `&diaInicio=${diaInicio}`;
      if (diaFin) url += `&diaFin=${diaFin}`;
      const res = await axios.get(url);
      setReporte(res.data.data);
    } catch (err) {
      setError('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPDF = async () => {
    try {
      const res = await axios.get(`/api/reportes/pdf?mes=${mes}&ano=${ano}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${mes}_${ano}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError('Error al descargar PDF');
    }
  };

  // Tabla genérica
  function TablaMensajes({ titulo, icono, color, mensajes }) {
    const rows = mensajes.map((msg, idx) => ({ id: idx + 1, mensaje: msg }));
    const columns = [{ field: 'mensaje', headerName: 'Mensaje', flex: 1 }];

    return (
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ color }}>
            {icono} {titulo} ({mensajes.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {mensajes.length > 0 ? (
            <div style={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
              />
            </div>
          ) : (
            <Typography color="success.main">No se encontraron registros.</Typography>
          )}
        </AccordionDetails>
      </Accordion>
    );
  }

  return (
    <Box maxWidth={1100} mx="auto" mt={4}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Reportes mensuales y anuales
        </Typography>

        {/* Filtros */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Mes</InputLabel>
            <Select value={mes} onChange={e => setMes(e.target.value)}>
              {meses.map((m, i) => <MenuItem key={m} value={i + 1}>{m}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Año</InputLabel>
            <Select value={ano} onChange={e => setAno(e.target.value)}>
              {anos.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel shrink>Día inicio</InputLabel>
            <input type="number" min={1} max={31} value={diaInicio} onChange={e => setDiaInicio(e.target.value)} placeholder="Día inicio" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
          </FormControl>
          <FormControl fullWidth>
            <InputLabel shrink>Día fin</InputLabel>
            <input type="number" min={1} max={31} value={diaFin} onChange={e => setDiaFin(e.target.value)} placeholder="Día fin" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
          </FormControl>
          <Button variant="contained" onClick={handleGenerar} disabled={!mes || !ano || loading}>
            Generar
          </Button>
          <Button variant="outlined" onClick={handleDescargarPDF} disabled={!mes || !ano || loading}>
            Descargar PDF
          </Button>
          <Button variant="outlined" onClick={handleDescargarExcel} disabled={!mes || !ano || loading}>
            Descargar Excel
          </Button>
        </Box>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Reporte */}
        {reporte && (
          <Box mt={3}>
            {/* KPIs */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Total inspecciones</Typography>
                    <Typography variant="h4" color="primary">{reporte.totalInspecciones}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Alertas críticas</Typography>
                    <Typography variant="h4" color="error">{reporte.totalAlertas}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Riesgos</Typography>
                    <Typography color="error">Alto: {reporte.riesgoAlto}</Typography>
                    <Typography color="warning.main">Medio: {reporte.riesgoMedio}</Typography>
                    <Typography color="success.main">Bajo: {reporte.riesgoBajo}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Tablas */}
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
              icono={<CarIcon />}
              color="info.main"
              mensajes={reporte.vehiculoMensajes}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
