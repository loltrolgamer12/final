import React, { useState } from 'react';
import { Box, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/search', { params: { query } });
      setResults(res.data.data);
    } catch (err) {
      setError('Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={900} mx="auto" mt={4}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Búsqueda instantánea</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField label="Buscar" value={query} onChange={e => setQuery(e.target.value)} fullWidth />
          <Button variant="contained" color="primary" onClick={handleSearch} disabled={loading || query.length < 2}>Buscar</Button>
        </Box>
        {loading && <CircularProgress sx={{ mt: 2 }} />}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {results.length > 0 && (
          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Conductor</TableCell>
                <TableCell>Placa</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Contrato</TableCell>
                <TableCell>Riesgo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.conductor_nombre}</TableCell>
                  <TableCell>{r.placa_vehiculo}</TableCell>
                  <TableCell>{new Date(r.fecha).toLocaleDateString()}</TableCell>
                  <TableCell>{r.contrato}</TableCell>
                  <TableCell>
                    <Typography color={r.nivel_riesgo === 'ALTO' ? 'error' : r.nivel_riesgo === 'MEDIO' ? 'warning.main' : 'success.main'}>
                      {r.nivel_riesgo}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
