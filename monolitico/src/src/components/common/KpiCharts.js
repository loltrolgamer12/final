import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#1976d2', '#dc3545', '#ffc107', '#47d16c'];

export default function KpiCharts({ stats }) {
  // Datos para el pie chart de distribución de riesgo
  const riesgoData = [
    { name: 'Crítico', value: stats.altoRiesgo || 0 },
    { name: 'Medio', value: stats.medioRiesgo || 0 },
    { name: 'Normal', value: stats.bajoRiesgo || 0 }
  ];

  // Datos para el bar chart de inspecciones
  const inspeccionesData = [
    { name: 'Inspecciones', Total: stats.totalInspecciones || 0, Crítico: stats.altoRiesgo || 0, Medio: stats.medioRiesgo || 0, Normal: stats.bajoRiesgo || 0 }
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 320 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Distribución de Riesgo</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={riesgoData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {riesgoData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx + 1] || COLORS[0]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 320 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Resumen de Inspecciones</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={inspeccionesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Total" fill="#1976d2" />
              <Bar dataKey="Crítico" fill="#dc3545" />
              <Bar dataKey="Medio" fill="#ffc107" />
              <Bar dataKey="Normal" fill="#47d16c" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}
