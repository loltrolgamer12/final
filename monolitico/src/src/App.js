import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/Dashboard';
import UploadPage from './pages/Upload';
import SearchPage from './pages/Search';
import AlertsPage from './pages/Alerts';
import ReportesPage from './pages/Reportes';
import ConductoresPage from './pages/Conductores';
import VehiculosPage from './pages/Vehiculos';

// Tema personalizado con colores corporativos
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { 
      main: '#3474eb', 
      light: '#5a8eed',
      dark: '#285cb8' 
    },
    secondary: { 
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00' 
    },
    background: { 
      default: '#f8f9fa',
      paper: '#ffffff' 
    },
    error: {
      main: '#dc3545'
    },
    warning: {
      main: '#ffc107'
    },
    success: {
      main: '#47d16c'
    },
    text: {
      primary: '#333333',
      secondary: '#757575'
    }
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem'
    },
    subtitle1: {
      fontWeight: 500
    },
    body1: {
      fontSize: '0.95rem'
    },
    body2: {
      fontSize: '0.875rem'
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f8f9fa'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          borderRadius: 8,
          border: '1px solid #f0f0f0'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          boxShadow: 'none',
          fontWeight: 500
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
          }
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/reportes" element={<ReportesPage />} />
            <Route path="/conductores" element={<ConductoresPage />} />
            <Route path="/vehiculos" element={<VehiculosPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;