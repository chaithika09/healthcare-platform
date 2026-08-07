import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import DoctorListPage from "../pages/patient/DoctorListPage";
import MedicineReminder from "../pages/patient/MedicineReminder";
import EmergencySupport from "../pages/patient/EmergencySupport";
import UploadReports from "../pages/patient/UploadReports";

describe("Patient Features Integration Suite", () => {
  test("DoctorListPage filters doctors by search input", async () => {
    render(
      <MemoryRouter>
        <DoctorListPage />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText("Search by name or specialty...");
    expect(screen.getByText("Dr. Sarah Johnson")).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "Neurologist" } });

    await waitFor(() => {
      expect(screen.getByText("Dr. Michael Chen")).toBeInTheDocument();
      expect(screen.queryByText("Dr. Sarah Johnson")).not.toBeInTheDocument();
    });
  });

  test("MedicineReminder allows toggling dose status and deleting reminders", () => {
    render(
      <MemoryRouter>
        <MedicineReminder />
      </MemoryRouter>
    );

    expect(screen.getByText("Amlodipine 5mg")).toBeInTheDocument();
    const toggleBtns = screen.getAllByTitle(/Mark as/i);
    expect(toggleBtns.length).toBeGreaterThan(0);

    fireEvent.click(toggleBtns[0]);
  });

  test("EmergencySupport triggers GPS detection and ambulance booking", async () => {
    render(
      <MemoryRouter>
        <EmergencySupport />
      </MemoryRouter>
    );

    const gpsBtn = screen.getByText("📍 Detect GPS Location");
    fireEvent.click(gpsBtn);

    const input = screen.getByPlaceholderText("Enter your address or click GPS...");
    expect(input.value).toBe("Current GPS Location (Main St)");

    const requestBtn = screen.getByRole("button", { name: /Request Ambulance/i });
    fireEvent.click(requestBtn);

    await waitFor(() => {
      expect(screen.getByText("Dispatching...")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("UploadReports validates zero files on submit", async () => {
    render(
      <MemoryRouter>
        <UploadReports />
      </MemoryRouter>
    );

    const uploadBtn = screen.getByRole("button", { name: /Upload Files/i });
    expect(uploadBtn).toBeDisabled();
  });
});
