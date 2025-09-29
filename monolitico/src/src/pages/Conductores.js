import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemIcon, ListItemText, Paper
} from '@mui/material';
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

  useEffect(() => {
    fetchConductores();
  }, []);

  const fetchConductores = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/conductores');
      setConductores(res.data.data);
    } catch (e) {
      setConductores([]);
    } finally {
      setLoading(false);
    }
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
      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Conductores</Typography>
        {loading ? <CircularProgress /> : (
          <Grid container spacing={2}>
            {conductores.map((c, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card sx={{ cursor: 'pointer' }} onClick={() => handleOpenDetalle(c)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon sx={{ color: '#1976d2', mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight={600}>{c.nombre}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">Placa: {c.placa}</Typography>
                    <Typography variant="body2" color="text.secondary">Alertas: {c.alertas}</Typography>
                    <Box sx={{ mt: 1 }}>
                      {c.fatiga && <Chip label="Fatiga" color="error" size="small" icon={<WarningIcon />} sx={{ mr: 1 }} />}
                      {c.cumplimiento && <Chip label="Cumplimiento" color="info" size="small" icon={<CheckCircleIcon />} />}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
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
