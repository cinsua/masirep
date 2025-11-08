/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DrawerGrid } from '../drawer-grid';
import type { Cajon, Division } from '../drawer-grid';

// Mock components to avoid dependency issues
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <h3 {...props}>
      {children}
    </h3>
  ),
  CardDescription: ({ children, ...props }: any) => (
    <p {...props}>
      {children}
    </p>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => (
    <span {...props}>
      {children}
    </span>
  ),
}));

describe('DrawerGrid', () => {
  const mockCajones: Cajon[] = [
    {
      id: '1',
      codigo: 'CAJ-001',
      nombre: 'Cajón de Herramientas',
      descripcion: 'Herramientas básicas',
      estanteriaId: 'est-1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      _count: {
        divisiones: 2,
        repuestos: 5,
      },
    },
    {
      id: '2',
      codigo: 'CAJ-002',
      nombre: 'Cajón de Electrónica',
      descripcion: 'Componentes electrónicos',
      estanteriaId: 'est-1',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02',
      _count: {
        divisiones: 0,
        repuestos: 3,
      },
    },
    {
      id: '3',
      codigo: 'CAJ-003',
      nombre: 'Cajón Vacío',
      descripcion: 'Sin contenido',
      estanteriaId: 'est-1',
      createdAt: '2024-01-03',
      updatedAt: '2024-01-03',
      _count: {
        divisiones: 0,
        repuestos: 0,
      },
    },
  ];

  const mockDivisions: Record<string, Division[]> = {
    '1': [
      {
        id: 'div-1',
        codigo: 'DIV-001',
        nombre: 'División Superior',
        descripcion: 'Herramientas grandes',
        cajonId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        _count: {
          repuestos: 3,
        },
      },
      {
        id: 'div-2',
        codigo: 'DIV-002',
        nombre: 'División Inferior',
        descripcion: 'Herramientas pequeñas',
        cajonId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        _count: {
          repuestos: 2,
        },
      },
    ],
    '2': [],
    '3': [],
  };

  it('renders loading state', () => {
    render(
      <DrawerGrid
        cajones={[]}
        divisions={{}}
        loading={true}
      />
    );

    expect(screen.getByText('Cargando cajones...')).toBeInTheDocument();
  });

  it('renders empty state when no cajones exist', () => {
    render(
      <DrawerGrid
        cajones={[]}
        divisions={{}}
        loading={false}
        onAddCajon={jest.fn()}
      />
    );

    expect(screen.getByText('No hay cajones configurados')).toBeInTheDocument();
    expect(screen.getByText('Comienza agregando cajones para organizar tu inventario')).toBeInTheDocument();
    expect(screen.getByText('Agregar Cajón')).toBeInTheDocument();
  });

  it('renders cajones grid with correct data', () => {
    render(
      <DrawerGrid
        cajones={mockCajones}
        divisions={mockDivisions}
        loading={false}
      />
    );

    expect(screen.getByText('Cajones (3)')).toBeInTheDocument();
    expect(screen.getByText('• 2 divisiones')).toBeInTheDocument();
    expect(screen.getByText('CAJ-001')).toBeInTheDocument();
    expect(screen.getByText('Cajón de Herramientas')).toBeInTheDocument();
    expect(screen.getByText('CAJ-002')).toBeInTheDocument();
    expect(screen.getByText('Cajón de Electrónica')).toBeInTheDocument();
    expect(screen.getByText('CAJ-003')).toBeInTheDocument();
    expect(screen.getByText('Cajón Vacío')).toBeInTheDocument();
  });

  it('shows cajon click handler', () => {
    const mockClick = jest.fn();
    render(
      <DrawerGrid
        cajones={mockCajones}
        divisions={mockDivisions}
        loading={false}
        onCajonClick={mockClick}
      />
    );

    const cajonCards = screen.getAllByRole('button');
    expect(cajonCards).toHaveLength(3);

    fireEvent.click(cajonCards[0]);
    expect(mockClick).toHaveBeenCalledWith(mockCajones[0]);
  });

  it('shows add cajon button when provided', () => {
    const mockAddCajon = jest.fn();
    render(
      <DrawerGrid
        cajones={mockCajones}
        divisions={mockDivisions}
        loading={false}
        onAddCajon={mockAddCajon}
      />
    );

    expect(screen.getByText('Agregar Cajón')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Agregar Cajón'));
    expect(mockAddCajon).toHaveBeenCalled();
  });

  it('displays division information correctly', () => {
    render(
      <DrawerGrid
        cajones={mockCajones}
        divisions={mockDivisions}
        loading={false}
      />
    );

    // Check that divisions are displayed for cajon 1
    expect(screen.getByText('DIV-001')).toBeInTheDocument();
    expect(screen.getByText('División Superior')).toBeInTheDocument();
    expect(screen.getByText('DIV-002')).toBeInTheDocument();
    expect(screen.getByText('División Inferior')).toBeInTheDocument();
  });

  it('shows summary statistics', () => {
    render(
      <DrawerGrid
        cajones={mockCajones}
        divisions={mockDivisions}
        loading={false}
      />
    );

    expect(screen.getByText('Resumen')).toBeInTheDocument();
    expect(screen.getByText('Total Cajones:')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Con Divisiones:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Repuestos Directos:')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Total Divisiones:')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('filters cajones based on search', () => {
    render(
      <DrawerGrid
        cajones={mockCajones}
        divisions={mockDivisions}
        loading={false}
      />
    );

    // Should show all cajones initially
    expect(screen.getAllByText(/CAJON-\d{3}/)).toHaveLength(3);
  });

  it('handles cajon with no divisions but with direct repuestos', () => {
    const cajonesWithDirectRepuestos: Cajon[] = [
      {
        id: '1',
        codigo: 'CAJ-001',
        nombre: 'Cajón Directo',
        estanteriaId: 'est-1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        _count: {
          divisiones: 0,
          repuestos: 5,
        },
      },
    ];

    render(
      <DrawerGrid
        cajones={cajonesWithDirectRepuestos}
        divisions={{}}
        loading={false}
      />
    );

    expect(screen.getByText('Repuestos Directos')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('validates Cajon type correctly', () => {
    expect(() => {
      const validCajon: Cajon = mockCajones[0];
      expect(typeof validCajon.id).toBe('string');
      expect(typeof validCajon.codigo).toBe('string');
      expect(typeof validCajon.nombre).toBe('string');
      expect(typeof validCajon._count).toBe('object');
      expect(typeof validCajon._count.divisiones).toBe('number');
      expect(typeof validCajon._count.repuestos).toBe('number');
    }).not.toThrow();
  });

  it('validates Division type correctly', () => {
    expect(() => {
      const validDivision: Division = mockDivisions['1'][0];
      expect(typeof validDivision.id).toBe('string');
      expect(typeof validDivision.codigo).toBe('string');
      expect(typeof validDivision.nombre).toBe('string');
      expect(typeof validDivision.cajonId).toBe('string');
      expect(typeof validDivision._count).toBe('object');
      expect(typeof validDivision._count.repuestos).toBe('number');
    }).not.toThrow();
  });
});