import axios from 'axios';

console.log('Conectando con backend en:', process.env.REACT_APP_API_URL + '/api');
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL + '/api',
});

export default api;
