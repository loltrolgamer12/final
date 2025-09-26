
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const uploadRoutes = require('../routes/upload');
const dashboardRoutes = require('../routes/dashboard');
const searchRoutes = require('../routes/search');
const alertsRoutes = require('../routes/alerts');
const inspeccionesRoutes = require('../routes/inspecciones');
const reportesRoutes = require('../routes/reportes');
const pdfRoutes = require('../routes/pdf');
const errorHandler = require('../middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Rutas principales
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/inspecciones', inspeccionesRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/reportes/pdf', pdfRoutes);
app.use('/api/reportes/excel', require('../routes/excel'));

// Manejo de errores global
app.use(errorHandler);

module.exports = app;
