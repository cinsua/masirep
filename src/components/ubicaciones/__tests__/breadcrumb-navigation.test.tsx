import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BreadcrumbNavigation } from "../breadcrumb-navigation";

describe("BreadcrumbNavigation", () => {
  const sampleItems = [
    {
      id: "1",
      codigo: "ACERIA",
      nombre: "Área de Acería",
      type: "ubicacion" as const,
      isActive: true,
    },
    {
      id: "2",
      codigo: "ARM01",
      nombre: "Armario Principal",
      type: "armario" as const,
      isActive: true,
    },
    {
      id: "3",
      codigo: "CAJ01",
      nombre: "Cajón Superior",
      type: "cajon" as const,
      isActive: true,
    },
  ];

  it("renders breadcrumb items correctly", () => {
    render(
      <BreadcrumbNavigation
        items={sampleItems}
        onNavigate={jest.fn()}
        showIcons={true}
        showTypes={true}
      />
    );

    expect(screen.getByText("Área de Acería")).toBeInTheDocument();
    expect(screen.getByText("Armario Principal")).toBeInTheDocument();
    expect(screen.getByText("Cajón Superior")).toBeInTheDocument();
  });

  it("shows type badges when showTypes is true", () => {
    render(
      <BreadcrumbNavigation
        items={sampleItems}
        onNavigate={jest.fn()}
        showTypes={true}
      />
    );

    expect(screen.getByText("Ubicación")).toBeInTheDocument();
    expect(screen.getByText("Armario")).toBeInTheDocument();
    expect(screen.getByText("Cajón")).toBeInTheDocument();
  });

  it("hides type badges when showTypes is false", () => {
    render(
      <BreadcrumbNavigation
        items={sampleItems}
        onNavigate={jest.fn()}
        showTypes={false}
      />
    );

    expect(screen.queryByText("Ubicación")).not.toBeInTheDocument();
    expect(screen.queryByText("Armario")).not.toBeInTheDocument();
    expect(screen.queryByText("Cajón")).not.toBeInTheDocument();
  });

  it("shows icons when showIcons is true", () => {
    render(
      <BreadcrumbNavigation
        items={sampleItems}
        onNavigate={jest.fn()}
        showIcons={true}
      />
    );

    // Icons should be present (lucide icons render as SVG elements)
    expect(document.querySelectorAll("svg").length).toBeGreaterThan(0);
  });

  it("handles item clicks correctly", () => {
    const handleNavigate = jest.fn();

    render(
      <BreadcrumbNavigation
        items={sampleItems}
        onNavigate={handleNavigate}
        showIcons={false}
        showTypes={false}
      />
    );

    // Click on first item (not last)
    const firstItem = screen.getByText("Área de Acería");
    fireEvent.click(firstItem);

    expect(handleNavigate).toHaveBeenCalledWith(sampleItems[0], 0);
  });

  it("disables click on last item", () => {
    const handleNavigate = jest.fn();

    render(
      <BreadcrumbNavigation
        items={sampleItems}
        onNavigate={handleNavigate}
        showIcons={false}
        showTypes={false}
      />
    );

    // Try to click on last item
    const lastItem = screen.getByText("Cajón Superior");
    fireEvent.click(lastItem);

    expect(handleNavigate).not.toHaveBeenCalled();
  });

  it("shows inactive status correctly", () => {
    const itemsWithInactive = [
      ...sampleItems.slice(0, 2),
      { ...sampleItems[2], isActive: false },
    ];

    render(
      <BreadcrumbNavigation
        items={itemsWithInactive}
        onNavigate={jest.fn()}
        showTypes={false}
      />
    );

    expect(screen.getByText("Inactivo")).toBeInTheDocument();
  });

  it("handles empty items array", () => {
    render(
      <BreadcrumbNavigation
        items={[]}
        onNavigate={jest.fn()}
        showIcons={false}
        showTypes={false}
      />
    );

    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });

  it("shows ellipsis for long breadcrumb paths", () => {
    const longItems = [
      ...sampleItems,
      {
        id: "4",
        codigo: "CAJ02",
        nombre: "Cajón Medio",
        type: "cajon" as const,
        isActive: true,
      },
      {
        id: "5",
        codigo: "CAJ03",
        nombre: "Cajón Inferior",
        type: "cajon" as const,
        isActive: true,
      },
      {
        id: "6",
        codigo: "DIV01",
        nombre: "División Izquierda",
        type: "division" as const,
        isActive: true,
      },
    ];

    render(
      <BreadcrumbNavigation
        items={longItems}
        onNavigate={jest.fn()}
        maxItems={3}
        showIcons={false}
        showTypes={false}
      />
    );

    expect(screen.getByText("...")).toBeInTheDocument();
    // Should show first item, ellipsis, and last 2 items
    expect(screen.getByText("Área de Acería")).toBeInTheDocument();
    expect(screen.getByText("División Izquierda")).toBeInTheDocument();
  });

  it("truncates long names", () => {
    const longItems = [
      {
        ...sampleItems[0],
        nombre: "Este es un nombre extremadamente largo que debería ser truncado",
      },
    ];

    render(
      <BreadcrumbNavigation
        items={longItems}
        onNavigate={jest.fn()}
        showIcons={false}
        showTypes={false}
      />
    );

    const nameElement = screen.getByText(/Este es un nombre extremadamente largo/);
    expect(nameElement).toBeInTheDocument();
    // Should have truncation class or styling
    expect(nameElement).toHaveClass("truncate");
  });

  it("applies custom className", () => {
    const customClass = "custom-breadcrumb-class";
    const { container } = render(
      <BreadcrumbNavigation
        items={sampleItems}
        onNavigate={jest.fn()}
        className={customClass}
      />
    );

    expect(container.querySelector(".custom-breadcrumb-class")).toBeInTheDocument();
  });
});