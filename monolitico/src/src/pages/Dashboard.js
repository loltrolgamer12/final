import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Alert, Modal, Button } from '@mui/material';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState([]);
  // Log para depuración
  console.log('API URL:', process.env.REACT_APP_API_URL);
  const handleCardClick = async (type) => {
    setModalTitle('');
    setModalContent([]);
    setModalOpen(true);
    let res;
    switch (type) {
      case 'inspecciones':
        setModalTitle('Últimas inspecciones');
        res = await axios.get('/api/inspecciones?limit=10');
        setModalContent(res.data.data);
        break;
      case 'alertas':
        setModalTitle('Alertas críticas');
        res = await axios.get('/api/inspecciones?alerta=true');
        setModalContent(res.data.data);
        break;
      case 'bajo':
        setModalTitle('Inspecciones de riesgo bajo');
        res = await axios.get('/api/inspecciones?riesgo=BAJO');
        setModalContent(res.data.data);
        break;
      case 'medio':
        setModalTitle('Inspecciones de riesgo medio');
        res = await axios.get('/api/inspecciones?riesgo=MEDIO');
        setModalContent(res.data.data);
        break;
      case 'alto':
        setModalTitle('Inspecciones de riesgo alto');
        res = await axios.get('/api/inspecciones?riesgo=ALTO');
        setModalContent(res.data.data);
        break;
      default:
        setModalOpen(false);
    }
  };

  useEffect(() => {
    axios.get('/api/dashboard')
      .then(res => {
        console.log('Respuesta dashboard:', res);
        setData(res.data.data);
      })
      .catch(err => {
        console.error('Error al cargar dashboard:', err);
        setError('Error al cargar dashboard');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card onClick={() => handleCardClick('inspecciones')} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Typography variant="h6">Inspecciones</Typography>
              <Typography variant="h4" color="primary">{data.totalInspecciones}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card onClick={() => handleCardClick('alertas')} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Typography variant="h6">Alertas críticas</Typography>
              <Typography variant="h4" color="error">{data.totalAlertas}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card onClick={() => handleCardClick('bajo')} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Typography variant="h6">Riesgo bajo</Typography>
              <Typography variant="h5" color="success.main">{data.bajoRiesgo}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card onClick={() => handleCardClick('medio')} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Typography variant="h6">Riesgo medio</Typography>
              <Typography variant="h5" color="warning.main">{data.medioRiesgo}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card onClick={() => handleCardClick('alto')} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Typography variant="h6">Riesgo alto</Typography>
              <Typography variant="h5" color="error">{data.altoRiesgo}</Typography>
            </CardContent>
          </Card>
        </Grid>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, minWidth: 400, maxHeight: '80vh', overflowY: 'auto', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>{modalTitle}</Typography>
          {modalContent.length === 0 ? (
            <Typography>No hay información disponible.</Typography>
          ) : (
            modalContent.map((item, idx) => (
              <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography variant="subtitle2">Conductor: {item.conductor_nombre}</Typography>
                <Typography variant="body2">Fecha: {item.fecha ? new Date(item.fecha).toLocaleString() : ''}</Typography>
                <Typography variant="body2">Riesgo: {item.nivel_riesgo}</Typography>
                {item.tiene_alertas_criticas && <Typography color="error">Alerta crítica</Typography>}
                {item.observaciones && <Typography variant="body2">Observaciones: {item.observaciones}</Typography>}
              </Box>
            ))
          )}
          <Button onClick={() => setModalOpen(false)} variant="contained" sx={{ mt: 2 }}>Cerrar</Button>
        </Box>
      </Modal>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Tendencia de inspecciones (últimos 7 días)</Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.tendencia}>
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Conductores con más alertas</Typography>
        <Grid container spacing={2}>
          {data.topConductores.map(c => (
            <Grid item xs={12} md={4} key={c.conductor_nombre}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">{c.conductor_nombre}</Typography>
                  <Typography variant="h5" color="error">{c._count.id} alertas</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
