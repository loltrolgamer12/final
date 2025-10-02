import React from 'react';
import { Box, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledStatusCard = styled(Box)(({ theme, status }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderRadius: 8,
  backgroundColor: '#f8f9fa',
  border: '1px solid #f0f0f0',
  '& .MuiChip-root': {
    backgroundColor: status === 'Conectada' ? '#47d16c' : status === 'Operativo' ? '#47d16c' : status === 'N/A' ? '#ffc107' : '#e0e0e0',
    color: status === 'Conectada' || status === 'Operativo' ? 'white' : status === 'N/A' ? '#333' : 'initial',
  }
}));

export default function StatusCard({ status, icon, label }) {
  return (
    <StyledStatusCard status={status}>
      <Box sx={{ mr: 1 }}>{icon}</Box>
      <Box sx={{ flexGrow: 1, mr: 1 }}>
        {label}
      </Box>
      <Chip label={status} size="small" />
    </StyledStatusCard>
  );
}
