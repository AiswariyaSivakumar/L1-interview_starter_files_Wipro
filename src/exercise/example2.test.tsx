import { renderHook, act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import SearchPlaceholder, { useDeploymentFilters } from "./example2";
import type { Deployment } from "./example1";

const mockDeploymentsList: Deployment[] = [
  {
    id: "DEP-101",
    application: "Customer Portal",
    version: "v1.0.0",
    environment: "Production",
    status: "Pending",
    requestedBy: "Alice",
    requestedAt: "2026-07-01T08:00:00Z",
    scheduledAt: "2026-07-02T10:00:00Z",
    region: "US-East",
    priority: "High",
  },
  {
    id: "DEP-102",
    application: "Billing Service",
    version: "v2.1.0",
    environment: "QA",
    status: "In Progress",
    requestedBy: "Bob",
    requestedAt: "2026-07-02T09:00:00Z",
    scheduledAt: "2026-07-03T11:00:00Z",
    region: "EU-West",
    priority: "Critical",
  },
  {
    id: "DEP-103",
    application: "Auth Service",
    version: "v3.0.0",
    environment: "Staging",
    status: "Completed",
    requestedBy: "Charlie",
    requestedAt: "2026-07-03T10:00:00Z",
    scheduledAt: "2026-07-04T12:00:00Z",
    region: "US-West",
    priority: "Low",
  },
  {
    id: "DEP-104",
    application: "customer database",
    version: "v0.9.0",
    environment: "Development",
    status: "Pending",
    requestedBy: "David",
    requestedAt: "2026-07-04T11:00:00Z",
    scheduledAt: "2026-07-05T13:00:00Z",
    region: "AP-South",
    priority: "Medium",
  },
];

describe("useDeploymentFilters Hook", () => {
  it("initializes with default values and returns all deployments", () => {
    const { result } = renderHook(() =>
      useDeploymentFilters(mockDeploymentsList)
    );

    expect(result.current.search).toBe("");
    expect(result.current.statusFilter).toBe("All");
    expect(result.current.filteredDeployments).toHaveLength(4);
    expect(result.current.totalCount).toBe(4);
    expect(result.current.filteredCount).toBe(4);
  });

  it("filters deployments by application name case-insensitively", () => {
    const { result } = renderHook(() =>
      useDeploymentFilters(mockDeploymentsList)
    );

    act(() => {
      result.current.setSearch("CUSTOMER");
    });

    expect(result.current.filteredDeployments).toHaveLength(2);
    expect(
      result.current.filteredDeployments.map((d) => d.id)
    ).toEqual(["DEP-101", "DEP-104"]);
    expect(result.current.filteredCount).toBe(2);
  });

  it("filters deployments by status filter", () => {
    const { result } = renderHook(() =>
      useDeploymentFilters(mockDeploymentsList)
    );

    act(() => {
      result.current.setStatusFilter("Pending");
    });

    expect(result.current.filteredDeployments).toHaveLength(2);
    expect(
      result.current.filteredDeployments.every((d) => d.status === "Pending")
    ).toBe(true);
  });

  it("combines search query and status filter correctly", () => {
    const { result } = renderHook(() =>
      useDeploymentFilters(mockDeploymentsList)
    );

    act(() => {
      result.current.setSearch("portal");
      result.current.setStatusFilter("In Progress");
    });

    expect(result.current.filteredDeployments).toHaveLength(0);

    act(() => {
      result.current.setStatusFilter("Pending");
    });

    expect(result.current.filteredDeployments).toHaveLength(1);
    expect(result.current.filteredDeployments[0].application).toBe("Customer Portal");
  });

  it("handles null/undefined/empty arrays safely", () => {
    const { result } = renderHook(() =>
      useDeploymentFilters([] as Deployment[])
    );

    expect(result.current.filteredDeployments).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.filteredCount).toBe(0);
  });
});

describe("SearchPlaceholder Component (example2.tsx UI)", () => {
  it("renders search input and filter buttons", () => {
    render(<SearchPlaceholder />);

    expect(
      screen.getByPlaceholderText(/search by application name/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pending" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "In Progress" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Completed" })).toBeInTheDocument();
  });

  it("updates search input when typed into", async () => {
    const user = userEvent.setup();
    render(<SearchPlaceholder />);

    const searchInput = screen.getByPlaceholderText(/search by application name/i);
    await user.type(searchInput, "Auth");

    expect(searchInput).toHaveValue("Auth");
  });
});