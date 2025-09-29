import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemIcon, ListItemText, Paper
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import api from '../services/api';

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchVehiculos();
  }, []);

  const fetchVehiculos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/vehiculos');
      setVehiculos(res.data.data);
    } catch (e) {
      setVehiculos([]);
    } finally {
      setLoading(false);
    }
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
      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Vehículos</Typography>
        {loading ? <CircularProgress /> : (
          <Grid container spacing={2}>
            {vehiculos.map((v, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card sx={{ cursor: 'pointer' }} onClick={() => handleOpenDetalle(v)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DirectionsCarIcon sx={{ color: '#ff9800', mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight={600}>{v.placa}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">Conductor: {v.conductor}</Typography>
                    <Typography variant="body2" color="text.secondary">Alertas: {v.alertas}</Typography>
                    <Box sx={{ mt: 1 }}>
                      {v.critico && <Chip label="Crítico" color="error" size="small" icon={<WarningIcon />} sx={{ mr: 1 }} />}
                      {v.cumplimiento && <Chip label="Cumplimiento" color="info" size="small" icon={<CheckCircleIcon />} />}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      <Dialog open={modalOpen} onClose={handleCloseDetalle} maxWidth="xs" fullWidth>
        <DialogTitle>Detalle del Vehículo</DialogTitle>
        <DialogContent>
          {detalle && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>{detalle.placa} - {detalle.conductor}</Typography>
              <List dense>
                {detalle.critico && (
                  <ListItem>
                    <ListItemIcon><WarningIcon color="error" /></ListItemIcon>
                    <ListItemText primary={`Motivo crítico: ${detalle.motivoCritico || 'No especificado'}`} />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon><DirectionsCarIcon /></ListItemIcon>
                  <ListItemText primary={`Placa: ${detalle.placa}`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText primary={`Conductor: ${detalle.conductor}`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><WarningIcon color={detalle.critico ? 'error' : 'disabled'} /></ListItemIcon>
                  <ListItemText primary={`Crítico: ${detalle.critico ? 'Sí' : 'No'}`} />
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
