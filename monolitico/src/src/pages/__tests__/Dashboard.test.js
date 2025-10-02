import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
import * as api from '../../services/api';

jest.mock('../../services/api');

const mockStats = {
  totalInspecciones: 10,
  altoRiesgo: 2,
  medioRiesgo: 3,
  bajoRiesgo: 5,
};

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el loader al cargar', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, data: mockStats } });
    render(<Dashboard />);
    expect(screen.getByLabelText(/Cargando dashboard/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByLabelText(/Cargando dashboard/i)).not.toBeInTheDocument());
  });

  it('muestra error si la API falla', async () => {
    api.get.mockRejectedValueOnce(new Error('API Error'));
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByText(/Error al cargar datos del dashboard/i)).toBeInTheDocument();
  });

  it('muestra el selector de tipo y responde al cambio', async () => {
    api.get.mockResolvedValue({ data: { success: true, data: mockStats } });
    render(<Dashboard />);
    const select = screen.getByLabelText(/Selector de tipo de camión/i);
    expect(select).toBeInTheDocument();
    fireEvent.change(select, { target: { value: 'ligero' } });
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/dashboard?tipo=ligero'));
  });

  it('muestra KPIs solo si hay tipo seleccionado', async () => {
    api.get.mockResolvedValue({ data: { success: true, data: mockStats } });
    render(<Dashboard />);
    expect(screen.queryByText(/Total Inspecciones/i)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Selector de tipo de camión/i), { target: { value: 'ligero' } });
    await waitFor(() => expect(screen.getByText(/Total Inspecciones/i)).toBeInTheDocument());
  });
});
