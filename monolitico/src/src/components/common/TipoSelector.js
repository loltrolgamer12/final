import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function TipoSelector({ value, onChange, loading }) {
  return (
    <Box sx={{ maxWidth: 300, minWidth: 180 }}>
      <FormControl fullWidth variant="outlined" size="medium">
        <InputLabel id="tipo-label" shrink>Tipo de camión</InputLabel>
        <Select
          labelId="tipo-label"
          id="tipo-select"
          value={value}
          onChange={onChange}
          label="Tipo de camión"
          displayEmpty
          aria-label="Selector de tipo de camión"
          disabled={loading}
        >
          <MenuItem value=""><em>Selecciona tipo...</em></MenuItem>
          <MenuItem value="ligero">Ligero</MenuItem>
          <MenuItem value="pesado">Pesado</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
