import axios from 'axios';

console.log('Conectando con backend en: /api');
const api = axios.create({
  baseURL: '/api',
  timeout: 10 * 60 * 1000 // 10 minutos
});

export default api;
