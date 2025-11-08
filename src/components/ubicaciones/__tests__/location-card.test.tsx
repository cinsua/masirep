import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LocationCard } from "../location-card";

describe("LocationCard", () => {
  const defaultProps = {
    id: "1",
    codigo: "ACERIA",
    nombre: "Área de Acería",
    descripcion: "Ubicación principal de acero",
    isActive: true,
    armariosCount: 2,
    estanteriasCount: 3,
  };

  it("renders location information correctly", () => {
    render(<LocationCard {...defaultProps} />);

    expect(screen.getByText("Área de Acería")).toBeInTheDocument();
    expect(screen.getByText("ACERIA")).toBeInTheDocument();
    expect(screen.getByText("Ubicación principal de acero")).toBeInTheDocument();
  });

  it("displays correct type badge", () => {
    render(<LocationCard {...defaultProps} type="ubicacion" />);
    expect(screen.getByText("ubicacion")).toBeInTheDocument();
  });

  it("displays armarios and estanterias counts", () => {
    render(<LocationCard {...defaultProps} />);

    expect(screen.getByText("2")).toBeInTheDocument(); // armarios count
    expect(screen.getByText("3")).toBeInTheDocument(); // estanterias count
  });

  it("shows 'Vacío' when no content", () => {
    const props = { ...defaultProps, armariosCount: 0, estanteriasCount: 0 };
    render(<LocationCard {...props} />);

    expect(screen.getByText("Vacío")).toBeInTheDocument();
  });

  it("shows inactive status", () => {
    const props = { ...defaultProps, isActive: false };
    render(<LocationCard {...props} />);

    expect(screen.getByText("Inactivo")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<LocationCard {...defaultProps} onClick={handleClick} />);

    const card = screen.getByRole("article");
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows actions when showActions is true", () => {
    render(
      <LocationCard
        {...defaultProps}
        showActions={true}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    // Actions should be visible (edit and delete buttons)
    expect(screen.getAllByRole("button").length).toBeGreaterThan(1);
  });

  it("calls onEdit when edit button is clicked", () => {
    const handleEdit = jest.fn();
    const handleClick = jest.fn();

    render(
      <LocationCard
        {...defaultProps}
        showActions={true}
        onEdit={handleEdit}
        onClick={handleClick}
      />
    );

    // Find and click edit button
    const editButton = screen.getAllByRole("button")[1]; // First button is the card itself
    fireEvent.click(editButton);

    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(handleClick).not.toHaveBeenCalled(); // Card click should not trigger
  });

  it("displays correct icons for different types", () => {
    const { rerender } = render(<LocationCard {...defaultProps} type="armario" />);
    expect(screen.getByText("armario")).toBeInTheDocument();

    rerender(<LocationCard {...defaultProps} type="estanteria" />);
    expect(screen.getByText("estanteria")).toBeInTheDocument();
  });

  it("handles itemCount prop correctly", () => {
    const props = { ...defaultProps, itemCount: 10 };
    render(<LocationCard {...props} />);

    expect(screen.getByText("10 unidades")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const customClass = "custom-test-class";
    const { container } = render(<LocationCard {...defaultProps} className={customClass} />);

    expect(container.querySelector(".custom-test-class")).toBeInTheDocument();
  });

  it("handles missing description gracefully", () => {
    const props = { ...defaultProps, descripcion: undefined };

    render(<LocationCard {...props} />);

    expect(screen.getByText("Área de Acería")).toBeInTheDocument();
    expect(screen.queryByText("Ubicación principal de acero")).not.toBeInTheDocument();
  });

  it("calculates total content correctly", () => {
    const props = {
      ...defaultProps,
      armariosCount: 5,
      estanteriasCount: 7,
    };
    render(<LocationCard {...props} />);

    expect(screen.getByText("12 unidades")).toBeInTheDocument();
  });
});