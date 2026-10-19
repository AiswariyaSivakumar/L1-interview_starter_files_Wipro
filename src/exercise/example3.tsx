/**
 * ============================================================================
 * Exercise 3 - Deployment Queue
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDeployments } from "@/api/diploymentApi";
import DeploymentCard, { type Deployment, type DeploymentStatus } from "./example1";
import { useDeploymentFilters, type StatusFilter } from "./example2";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Example3() {
  const {
    data: fetchedData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["deployments"],
    queryFn: getDeployments,
  });

  const [deployments, setDeployments] = useState<Deployment[]>([]);

  useEffect(() => {
    if (fetchedData) {
      setDeployments(fetchedData as Deployment[]);
    }
  }, [fetchedData]);

  const handleStatusChange = (id: string, newStatus: DeploymentStatus) => {
    setDeployments((prev) =>
      prev.map((dep) => (dep.id === id ? { ...dep, status: newStatus } : dep))
    );
  };

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredDeployments,
  } = useDeploymentFilters(deployments);

  const filterTabs: StatusFilter[] = ["All", "Pending", "In Progress", "Completed"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E2E7EF] p-6 md:p-8" data-testid="loading-state">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-32 rounded-2xl bg-[#121A2E] animate-pulse" />
          <div className="h-32 rounded-xl bg-white border border-gray-200 animate-pulse" />
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-500">
              Loading deployments...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#E2E7EF] p-6 md:p-8" data-testid="error-state">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center space-y-4">
            <h3 className="text-lg font-bold text-red-700">Failed to Load Deployments</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              {error instanceof Error ? error.message : "An unexpected error occurred while fetching the deployment queue."}
            </p>
            <Button
              variant="default"
              onClick={() => refetch()}
              className="bg-[#171717] text-white hover:bg-[#262626] cursor-pointer"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E2E7EF] p-6 md:p-8 font-sans" data-testid="deployment-portal">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="rounded-2xl bg-[#121A2E] p-6 md:p-8 text-white shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <span className="text-2xl">🚀</span> Deployment Queue
            </h1>
            <p className="text-slate-300 text-sm font-normal">
              Monitor deployment requests across environments.
            </p>
          </div>

          <div className="bg-[#0b101d]/60 border border-white/10 rounded-xl px-6 py-3 text-right min-w-[150px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              ACTIVE DEPLOYMENTS
            </span>
            <span
              data-testid="active-deployments-count"
              className="text-3xl font-extrabold text-white leading-tight mt-0.5 block"
            >
              {filteredDeployments.length}
            </span>
          </div>
        </div>

        {/* Search & Filters Container */}
        <div className="bg-white rounded-xl p-6 border border-gray-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">
            Search & Filters
          </h2>

          <div>
            <Input
              type="text"
              placeholder="Search by application name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border-gray-200 h-10 px-3.5 text-sm placeholder:text-gray-400"
              data-testid="search-input"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            {filterTabs.map((tab) => {
              const isSelected = statusFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                    isSelected
                      ? "bg-[#171717] text-white border-[#171717]"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                  data-testid={`filter-${tab.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Deployments Grid or Empty State */}
        {filteredDeployments.length === 0 ? (
          <div
            data-testid="empty-state"
            className="rounded-2xl border border-gray-200/80 bg-white p-12 text-center shadow-xs space-y-3"
          >
            <h3 className="text-lg font-bold text-gray-900">No Deployments Found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Try changing your search keyword or selecting a different status.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
              }}
              className="mt-2 cursor-pointer border-gray-200"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div
            data-testid="deployments-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredDeployments.map((deployment) => (
              <DeploymentCard
                key={deployment.id}
                deployment={deployment}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}