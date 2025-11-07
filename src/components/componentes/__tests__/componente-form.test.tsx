import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponenteForm } from '../componente-form';
import { ComponenteWithRelations } from '@/types/api';

// Mock the validation functions
jest.mock('@/lib/validations/componente', () => ({
  validateComponente: jest.fn(() => ({ isValid: true, errors: [] })),
  validateComponenteByCategory: jest.fn(() => ({ isValid: true, errors: [] })),
}));

const mockComponente: ComponenteWithRelations = {
  id: '1',
  categoria: 'RESISTENCIA',
  descripcion: 'Resistencia de 1K ohm',
  valorUnidad: [{ valor: '1K', unidad: 'Ω' }],
  stockMinimo: 10,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ubicaciones: [
    {
      id: '1',
      cantidad: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
      componenteId: '1',
      cajoncitoId: '1',
      cajoncito: {
        id: '1',
        nombre: 'Cajoncito 1',
        codigo: 'C1',
      },
    },
  ],
  stockActual: 50,
};

describe('ComponenteForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with default values for new componente', () => {
    render(
      <ComponenteForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('OTROS')).toBeInTheDocument(); // Default categoria
    expect(screen.getByDisplayValue('0')).toBeInTheDocument(); // Default stockMinimo
    expect(screen.getByPlaceholderText('Describe el componente electrónico...')).toBeInTheDocument();
    expect(screen.getByText('Nuevo Componente')).toBeInTheDocument();
  });

  it('renders form with componente data for editing', () => {
    render(
      <ComponenteForm
        componente={mockComponente}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('RESISTENCIA')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Resistencia de 1K ohm')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1K')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ω')).toBeInTheDocument();
    expect(screen.getByText('Editar Componente')).toBeInTheDocument();
  });

  it('allows adding new valor/unidad pairs', async () => {
    const user = userEvent.setup();

    render(
      <ComponenteForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const addButton = screen.getByText('Agregar Valor/Unidad');
    await user.click(addButton);

    expect(screen.getAllByPlaceholderText('Valor (ej: 1K)')).toHaveLength(2);
    expect(screen.getAllByPlaceholderText('Unidad (ej: Ω)')).toHaveLength(2);
  });

  it('allows removing valor/unidad pairs', async () => {
    const user = userEvent.setup();

    render(
      <ComponenteForm
        componente={mockComponente}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Initially there should be one valor/unidad pair
    expect(screen.getAllByPlaceholderText('Valor (ej: 1K)')).toHaveLength(1);

    // Add a second pair
    const addButton = screen.getByText('Agregar Valor/Unidad');
    await user.click(addButton);
    expect(screen.getAllByPlaceholderText('Valor (ej: 1K)')).toHaveLength(2);

    // Remove the first pair
    const removeButtons = screen.getAllByRole('button').filter(button =>
      button.querySelector('svg') && button.getAttribute('class')?.includes('text-red-600')
    );
    await user.click(removeButtons[0]);

    expect(screen.getAllByPlaceholderText('Valor (ej: 1K)')).toHaveLength(1);
  });

  it('allows adding and removing ubicaciones', async () => {
    const user = userEvent.setup();

    render(
      <ComponenteForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Add ubicacion
    const addUbicacionButton = screen.getByText('Agregar Ubicación');
    await user.click(addUbicacionButton);

    expect(screen.getByPlaceholderText('ID del Cajoncito')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument(); // Default cantidad

    // Remove ubicacion
    const removeButtons = screen.getAllByRole('button').filter(button =>
      button.querySelector('svg') && button.getAttribute('class')?.includes('text-red-600')
    );
    const ubicacionRemoveButton = removeButtons[removeButtons.length - 1];
    await user.click(ubicacionRemoveButton);

    expect(screen.queryByPlaceholderText('ID del Cajoncito')).not.toBeInTheDocument();
  });

  it('updates form values correctly', async () => {
    const user = userEvent.setup();

    render(
      <ComponenteForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Change categoria
    const categoriaSelect = screen.getByDisplayValue('OTROS');
    await user.selectOptions(categoriaSelect, 'RESISTENCIA');
    expect(screen.getByDisplayValue('RESISTENCIA')).toBeInTheDocument();

    // Change descripcion
    const descripcionTextarea = screen.getByPlaceholderText('Describe el componente electrónico...');
    await user.type(descripcionTextarea, 'Nueva descripción');
    expect(screen.getByDisplayValue('Nueva descripción')).toBeInTheDocument();

    // Change stock minimo
    const stockMinimoInput = screen.getByDisplayValue('0');
    await user.clear(stockMinimoInput);
    await user.type(stockMinimoInput, '5');
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
  });

  it('calls onSubmit with correct data when form is submitted', async () => {
    const user = userEvent.setup();

    render(
      <ComponenteForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill in required fields
    const descripcionTextarea = screen.getByPlaceholderText('Describe el componente electrónico...');
    await user.type(descripcionTextarea, 'Componente de prueba');

    const valorInput = screen.getByPlaceholderText('Valor (ej: 1K)');
    await user.type(valorInput, '100');

    const unidadInput = screen.getByPlaceholderText('Unidad (ej: Ω)');
    await user.type(unidadInput, 'V');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        categoria: 'OTROS',
        descripcion: 'Componente de prueba',
        stockMinimo: 0,
        valorUnidad: [{ valor: '100', unidad: 'V' }],
      });
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ComponenteForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('shows validation error when no valor/unidad pairs provided', async () => {
    const user = userEvent.setup();

    render(
      <ComponenteForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Don't fill in any valor/unidad pairs
    const descripcionTextarea = screen.getByPlaceholderText('Describe el componente electrónico...');
    await user.type(descripcionTextarea, 'Componente de prueba');

    const submitButton = screen.getByRole('button', { name: /Guardar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    // Check for alert
    expect(window.alert).toHaveBeenCalledWith('Debe agregar al menos un par valor/unidad completo');
  });

  it('displays loading state correctly', () => {
    render(
      <ComponenteForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Guardando\.\.\./i });
    expect(submitButton).toBeDisabled();
  });

  it('prevents removing the last valor/unidad pair', async () => {
    const user = userEvent.setup();

    render(
      <ComponenteForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Initially there should be one valor/unidad pair with no remove button
    const removeButtons = screen.getAllByRole('button').filter(button =>
      button.querySelector('svg') && button.getAttribute('class')?.includes('text-red-600')
    );
    expect(removeButtons.length).toBe(0); // No remove button for single pair
  });

  it('populates ubicaciones when editing existing componente', () => {
    render(
      <ComponenteForm
        componente={mockComponente}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('1')).toBeInTheDocument(); // cajoncitoId
    expect(screen.getByDisplayValue('50')).toBeInTheDocument(); // cantidad
  });
});