import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponenteList } from '../componente-list';
import { ComponenteWithRelations } from '@/types/api';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockComponentes: ComponenteWithRelations[] = [
  {
    id: '1',
    categoria: 'RESISTENCIA',
    descripcion: 'Resistencia 1K ohm',
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
  },
  {
    id: '2',
    categoria: 'CAPACITOR',
    descripcion: 'Capacitor 100nF',
    valorUnidad: [{ valor: '100', unidad: 'nF' }],
    stockMinimo: 5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ubicaciones: [],
    stockActual: 0,
  },
];

const mockPaginatedResponse = {
  success: true,
  data: mockComponentes,
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

describe('ComponenteList', () => {
  const mockOnCreateNew = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnView = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(mockPaginatedResponse),
      ok: true,
    });
  });

  it('renders componente list correctly', async () => {
    render(
      <ComponenteList
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Componentes Electrónicos')).toBeInTheDocument();
    });

    expect(screen.getByText('Resistencia 1K ohm')).toBeInTheDocument();
    expect(screen.getByText('Capacitor 100nF')).toBeInTheDocument();
    expect(screen.getByText('2 componentes encontrados')).toBeInTheDocument();
  });

  it('displays loading spinner while fetching', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <ComponenteList
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByRole('generic', { hidden: true })).toBeInTheDocument(); // Spinner
  });

  it('displays empty state when no componentes found', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      }),
      ok: true,
    });

    render(
      <ComponenteList
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No se encontraron componentes')).toBeInTheDocument();
    });
  });

  it('calls onCreateNew when Nuevo Componente button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ComponenteList
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Componentes Electrónicos')).toBeInTheDocument();
    });

    const createButton = screen.getByText('Nuevo Componente');
    await user.click(createButton);

    expect(mockOnCreateNew).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ComponenteList
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Resistencia 1K ohm')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button').filter(button =>
      button.querySelector('svg') && button.getAttribute('aria-label')?.includes('Edit')
    );
    await user.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockComponentes[0]);
  });

  it('calls onView when view button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ComponenteList
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Resistencia 1K ohm')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByRole('button').filter(button =>
      button.querySelector('svg') && button.getAttribute('aria-label')?.includes('Eye')
    );
    await user.click(viewButtons[0]);

    expect(mockOnView).toHaveBeenCalledWith(mockComponentes[0]);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ComponenteList
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Resistencia 1K ohm')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button').filter(button =>
      button.querySelector('svg') && button.getAttribute('aria-label')?.includes('Trash')
    );
    await user.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(mockComponentes[0]);
  });

  it('filters componentes by search term', async () => {
    const user = userEvent.setup();

    render(
      <ComponenteList
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Componentes Electrónicos')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por descripción...');
    await user.type(searchInput, 'Resistencia');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('search=Resistencia')
    );
  });

  it('filters componentes by categoria', async () => {
    const user = userEvent.setup();

    render(
      <ComponenteList
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Componentes Electrónicos')).toBeInTheDocument();
    });

    const categoriaSelect = screen.getByDisplayValue('Todas las categorías');
    await user.selectOptions(categoriaSelect, 'RESISTENCIA');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('categoria=RESISTENCIA')
    );
  });

  it('displays correct categoria badges with colors', async () => {
    render(
      <ComponenteList
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Resistencia')).toBeInTheDocument();
      expect(screen.getByText('Capacitor')).toBeInTheDocument();
    });

    const resistenciaBadge = screen.getByText('Resistencia');
    const capacitorBadge = screen.getByText('Capacitor');

    expect(resistenciaBadge).toHaveClass('bg-red-100', 'text-red-800');
    expect(capacitorBadge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('displays stock status correctly', async () => {
    render(
      <ComponenteList
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument(); // Stock actual for resistencia
      expect(screen.getByText('En stock')).toBeInTheDocument();
    });

    const capacitorStockBadge = screen.getByText('0');
    expect(capacitorStockBadge).toHaveClass('bg-red-100', 'text-red-800'); // Sin stock
  });

  it('displays ubicaciones correctly', async () => {
    render(
      <ComponenteList
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('C1')).toBeInTheDocument();
    });
  });

  it('handles pagination correctly', async () => {
    const user = userEvent.setup();

    // Mock response with multiple pages
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        data: mockComponentes,
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      }),
      ok: true,
    });

    render(
      <ComponenteList
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
      expect(screen.getByText('Siguiente')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Siguiente');
    await user.click(nextButton);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('page=2')
    );
  });

  it('formats valor/unidad pairs correctly', async () => {
    render(
      <ComponenteList
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('1K Ω')).toBeInTheDocument();
      expect(screen.getByText('100 nF')).toBeInTheDocument();
    });
  });

  it('displays multiple ubicaciones with counter', async () => {
    const componenteWithMultipleUbicaciones: ComponenteWithRelations = {
      ...mockComponentes[0],
      ubicaciones: [
        ...mockComponentes[0].ubicaciones,
        {
          id: '2',
          cantidad: 25,
          createdAt: new Date(),
          updatedAt: new Date(),
          componenteId: '1',
          cajoncitoId: '2',
          cajoncito: {
            id: '2',
            nombre: 'Cajoncito 2',
            codigo: 'C2',
          },
        },
        {
          id: '3',
          cantidad: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
          componenteId: '1',
          cajoncitoId: '3',
          cajoncito: {
            id: '3',
            nombre: 'Cajoncito 3',
            codigo: 'C3',
          },
        },
      ],
    };

    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        data: [componenteWithMultipleUbicaciones],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      }),
      ok: true,
    });

    render(
      <ComponenteList
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onView={mockOnView}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('C1')).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument(); // Counter for additional ubicaciones
    });
  });
});