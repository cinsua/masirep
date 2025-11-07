import { render, screen } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";
import { SidebarLayout } from "../../layout/sidebar-layout";

// Mock NextAuth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock auth client
jest.mock("@/lib/auth-client", () => ({
  authClient: {
    signOut: jest.fn(),
  },
}));

const mockUseSession = require("next-auth/react").useSession;
const mockUsePathname = require("next/navigation").usePathname;

describe("SidebarLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUsePathname.mockReturnValue("/dashboard");
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "Carlos Rodriguez",
          email: "carlos.rodriguez@masirep.com",
          technicianId: "TEC-001",
        },
      },
      status: "authenticated",
    });
  });

  const renderWithSession = (component: React.ReactElement) => {
    return render(
      <SessionProvider session={mockUseSession().data}>
        {component}
      </SessionProvider>
    );
  };

  it("renders sidebar with navigation", () => {
    renderWithSession(<SidebarLayout>Test Content</SidebarLayout>);

    expect(screen.getByText("Masirep")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Repuestos")).toBeInTheDocument();
    expect(screen.getByText("Componentes")).toBeInTheDocument();
    expect(screen.getByText("Carlos Rodriguez")).toBeInTheDocument();
  });

  it("displays user information correctly", () => {
    renderWithSession(<SidebarLayout>Test Content</SidebarLayout>);

    expect(screen.getByText("Carlos Rodriguez")).toBeInTheDocument();
    expect(screen.getByText("TEC-001")).toBeInTheDocument();
  });

  it("shows logout button", () => {
    renderWithSession(<SidebarLayout>Test Content</SidebarLayout>);

    expect(screen.getByText("Cerrar sesión")).toBeInTheDocument();
  });

  it("renders children content", () => {
    renderWithSession(
      <SidebarLayout>
        <div>Test Page Content</div>
      </SidebarLayout>
    );

    expect(screen.getByText("Test Page Content")).toBeInTheDocument();
  });

  it("highlights active navigation item", () => {
    mockUsePathname.mockReturnValue("/repuestos");

    renderWithSession(<SidebarLayout>Test Content</SidebarLayout>);

    const repuestosLink = screen.getByText("Repuestos");
    expect(repuestosLink.closest("a")).toHaveClass("bg-primary");
  });

  it("shows mobile menu button on mobile", () => {
    // Mock mobile viewport
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    renderWithSession(<SidebarLayout>Test Content</SidebarLayout>);

    // Should show mobile menu button
    const menuButton = screen.getByRole("button", { name: /menu/i });
    expect(menuButton).toBeInTheDocument();
  });
});