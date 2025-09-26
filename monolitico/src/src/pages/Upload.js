import React, { useState } from 'react';
import { Box, Typography, Paper, Button, LinearProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [alreadyProcessed, setAlreadyProcessed] = useState(false);

  const handleFileChange = e => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setResult(null);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        }
      });
      setResult(res.data.data);
      setAlreadyProcessed(false);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Error al cargar el archivo';
      setError(msg);
      if (msg.includes('ya fue procesado')) {
        setAlreadyProcessed(true);
      } else {
        setAlreadyProcessed(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={500} mx="auto" mt={4}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Cargar archivo Excel de inspecciones
        </Typography>
        {alreadyProcessed && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Este archivo Excel ya fue procesado anteriormente.</strong><br />
            Si necesitas volver a cargarlo, modifica el archivo o usa uno diferente.
          </Alert>
        )}
        <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} style={{ marginBottom: 16 }} />
        <Button variant="contained" color="primary" startIcon={<CloudUploadIcon />} onClick={handleUpload} disabled={!file || loading} fullWidth>
          Subir archivo
        </Button>
        {loading && <LinearProgress sx={{ mt: 2 }} value={progress} variant="determinate" />}
        {result && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {result.mensaje}<br />
            Registros insertados: {result.registrosInsertados}<br />
            Duplicados: {result.registrosDuplicados}<br />
            Errores: {result.registrosError}
          </Alert>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
    </Box>
  );
}
