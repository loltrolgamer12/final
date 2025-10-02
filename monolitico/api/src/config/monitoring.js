// Configuración de monitoreo y métricas para el backend
// Integración básica con Sentry

const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'development',
});

module.exports = { Sentry };
