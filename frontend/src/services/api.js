import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-misty-sea-9571.fly.dev/api',
});

export default api;
