/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DrawerCard } from '../drawer-card';
import type { Cajon, Division } from '../drawer-grid';

// Mock components to avoid dependency issues
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

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}));

jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: any) => <div>{children}</div>,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogAction: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  AlertDialogCancel: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

describe('DrawerCard', () => {
  const mockCajon: Cajon = {
    id: 'caj-1',
    codigo: 'CAJ-001',
    nombre: 'Cajón de Prueba',
    descripcion: 'Descripción del cajón',
    estanteriaId: 'est-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    _count: {
      divisiones: 2,
      repuestos: 5,
    },
  };

  const mockDivisions: Division[] = [
    {
      id: 'div-1',
      codigo: 'DIV-001',
      nombre: 'División Superior',
      descripcion: 'División de prueba',
      cajonId: 'caj-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      _count: {
        repuestos: 3,
      },
    },
    {
      id: 'div-2',
      codigo: 'DIV-002',
      nombre: 'División Inferior',
      descripcion: 'Otra división',
      cajonId: 'caj-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      _count: {
        repuestos: 2,
      },
    },
  ];

  it('renders cajon information correctly', () => {
    render(
      <DrawerCard
        cajon={mockCajon}
        divisions={mockDivisions}
        hasContent={true}
      />
    );

    expect(screen.getByText('CAJ-001')).toBeInTheDocument();
    expect(screen.getByText('Cajón de Prueba')).toBeInTheDocument();
    expect(screen.getByText('Descripción del cajón')).toBeInTheDocument();
    expect(screen.getByText('Con contenido')).toBeInTheDocument();
  });

  it('shows empty cajon status when no content', () => {
    const emptyCajon: Cajon = {
      ...mockCajon,
      _count: {
        divisiones: 0,
        repuestos: 0,
      },
    };

    render(
      <DrawerCard
        cajon={emptyCajon}
        divisions={[]}
        hasContent={false}
      />
    );

    expect(screen.getByText('Vacío')).toBeInTheDocument();
  });

  it('shows cajon with divisions status when has divisions but no direct repuestos', () => {
    const cajonWithDivisions: Cajon = {
      ...mockCajon,
      _count: {
        divisiones: 2,
        repuestos: 0,
      },
    };

    render(
      <DrawerCard
        cajon={cajonWithDivisions}
        divisions={mockDivisions}
        hasContent={true}
      />
    );

    expect(screen.getByText('Con divisiones')).toBeInTheDocument();
  });

  it('renders division sections when divisions exist', () => {
    render(
      <DrawerCard
        cajon={mockCajon}
        divisions={mockDivisions}
        hasContent={true}
      />
    );

    expect(screen.getByText('Divisiones (2)')).toBeInTheDocument();
    expect(screen.getByText('DIV-001')).toBeInTheDocument();
    expect(screen.getByText('División Superior')).toBeInTheDocument();
    expect(screen.getByText('DIV-002')).toBeInTheDocument();
    expect(screen.getByText('División Inferior')).toBeInTheDocument();
  });

  it('limits division display to 3 items', () => {
    const manyDivisions: Division[] = [
      ...mockDivisions,
      {
        id: 'div-3',
        codigo: 'DIV-003',
        nombre: 'División Extra',
        descripcion: 'Tercera división',
        cajonId: 'caj-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        _count: {
          repuestos: 1,
        },
      },
    ];

    render(
      <DrawerCard
        cajon={mockCajon}
        divisions={manyDivisions}
        hasContent={true}
      />
    );

    expect(screen.getByText('Divisiones (3)')).toBeInTheDocument();
    expect(screen.getByText('DIV-001')).toBeInTheDocument();
    expect(screen.getByText('DIV-002')).toBeInTheDocument();
    expect(screen.getByText('DIV-003')).toBeInTheDocument();
    expect(screen.getByText('+1 division más')).toBeInTheDocument();
  });

  it('shows direct repuestos when no divisions exist', () => {
    const cajonWithRepuestos: Cajon = {
      ...mockCajon,
      _count: {
        divisiones: 0,
        repuestos: 3,
      },
    };

    render(
      <DrawerCard
        cajon={cajonWithRepuestos}
        divisions={[]}
        hasContent={true}
      />
    );

    expect(screen.getByText('Repuestos Directos')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows creation date', () => {
    render(
      <DrawerCard
        cajon={mockCajon}
        divisions={mockDivisions}
        hasContent={true}
      />
    );

    expect(screen.getByText('Creado: 1/1/2024')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const mockClick = jest.fn();
    render(
      <DrawerCard
        cajon={mockCajon}
        divisions={mockDivisions}
        hasContent={true}
        onClick={mockClick}
      />
    );

    fireEvent.click(screen.getByRole('generic'));
    expect(mockClick).toHaveBeenCalledWith(mockCajon);
  });

  it('handles division click events', () => {
    const mockDivisionClick = jest.fn();
    render(
      <DrawerCard
        cajon={mockCajon}
        divisions={mockDivisions}
        hasContent={true}
        onDivisionClick={mockDivisionClick}
      />
    );

    const divisionElements = screen.getAllByText('DIV-001');
    fireEvent.click(divisionElements[0]);
    expect(mockDivisionClick).toHaveBeenCalledWith(mockDivisions[0]);
  });

  it('shows edit button when showActions is true', () => {
    const mockEdit = jest.fn();
    render(
      <DrawerCard
        cajon={mockCajon}
        divisions={mockDivisions}
        hasContent={true}
        showActions={true}
        onEdit={mockEdit}
      />
    );

    const editButtons = screen.getAllByRole('button');
    const moreButton = editButtons.find(button => button.getAttribute('aria-label')?.includes('More options'));

    expect(moreButton).toBeInTheDocument();
  });

  it('shows correct status badges', () => {
    render(
      <DrawerCard
        cajon={mockCajon}
        divisions={mockDivisions}
        hasContent={true}
      />
    );

    expect(screen.getByText('Con contenido')).toBeInTheDocument();
    expect(screen.getByText('Con descripción')).toBeInTheDocument();
  });

  it('validates Cajon type correctly', () => {
    expect(() => {
      const validCajon: Cajon = mockCajon;
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
      const validDivision: Division = mockDivisions[0];
      expect(typeof validDivision.id).toBe('string');
      expect(typeof validDivision.codigo).toBe('string');
      expect(typeof validDivision.nombre).toBe('string');
      expect(typeof validDivision.cajonId).toBe('string');
      expect(typeof validDivision._count).toBe('object');
      expect(typeof validDivision._count.repuestos).toBe('number');
    }).not.toThrow();
  });
});