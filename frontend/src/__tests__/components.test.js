import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Badge from "../components/common/Badge";
import Avatar from "../components/common/Avatar";
import EmptyState from "../components/common/EmptyState";
import StatCard from "../components/common/StatCard";
import SkeletonCard from "../components/common/SkeletonCard";
import Modal from "../components/common/Modal";
import Logo from "../components/common/Logo";
import { FiHeart } from "react-icons/fi";

describe("UI Components Suite", () => {
  test("Logo renders correctly", () => {
    render(<Logo />);
    expect(screen.getByText("Med")).toBeInTheDocument();
    expect(screen.getByText("iq")).toBeInTheDocument();
  });

  test("Badge renders variant and text", () => {
    render(<Badge variant="success">Completed</Badge>);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  test("Avatar displays initials fallback when image missing", () => {
    render(<Avatar name="Sarah Jenkins" size="md" />);
    expect(screen.getByText("SJ")).toBeInTheDocument();
  });

  test("EmptyState renders title and description", () => {
    render(<EmptyState title="No Records" description="You have no medical records uploaded." />);
    expect(screen.getByText("No Records")).toBeInTheDocument();
    expect(screen.getByText("You have no medical records uploaded.")).toBeInTheDocument();
  });

  test("StatCard renders label, value and icon", () => {
    render(<StatCard label="Total Patients" value="1,240" icon={FiHeart} change="+12%" />);
    expect(screen.getByText("Total Patients")).toBeInTheDocument();
    expect(screen.getByText("1,240")).toBeInTheDocument();
    expect(screen.getByText("+12%")).toBeInTheDocument();
  });

  test("SkeletonCard renders pulse placeholder", () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test("Modal opens, displays content, and triggers onClose on close button click", () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal Content</p>
      </Modal>
    );

    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal Content")).toBeInTheDocument();

    const closeBtn = screen.getByLabelText("Close dialog");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
