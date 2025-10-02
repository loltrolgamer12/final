
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');


const Sentry = require('@sentry/node');
Sentry.init({
	dsn: process.env.SENTRY_DSN || '',
	tracesSampleRate: 1.0,
	environment: process.env.NODE_ENV || 'development',
});
const app = express();
// Integración Sentry para monitoreo de errores y performance
app.use(Sentry.requestHandler());

const uploadRoutes = require('../routes/upload');
const dashboardRoutes = require('../routes/dashboard');
const searchRoutes = require('../routes/search');
const alertsRoutes = require('../routes/alerts');
const inspeccionesRoutes = require('../routes/inspecciones');
const reportesRoutes = require('../routes/reportes');
const pdfRoutes = require('../routes/pdf');
const errorHandler = require('../middleware/errorHandler');


const path = require('path');
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../../public/build')));

// Rutas principales

const filtrosRoutes = require('../routes/filtros');
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/inspecciones', inspeccionesRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/reportes/pdf', pdfRoutes);
app.use('/api/reportes/excel', require('../routes/excel'));
app.use('/api/filtros', filtrosRoutes);


// Redirigir rutas que no sean de API al index.html del frontend
app.get(/^((?!\/api).)*$/, (req, res) => {
	res.sendFile(path.join(__dirname, '../../public/build/index.html'));
});


// Manejo de errores global y Sentry
app.use(Sentry.errorHandler());
app.use(errorHandler);

module.exports = app;
