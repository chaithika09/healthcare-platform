import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import { useAuthStore } from "../store/authStore";

jest.mock("../services/api", () => ({
  authAPI: {
    login: jest.fn().mockResolvedValue({ data: { data: { user: { name: "Test User", role: "patient" }, token: "abc", refreshToken: "def" } } }),
    register: jest.fn().mockResolvedValue({ data: { data: { autoVerified: true } } }),
  },
}));

describe("Authentication Flow Integration Suite", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  test("LoginPage renders email and password fields", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Sign In$/i })).toBeInTheDocument();
  });

  test("LoginPage triggers instant demo sign in on demo role click", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const doctorBtn = screen.getByRole("button", { name: /Sign in as demo doctor/i });
    fireEvent.click(doctorBtn);

    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user.role).toBe("doctor");
    });
  });

  test("RegisterPage renders full registration form and validates missing fields", async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
    const submitBtn = screen.getByRole("button", { name: /Create Account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });
  });
});
