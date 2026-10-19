import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Example3 from "./example3";
import * as api from "@/api/diploymentApi";

const sampleDeployments = [
  {
    id: "DEP-201",
    application: "Payment Service",
    version: "v1.2.0",
    environment: "Production",
    status: "Pending",
    requestedBy: "Sarah Lee",
    requestedAt: "2026-08-01T10:00:00Z",
    scheduledAt: "2026-08-02T12:00:00Z",
    region: "US-West",
    priority: "Critical",
  },
  {
    id: "DEP-202",
    application: "Admin Dashboard",
    version: "v3.0.1",
    environment: "QA",
    status: "In Progress",
    requestedBy: "Alex Chen",
    requestedAt: "2026-08-01T11:00:00Z",
    scheduledAt: "2026-08-03T14:00:00Z",
    region: "EU-Central",
    priority: "Medium",
  },
];

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("Example3 Full Integration", () => {
  it("loads and displays deployments from query", async () => {
    vi.spyOn(api, "getDeployments").mockResolvedValueOnce(sampleDeployments as any);

    renderWithClient(<Example3 />);

    expect(screen.getByTestId("loading-state")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Payment Service")).toBeInTheDocument();
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    });

    expect(screen.getByTestId("active-deployments-count")).toHaveTextContent("2");
  });

  it("filters deployments using the search box", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "getDeployments").mockResolvedValueOnce(sampleDeployments as any);

    renderWithClient(<Example3 />);

    await waitFor(() => {
      expect(screen.getByText("Payment Service")).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "Admin");

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Payment Service")).not.toBeInTheDocument();
    expect(screen.getByTestId("active-deployments-count")).toHaveTextContent("1");
  });

  it("advances a deployment status when clicking the advance button", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "getDeployments").mockResolvedValueOnce(sampleDeployments as any);

    renderWithClient(<Example3 />);

    await waitFor(() => {
      expect(screen.getByText("Payment Service")).toBeInTheDocument();
    });

    const advanceButton = screen.getByRole("button", {
      name: /advance to in progress/i,
    });
    await user.click(advanceButton);

    const completedButtons = await screen.findAllByRole("button", {
  name: /advance to completed/i,
});

expect(completedButtons).toHaveLength(2);
  });
});