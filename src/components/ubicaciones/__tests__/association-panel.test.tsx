import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssociationPanel } from "../association-panel";
import * as notifications from "@/components/notifications/notification-provider";

// Mock dependencies
jest.mock("@/components/notifications/notification-provider", () => ({
  useNotifications: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
  }),
}));

jest.mock("../location-picker", () => ({
  LocationPicker: ({ onSelect, itemType }: any) => (
    <div data-testid="location-picker">
      <button
        onClick={() => onSelect({
          id: "test-location",
          nombre: "Test Location",
          codigo: "TEST-001",
          type: "armario"
        })}
      >
        Select Test Location
      </button>
    </div>
  ),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe("AssociationPanel", () => {
  const mockProps = {
    itemType: "repuesto" as const,
    itemId: "rep-1",
    itemName: "Fusible 5A",
    itemCode: "REP-001",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render the component with default trigger button", () => {
      render(<AssociationPanel {...mockProps} />);

      const triggerButton = screen.getByRole("button", { name: /gestionar asociaciones/i });
      expect(triggerButton).toBeInTheDocument();
    });

    it("should render with custom trigger", () => {
      const customTrigger = <button>Custom Trigger</button>;
      render(<AssociationPanel {...mockProps} trigger={customTrigger} />);

      expect(screen.getByText("Custom Trigger")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /gestionar asociaciones/i })).not.toBeInTheDocument();
    });

    it("should render dialog content when opened", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: [],
        }),
      });

      render(<AssociationPanel {...mockProps} />);

      const triggerButton = screen.getByRole("button", { name: /gestionar asociaciones/i });
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByText(/gestionar asociaciones/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockProps.itemName)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockProps.itemCode)).toBeInTheDocument();
      });
    });
  });

  describe("Current Associations Loading", () => {
    it("should load and display current associations when dialog opens", async () => {
      const mockAssociations = [
        {
          id: "assoc-1",
          cantidad: 10,
          armario: {
            id: "arm-1",
            nombre: "Armario Principal",
            codigo: "ARM-001",
          },
        },
        {
          id: "assoc-2",
          cantidad: 5,
          cajoncito: {
            id: "caj-1",
            nombre: "Cajoncito de fusibles",
            codigo: "CAJ-001",
          },
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockAssociations,
        }),
      });

      render(<AssociationPanel {...mockProps} />);

      const triggerButton = screen.getByRole("button", { name: /gestionar asociaciones/i });
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByText("Armario Principal")).toBeInTheDocument();
        expect(screen.getByText("Cajoncito de fusibles")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
      });

      expect(fetch).toHaveBeenCalledWith(`/api/${mockProps.itemType}s/${mockProps.itemId}/ubicaciones`);
    });

    it("should show error message when associations fail to load", async () => {
      const { showError } = require("@/components/notifications/notification-provider").useNotifications();

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          success: false,
          error: "API Error",
        }),
      });

      render(<AssociationPanel {...mockProps} />);

      const triggerButton = screen.getByRole("button", { name: /gestionar asociaciones/i });
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(showError).toHaveBeenCalledWith("API Error", "Error de carga");
      });
    });

    it("should handle network errors gracefully", async () => {
      const { showError } = require("@/components/notifications/notification-provider").useNotifications();

      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      render(<AssociationPanel {...mockProps} />);

      const triggerButton = screen.getByRole("button", { name: /gestionar asociaciones/i });
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(showError).toHaveBeenCalledWith("Error de conexión al cargar asociaciones", "Error de conexión");
      });
    });
  });

  describe("Location Association", () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: [],
        }),
      });
    });

    it("should allow selecting a location and quantity", async () => {
      render(<AssociationPanel {...mockProps} />);

      const triggerButton = screen.getByRole("button", { name: /gestionar asociaciones/i });
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId("location-picker")).toBeInTheDocument();
      });

      // Select location
      const selectLocationButton = screen.getByText("Select Test Location");
      await userEvent.click(selectLocationButton);

      // Change quantity
      const quantityInput = screen.getByLabelText(/cantidad/i);
      await userEvent.clear(quantityInput);
      await userEvent.type(quantityInput, "15");

      expect(quantityInput).toHaveValue(15);
    });

    it("should show confirmation dialog before creating association", async () => {
      render(<AssociationPanel {...mockProps} />);

      const triggerButton = screen.getByRole("button", { name: /gestionar asociaciones/i });
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId("location-picker")).toBeInTheDocument();
      });

      // Select location
      const selectLocationButton = screen.getByText("Select Test Location");
      await userEvent.click(selectLocationButton);

      // Click assign button
      const assignButton = screen.getByRole("button", { name: /asignar/i });
      await userEvent.click(assignButton);

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/confirmar asociación/i)).toBeInTheDocument();
        expect(screen.getByText(/test location/i)).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument(); // quantity
      });
    });

    it("should create association when confirmed", async () => {
      const { showSuccess } = require("@/components/notifications/notification-provider").useNotifications();

      // Mock successful creation
      (fetch as jest.Mock)
        .mockResolvedValueOnce({ // Initial load
          ok: true,
          json: () => Promise.resolve({ success: true, data: [] }),
        })
        .mockResolvedValueOnce({ // Creation
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { id: "new-assoc", cantidad: 1 },
            message: "Asignación creada exitosamente",
          }),
        });

      render(<AssociationPanel {...mockProps} />);

      const triggerButton = screen.getByRole("button", { name: /gestionar asociaciones/i });
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId("location-picker")).toBeInTheDocument();
      });

      // Select location
      const selectLocationButton = screen.getByText("Select Test Location");
      await userEvent.click(selectLocationButton);

      // Click assign button
      const assignButton = screen.getByRole("button", { name: /asignar/i });
      await userEvent.click(assignButton);

      // Confirm in dialog
      const confirmButton = screen.getByRole("button", { name: /confirmar/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(showSuccess).toHaveBeenCalledWith("Asignación creada exitosamente", "Éxito");
      });

      // Check API call
      expect(fetch).toHaveBeenCalledWith(
        `/api/${mockProps.itemType}s/${mockProps.itemId}/ubicaciones`,
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("test-location"),
        })
      );
    });

    it("should show error when association creation fails", async () => {
      const { showError } = require("@/components/notifications/notification-provider").useNotifications();

      (fetch as jest.Mock)
        .mockResolvedValueOnce({ // Initial load
          ok: true,
          json: () => Promise.resolve({ success: true, data: [] }),
        })
        .mockResolvedValueOnce({ // Creation failed
          ok: false,
          json: () => Promise.resolve({
            success: false,
            error: "Validation failed",
          }),
        });

      render(<AssociationPanel {...mockProps} />);

      const triggerButton = screen.getByRole("button", { name: /gestionar asociaciones/i });
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId("location-picker")).toBeInTheDocument();
      });

      // Select location and assign
      const selectLocationButton = screen.getByText("Select Test Location");
      await userEvent.click(selectLocationButton);

      const assignButton = screen.getByRole("button", { name: /asignar/i });
      await userEvent.click(assignButton);

      const confirmButton = screen.getByRole("button", { name: /confirmar/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(showError).toHaveBeenCalledWith("Validation failed", "Error al crear asociación");
      });
    });
  });

  describe("Association Management", () => {
    const mockAssociation = {
      id: "assoc-1",
      cantidad: 10,
      armario: {
        id: "arm-1",
        nombre: "Armario Principal",
        codigo: "ARM-001",
      },
    };

    beforeEach(() => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: [mockAssociation],
        }),
      });
    });

    it("should allow updating association quantity", async () => {
      const { showSuccess } = require("@/components/notifications/notification-provider").useNotifications();

      (fetch as jest.Mock)
        .mockResolvedValueOnce({ // Initial load
          ok: true,
          json: () => Promise.resolve({ success: true, data: [mockAssociation] }),
        })
        .mockResolvedValueOnce({ // Update
          ok: true,
          json: () => Promise.resolve({
            success: true,
            message: "Cantidad actualizada exitosamente",
          }),
        });

      render(<AssociationPanel {...mockProps} />);

      const triggerButton = screen.getByRole("button", { name: /gestionar asociaciones/i });
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByText("Armario Principal")).toBeInTheDocument();
      });

      // Click edit button
      const editButton = screen.getByRole("button", { name: /editar/i });
      await userEvent.click(editButton);

      // Change quantity
      const quantityInput = screen.getByDisplayValue("10");
      await userEvent.clear(quantityInput);
      await userEvent.type(quantityInput, "20");

      // Save changes
      const saveButton = screen.getByRole("button", { name: /guardar/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(showSuccess).toHaveBeenCalledWith("Cantidad actualizada exitosamente", "Éxito");
      });
    });

    it("should allow deleting associations", async () => {
      const { showSuccess } = require("@/components/notifications/notification-provider").useNotifications();

      (fetch as jest.Mock)
        .mockResolvedValueOnce({ // Initial load
          ok: true,
          json: () => Promise.resolve({ success: true, data: [mockAssociation] }),
        })
        .mockResolvedValueOnce({ // Deletion
          ok: true,
          json: () => Promise.resolve({
            success: true,
            message: "Asociación eliminada exitosamente",
          }),
        });

      render(<AssociationPanel {...mockProps} />);

      const triggerButton = screen.getByRole("button", { name: /gestionar asociaciones/i });
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByText("Armario Principal")).toBeInTheDocument();
      });

      // Click delete button
      const deleteButton = screen.getByRole("button", { name: /eliminar/i });
      await userEvent.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByRole("button", { name: /confirmar/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(showSuccess).toHaveBeenCalledWith("Asociación eliminada exitosamente", "Éxito");
      });
    });
  });

  describe("Component Types", () => {
    it("should work with componentes", async () => {
      const componenteProps = {
        ...mockProps,
        itemType: "componente" as const,
        itemId: "comp-1",
        itemName: "Resistencia SMD",
        itemCode: "COMP-001",
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      });

      render(<AssociationPanel {...componenteProps} />);

      const triggerButton = screen.getByRole("button", { name: /gestionar asociaciones/i });
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Resistencia SMD")).toBeInTheDocument();
        expect(screen.getByDisplayValue("COMP-001")).toBeInTheDocument();
      });

      // Verify correct API endpoint is called
      expect(fetch).toHaveBeenCalledWith(`/api/${componenteProps.itemType}s/${componenteProps.itemId}/ubicaciones`);
    });
  });

  describe("Callback Handling", () => {
    it("should call onAssociationUpdate when association is created", async () => {
      const onAssociationUpdate = jest.fn();

      (fetch as jest.Mock)
        .mockResolvedValueOnce({ // Initial load
          ok: true,
          json: () => Promise.resolve({ success: true, data: [] }),
        })
        .mockResolvedValueOnce({ // Creation
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      render(
        <AssociationPanel
          {...mockProps}
          onAssociationUpdate={onAssociationUpdate}
        />
      );

      const triggerButton = screen.getByRole("button", { name: /gestionar asociaciones/i });
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId("location-picker")).toBeInTheDocument();
      });

      // Select location and assign
      const selectLocationButton = screen.getByText("Select Test Location");
      await userEvent.click(selectLocationButton);

      const assignButton = screen.getByRole("button", { name: /asignar/i });
      await userEvent.click(assignButton);

      const confirmButton = screen.getByRole("button", { name: /confirmar/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(onAssociationUpdate).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Input Validation", () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      });
    });

    it("should not allow quantity less than 1", async () => {
      render(<AssociationPanel {...mockProps} />);

      const triggerButton = screen.getByRole("button", { name: /gestionar asociaciones/i });
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId("location-picker")).toBeInTheDocument();
      });

      // Select location
      const selectLocationButton = screen.getByText("Select Test Location");
      await userEvent.click(selectLocationButton);

      // Try to set quantity to 0
      const quantityInput = screen.getByLabelText(/cantidad/i);
      await userEvent.clear(quantityInput);
      await userEvent.type(quantityInput, "0");

      // Should not be able to assign
      const assignButton = screen.getByRole("button", { name: /asignar/i });
      expect(assignButton).toBeDisabled();
    });

    it("should require location selection before assigning", async () => {
      render(<AssociationPanel {...mockProps} />);

      const triggerButton = screen.getByRole("button", { name: /gestionar asociaciones/i });
      await userEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId("location-picker")).toBeInTheDocument();
      });

      // Don't select location
      const assignButton = screen.getByRole("button", { name: /asignar/i });
      expect(assignButton).toBeDisabled();
    });
  });
});