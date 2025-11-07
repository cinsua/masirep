import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "../../layout/protected-route";

// Mock NextAuth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockUseSession = require("next-auth/react").useSession;
const mockRouter = { push: jest.fn() };

describe("ProtectedRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require("next/navigation").useRouter.mockReturnValue(mockRouter);
  });

  it("renders children when authenticated", () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: "Test User" } },
      status: "authenticated",
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("shows loading state when session is loading", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "loading",
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Verificando sesión")).toBeInTheDocument();
    expect(screen.getByText("Validando tu identidad...")).toBeInTheDocument();
  });

  it("shows unauthorized state when not authenticated", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Acceso requerido")).toBeInTheDocument();
    expect(screen.getByText("Redirigiendo al inicio de sesión...")).toBeInTheDocument();
  });

  it("redirects to custom URL when specified", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(
      <ProtectedRoute redirectTo="/custom-login">
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(mockRouter.push).toHaveBeenCalledWith("/custom-login");
  });
});