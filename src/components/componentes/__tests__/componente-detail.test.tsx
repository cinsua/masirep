import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponenteDetail } from '../componente-detail';
import { ComponenteWithRelations } from '@/types/api';

const mockComponente: ComponenteWithRelations = {
  id: '1',
  categoria: 'RESISTENCIA',
  descripcion: 'Resistencia de 1K ohm 1/4W',
  valorUnidad: [
    { valor: '1K', unidad: 'Ω' },
    { valor: '0.25', unidad: 'W' }
  ],
  stockMinimo: 10,
  isActive: true,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-02T15:30:00Z'),
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
        nombre: 'Cajoncito Resistencias',
        codigo: 'CR-001',
      },
    },
    {
      id: '2',
      cantidad: 25,
      createdAt: new Date(),
      updatedAt: new Date(),
      componenteId: '1',
      cajoncitoId: '2',
      cajoncito: {
        id: '2',
        nombre: 'Cajoncito Variado',
        codigo: 'CV-003',
      },
    },
  ],
  stockActual: 75,
};

describe('ComponenteDetail', () => {
  const mockOnEdit = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders componente information correctly', () => {
    render(
      <ComponenteDetail
        componente={mockComponente}
        onEdit={mockOnEdit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Detalles del Componente')).toBeInTheDocument();
    expect(screen.getByText('Resistencia de 1K ohm 1/4W')).toBeInTheDocument();
    expect(screen.getByText('Resistencia')).toBeInTheDocument();
  });

  it('displays categoria badge with correct color', () => {
    render(
      <ComponenteDetail
        componente={mockComponente}
        onEdit={mockOnEdit}
        onBack={mockOnBack}
      />
    );

    const categoriaBadge = screen.getByText('Resistencia');
    expect(categoriaBadge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('displays all valor/unidad pairs', () => {
    render(
      <ComponenteDetail
        componente={mockComponente}
        onEdit={mockOnEdit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('1K Ω')).toBeInTheDocument();
    expect(screen.getByText('0.25 W')).toBeInTheDocument();
  });

  it('displays stock status correctly', () => {
    render(
      <ComponenteDetail
        componente={mockComponente}
        onEdit={mockOnEdit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('En stock: 75 unidades')).toBeInTheDocument();
    expect(screen.getByText('(Mínimo: 10)')).toBeInTheDocument();
  });

  it('displays stock status as "Sin stock" when stock is 0', () => {
    const componenteSinStock: ComponenteWithRelations = {
      ...mockComponente,
      stockActual: 0,
      ubicaciones: [],
    };

    render(
      <ComponenteDetail
        componente={componenteSinStock}
        onEdit={mockOnEdit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Sin stock: 0 unidades')).toBeInTheDocument();
  });

  it('displays stock status as "Stock bajo" when stock is at minimum', () => {
    const componenteStockBajo: ComponenteWithRelations = {
      ...mockComponente,
      stockActual: 10, // Same as stockMinimo
    };

    render(
      <ComponenteDetail
        componente={componenteStockBajo}
        onEdit={mockOnEdit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Stock bajo: 10 unidades')).toBeInTheDocument();
  });

  it('displays ubicaciones correctly', () => {
    render(
      <ComponenteDetail
        componente={mockComponente}
        onEdit={mockOnEdit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Ubicaciones de Almacenamiento')).toBeInTheDocument();
    expect(screen.getByText('50 unidades')).toBeInTheDocument();
    expect(screen.getByText('25 unidades')).toBeInTheDocument();
    expect(screen.getByText('Cajoncito Resistencias')).toBeInTheDocument();
    expect(screen.getByText('Cajoncito Variado')).toBeInTheDocument();
    expect(screen.getByText('CR-001')).toBeInTheDocument();
    expect(screen.getByText('CV-003')).toBeInTheDocument();
  });

  it('displays empty state when no ubicaciones', () => {
    const componenteSinUbicaciones: ComponenteWithRelations = {
      ...mockComponente,
      ubicaciones: [],
      stockActual: 0,
    };

    render(
      <ComponenteDetail
        componente={componenteSinUbicaciones}
        onEdit={mockOnEdit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Este componente no tiene ubicaciones asignadas')).toBeInTheDocument();
  });

  it('displays system information correctly', () => {
    render(
      <ComponenteDetail
        componente={mockComponente}
        onEdit={mockOnEdit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('ID del Componente')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Fecha de Creación')).toBeInTheDocument();
    expect(screen.getByText('Última Actualización')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('displays status as "Inactivo" when isActive is false', () => {
    const componenteInactivo: ComponenteWithRelations = {
      ...mockComponente,
      isActive: false,
    };

    render(
      <ComponenteDetail
        componente={componenteInactivo}
        onEdit={mockOnEdit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('calls onEdit when Editar button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ComponenteDetail
        componente={mockComponente}
        onEdit={mockOnEdit}
        onBack={mockOnBack}
      />
    );

    const editButton = screen.getByText('Editar');
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockComponente);
  });

  it('calls onBack when Volver button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ComponenteDetail
        componente={mockComponente}
        onEdit={mockOnEdit}
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByText('Volver');
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('displays different categoria colors correctly', () => {
    const categorias = [
      { cat: 'CAPACITOR', expectedClass: 'bg-blue-100 text-blue-800' },
      { cat: 'INTEGRADO', expectedClass: 'bg-green-100 text-green-800' },
      { cat: 'VENTILADOR', expectedClass: 'bg-yellow-100 text-yellow-800' },
      { cat: 'OTROS', expectedClass: 'bg-gray-100 text-gray-800' },
    ];

    categorias.forEach(({ cat, expectedClass }) => {
      const componenteWithCategoria: ComponenteWithRelations = {
        ...mockComponente,
        categoria: cat as any,
      };

      const { rerender } = render(
        <ComponenteDetail
          componente={componenteWithCategoria}
          onEdit={mockOnEdit}
          onBack={mockOnBack}
        />
      );

      const categoriaLabels = {
        CAPACITOR: 'Capacitor',
        INTEGRADO: 'Circuito Integrado',
        VENTILADOR: 'Ventilador',
        OTROS: 'Otros',
      };

      const categoriaBadge = screen.getByText(categoriaLabels[cat as keyof typeof categoriaLabels]);
      expect(categoriaBadge).toHaveClass(...expectedClass.split(' '));
    });
  });

  it('formats dates correctly for Spanish locale', () => {
    render(
      <ComponenteDetail
        componente={mockComponente}
        onEdit={mockOnEdit}
        onBack={mockOnBack}
      />
    );

    // The dates should be formatted in Spanish locale (es-MX)
    expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument(); // Creation date
    expect(screen.getByText(/2\/1\/2024/)).toBeInTheDocument(); // Update date
  });

  it('calculates total stock correctly from ubicaciones', () => {
    render(
      <ComponenteDetail
        componente={mockComponente}
        onEdit={mockOnEdit}
        onBack={mockOnBack}
      />
    );

    // Total should be 50 + 25 = 75
    expect(screen.getByText('En stock: 75 unidades')).toBeInTheDocument();
  });

  it('displays location path correctly', () => {
    render(
      <ComponenteDetail
        componente={mockComponente}
        onEdit={mockOnEdit}
        onBack={mockOnBack}
      />
    );

    // Should show cajoncito information
    expect(screen.getByText('Cajoncito: CR-001 (Cajoncito Resistencias)')).toBeInTheDocument();
    expect(screen.getByText('Cajoncito: CV-003 (Cajoncito Variado)')).toBeInTheDocument();
  });

  it('renders all section headers correctly', () => {
    render(
      <ComponenteDetail
        componente={mockComponente}
        onEdit={mockOnEdit}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Información General')).toBeInTheDocument();
    expect(screen.getByText('Ubicaciones de Almacenamiento')).toBeInTheDocument();
    expect(screen.getByText('Información del Sistema')).toBeInTheDocument();
  });
});