import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EquipoList } from "../equipo-list";
import { EquipoWithRelations } from "@/types/api";

// Mock fetch
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Helper function to create mock Response
const createMockResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

describe("EquipoList", () => {
  const mockEquipos: EquipoWithRelations[] = [
    {
      id: "1",
      codigo: "EQ-001",
      sap: "1234567890",
      nombre: "ESP20",
      descripcion: "PLC principal",
      marca: "Siemens",
      modelo: "S7-1200",
      numeroSerie: "SN123456789",
      isActive: true,
      createdAt: new Date("2023-01-01"),
      updatedAt: new Date("2023-01-01"),
      repuestos: [],
      _count: { repuestos: 2 },
    },
    {
      id: "2",
      codigo: "EQ-002",
      sap: null,
      nombre: "PREPMASTER",
      descripcion: null,
      marca: "ABB",
      modelo: "ACS800",
      numeroSerie: null,
      isActive: true,
      createdAt: new Date("2023-01-02"),
      updatedAt: new Date("2023-01-02"),
      repuestos: [],
      _count: { repuestos: 0 },
    },
  ];

  const defaultProps = {
    onCreateNew: jest.fn(),
    onEdit: jest.fn(),
    onView: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading state initially", () => {
mockFetch.mockResolvedValueOnce(
      createMockResponse({
        success: true,
        data: [],
        pagination: { totalPages: 1, total: 0 },
})
    );

    render(<EquipoList {...defaultProps} />);

    expect(screen.getByText("Cargando Equipos...")).toBeInTheDocument();
  });

  it("should render equipos list after loading", async () => {
mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({
        success: true,
        data: [],
        pagination: { totalPages: 1, total: 0 },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    render(<EquipoList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("EQ-001")).toBeInTheDocument();
      expect(screen.getByText("EQ-002")).toBeInTheDocument();
      expect(screen.getByText("ESP20")).toBeInTheDocument();
      expect(screen.getByText("PREPMASTER")).toBeInTheDocument();
    });

    expect(screen.getByText("Gestión de Equipos (2)")).toBeInTheDocument();
  });

  it("should display SAP badge when present", async () => {
mockFetch.mockResolvedValueOnce(
      createMockResponse({
        success: true,
        data: [mockEquipos[0]],
        pagination: { totalPages: 1, total: 1 },
})
    );

    render(<EquipoList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("1234567890")).toBeInTheDocument();
    });

    expect(screen.getByText("SAP: 1234567890")).toBeInTheDocument();
  });

  it("should display 'Sin SAP' when SAP is null", async () => {
mockFetch.mockResolvedValueOnce(
      createMockResponse({
        success: true,
        data: [mockEquipos[1]],
        pagination: { totalPages: 1, total: 1 },
})
    );

    render(<EquipoList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Sin SAP")).toBeInTheDocument();
    });
  });

  it("should display repuestos count badge", async () => {
mockFetch.mockResolvedValueOnce(
      createMockResponse({
        success: true,
        data: [mockEquipos[0]],
        pagination: { totalPages: 1, total: 1 },
})
    );

    render(<EquipoList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("should handle create new button click", async () => {
mockFetch.mockResolvedValueOnce(
      createMockResponse({
        success: true,
        data: [],
        pagination: { totalPages: 1, total: 0 },
})
    );

    render(<EquipoList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Nuevo Equipo")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Nuevo Equipo"));
    expect(defaultProps.onCreateNew).toHaveBeenCalledTimes(1);
  });

  it("should handle search input", async () => {
mockFetch
      .mockResolvedValueOnce(createMockResponse({
        success: true,
        data: mockEquipos,
        pagination: { totalPages: 1, total: 2 },
      }))
      .mockResolvedValueOnce(createMockResponse({
        success: true,
        data: [mockEquipos[0]],
        pagination: { totalPages: 1, total: 1 },
      }));

    render(<EquipoList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Buscar por código, SAP, nombre/)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Buscar por código, SAP, nombre/);
    await userEvent.type(searchInput, "ESP20");

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("search=ESP20"),
        expect.any(Object)
      );
    });
  });

  it("should handle edit button click", async () => {
mockFetch.mockResolvedValueOnce(
      createMockResponse({
        success: true,
        data: [mockEquipos[0]],
        pagination: { totalPages: 1, total: 1 },
})
    );

    render(<EquipoList {...defaultProps} />);

    await waitFor(() => {
      const editButtons = screen.getAllByRole("button", { name: /editar/i });
      expect(editButtons).toHaveLength(1);
    });

    const editButton = screen.getAllByRole("button", { name: /editar/i })[0];
    await userEvent.click(editButton);

    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockEquipos[0]);
  });

  it("should handle view button click", async () => {
mockFetch.mockResolvedValueOnce(
      createMockResponse({
        success: true,
        data: [mockEquipos[0]],
        pagination: { totalPages: 1, total: 1 },
})
    );

    render(<EquipoList {...defaultProps} />);

    await waitFor(() => {
      const viewButtons = screen.getAllByRole("button", { name: /ver/i });
      expect(viewButtons).toHaveLength(1);
    });

    const viewButton = screen.getAllByRole("button", { name: /ver/i })[0];
    await userEvent.click(viewButton);

    expect(defaultProps.onView).toHaveBeenCalledWith(mockEquipos[0]);
  });

  it("should handle delete button click", async () => {
mockFetch.mockResolvedValueOnce(
      createMockResponse({
        success: true,
        data: [mockEquipos[0]],
        pagination: { totalPages: 1, total: 1 },
})
    );

    render(<EquipoList {...defaultProps} />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole("button", { name: /eliminar/i });
      expect(deleteButtons).toHaveLength(1);
    });

    const deleteButton = screen.getAllByRole("button", { name: /eliminar/i })[0];
    await userEvent.click(deleteButton);

    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockEquipos[0]);
  });

  it("should display empty state when no equipos", async () => {
mockFetch.mockResolvedValueOnce(
      createMockResponse({
        success: true,
        data: [],
        pagination: { totalPages: 1, total: 0 },
})
    );

    render(<EquipoList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("No hay equipos registrados")).toBeInTheDocument();
      expect(screen.getByText("Crea tu primer equipo para comenzar")).toBeInTheDocument();
    });

    expect(screen.getByText("Crear Primer Equipo")).toBeInTheDocument();
  });

  it("should display search empty state when search yields no results", async () => {
mockFetch
      .mockResolvedValueOnce(createMockResponse({
        success: true,
        data: mockEquipos,
        pagination: { totalPages: 1, total: 2 },
      }))
      .mockResolvedValueOnce(createMockResponse({
        success: true,
        data: [],
        pagination: { totalPages: 1, total: 0 },
      }));

    render(<EquipoList {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/Buscar por código, SAP, nombre/);
    await userEvent.type(searchInput, "nonexistent");

    await waitFor(() => {
      expect(screen.getByText("No se encontraron equipos")).toBeInTheDocument();
      expect(screen.getByText("Intenta con otros términos de búsqueda")).toBeInTheDocument();
    });
  });

  it("should handle pagination", async () => {
mockFetch
      .mockResolvedValueOnce(createMockResponse({
        success: true,
        data: mockEquipos,
        pagination: { totalPages: 2, total: 25 },
      }))
      .mockResolvedValueOnce(createMockResponse({
        success: true,
        data: [mockEquipos[0]],
        pagination: { totalPages: 2, total: 25 },
      }));

    render(<EquipoList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Siguiente")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Siguiente"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("page=2"),
        expect.any(Object)
      );
    });
  });

  it("should handle API errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<EquipoList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText("Cargando Equipos...")).not.toBeInTheDocument();
    });

    // Should not crash, should show empty state or handle error
    expect(screen.getByText("Gestión de Equipos (0)")).toBeInTheDocument();
  });

  it("should handle sorting by clicking column headers", async () => {
mockFetch
      .mockResolvedValueOnce(createMockResponse({
        success: true,
        data: [mockEquipos[0]],
        pagination: { totalPages: 1, total: 1 },
      }))
      .mockResolvedValueOnce(createMockResponse({
        success: true,
        data: [mockEquipos[0]],
        pagination: { totalPages: 1, total: 1 },
      }));

    render(<EquipoList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Nombre")).toBeInTheDocument();
    });

    const nombreHeader = screen.getByText("Nombre");
    await userEvent.click(nombreHeader);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("sortBy=nombre&sortOrder=asc"),
        expect.any(Object)
      );
    });
  });

  it("should truncate long descriptions", async () => {
    const equipoWithLongDescription = {
      ...mockEquipos[0],
      descripcion: "This is a very long description that should be truncated in the table view to maintain readability and proper layout",
    };

mockFetch.mockResolvedValueOnce(
      createMockResponse({
        success: true,
        data: [equipoWithLongDescription],
        pagination: { totalPages: 1, total: 1 },
})
    );

    render(<EquipoList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("This is a very long description that should be truncated")).toBeInTheDocument();
    });

    // Should show truncated description
    const description = screen.getByText(/This is a very long description/);
    expect(description).toHaveClass("line-clamp-1");
  });
});