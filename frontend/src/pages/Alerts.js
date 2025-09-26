import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

export default function AlertsPage() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/alerts')
      .then(res => setAlertas(res.data.data))
      .catch(() => setError('Error al cargar alertas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  // Separar alertas por tipo
  const alertasFatiga = alertas.filter(a => a.tipo === 'FATIGA');
  const alertasVehiculo = alertas.filter(a => a.tipo === 'VEHICULO_CRITICO');
  const alertasCumplimiento = alertas.filter(a => a.tipo === 'SIN_TIPO');

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>Alertas del sistema</Typography>

      <Typography variant="h6" sx={{ mt: 3 }}>Cumplimiento de conductores</Typography>
      <Grid container spacing={2}>
        {alertasCumplimiento.map((a, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Card sx={{ borderLeft: '6px solid #1976d2' }}>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">Cumplimiento</Typography>
                <Typography variant="body1">{a.mensaje}</Typography>
                {a.conductor && <Typography variant="body2">Conductor: {a.conductor}</Typography>}
                {a.placa && <Typography variant="body2">Placa: {a.placa}</Typography>}
                {a.fecha && <Typography variant="body2">Fecha: {new Date(a.fecha).toLocaleDateString()}</Typography>}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ mt: 3 }}>Alertas de fatiga</Typography>
      <Grid container spacing={2}>
        {alertasFatiga.map((a, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Card sx={{ borderLeft: '6px solid #d32f2f' }}>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">Fatiga</Typography>
                <Typography variant="body1">{a.mensaje}</Typography>
                {a.conductor && <Typography variant="body2">Conductor: {a.conductor}</Typography>}
                {a.placa && <Typography variant="body2">Placa: {a.placa}</Typography>}
                {a.fecha && <Typography variant="body2">Fecha: {new Date(a.fecha).toLocaleDateString()}</Typography>}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ mt: 3 }}>Alertas de vehículos</Typography>
      <Grid container spacing={2}>
        {alertasVehiculo.map((a, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Card sx={{ borderLeft: '6px solid #ffa726' }}>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">Vehículo crítico</Typography>
                <Typography variant="body1">{a.mensaje}</Typography>
                {a.conductor && <Typography variant="body2">Conductor: {a.conductor}</Typography>}
                {a.placa && <Typography variant="body2">Placa: {a.placa}</Typography>}
                {a.fecha && <Typography variant="body2">Fecha: {new Date(a.fecha).toLocaleDateString()}</Typography>}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
