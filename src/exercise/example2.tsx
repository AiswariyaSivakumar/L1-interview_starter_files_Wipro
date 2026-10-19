/**
 * ============================================================================
 * Exercise 2 - useDeploymentFilters
 * ============================================================================
 *
 * Scenario
 * --------
 *
 * The Release Engineering team would like to make the Deployment Queue easier
 * to navigate as the number of deployments continues to grow.
 *
 * Your task is to implement a reusable custom hook that manages searching
 * and filtering deployment data.
 *
 * ============================================================================
 *
 * Create a custom hook named:
 *
 *      useDeploymentFilters
 *
 * ============================================================================
 *
 * The hook should accept an array of deployments.
 *
 * Example
 *
 * const {
 *   search,
 *   setSearch,
 *   filteredDeployments
 * } = useDeploymentFilters(deployments);
 *
 * ============================================================================
 *
 * Functional Requirements
 *
 * The hook should:
 *
 * ✓ Maintain the search text
 *
 * ✓ Return a filtered list of deployments
 *
 * ✓ Filter by Application Name
 *
 * ✓ Filtering should be case-insensitive
 *
 * ============================================================================
 *
 * Technical Expectations
 *
 * • Use React Hooks
 *
 * • Use TypeScript
 *
 * • Keep the hook reusable
 *
 * • Prefer performant solutions where appropriate
 *
 * ============================================================================
 */

import { useState, useMemo } from "react";
import { data as mockDeployments } from "@/data/MOCK_DATA";
import DeploymentCard, { type Deployment, type DeploymentStatus } from "./example1";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type StatusFilter = "All" | DeploymentStatus;

export interface UseDeploymentFiltersOptions {
  initialSearch?: string;
  initialStatus?: StatusFilter;
}

export interface UseDeploymentFiltersReturn<T> {
  search: string;
  setSearch: (search: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (status: StatusFilter) => void;
  filteredDeployments: T[];
  totalCount: number;
  filteredCount: number;
}

export function useDeploymentFilters<T extends { application: string; status?: string }>(
  deployments: T[],
  options?: UseDeploymentFiltersOptions
): UseDeploymentFiltersReturn<T> {
  const [search, setSearch] = useState(options?.initialSearch ?? "");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(options?.initialStatus ?? "All");

  const filteredDeployments = useMemo(() => {
    if (!Array.isArray(deployments)) return [];

    const query = search.trim().toLowerCase();

    return deployments.filter((item) => {
      const matchesSearch =
        query === "" || (item.application && item.application.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || !item.status || item.status === statusFilter;

      return Boolean(matchesSearch && matchesStatus);
    });
  }, [deployments, search, statusFilter]);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredDeployments,
    totalCount: Array.isArray(deployments) ? deployments.length : 0,
    filteredCount: filteredDeployments.length,
  };
}

const SearchPlaceholder = () => {
  const deployments = mockDeployments as Deployment[];
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredDeployments,
  } = useDeploymentFilters(deployments);

  const statuses: StatusFilter[] = ["All", "Pending", "In Progress", "Completed"];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Search & Filter Deployments</h2>
          <p className="text-sm text-muted-foreground">
            Demonstrating the <code className="font-mono font-semibold text-primary">useDeploymentFilters</code> hook
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:max-w-md">
            <Input
              type="text"
              placeholder="Search by application name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {statuses.map((status) => {
              const isSelected = statusFilter === status;
              return (
                <Button
                  key={status}
                  type="button"
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  className="rounded-full text-xs cursor-pointer"
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="text-xs text-muted-foreground font-medium">
          Showing {filteredDeployments.length} of {deployments.length} deployments
        </div>
      </div>

      {filteredDeployments.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-foreground">No Deployments Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search terms or status filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeployments.map((deployment) => (
            <DeploymentCard key={deployment.id} deployment={deployment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPlaceholder;
