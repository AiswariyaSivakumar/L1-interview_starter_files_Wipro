/**
 * ============================================================================
 * Exercise 1 - Deployment Card
 * ============================================================================
 */

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type DeploymentEnvironment = "Production" | "QA" | "Development" | "Staging";
export type DeploymentStatus = "Pending" | "In Progress" | "Completed";
export type DeploymentPriority = "Low" | "Medium" | "High" | "Critical";

export interface Deployment {
  id: string;
  application: string;
  version: string;
  environment: DeploymentEnvironment;
  status: DeploymentStatus;
  requestedBy: string;
  requestedAt: string;
  scheduledAt: string;
  region: string;
  priority: DeploymentPriority;
}

export interface DeploymentCardProps {
  deployment: Deployment;
  onAdvance?: (deployment: Deployment) => void;
  onStatusChange?: (id: string, newStatus: DeploymentStatus) => void;
}

const priorityBorderClasses: Record<DeploymentPriority, string> = {
  Critical: "border-l-4 border-l-[#EF4444]",
  High: "border-l-4 border-l-[#F59E0B]",
  Medium: "border-l-4 border-l-[#3B82F6]",
  Low: "border-l-4 border-l-[#9CA3AF]",
};

const statusBadgeClasses: Record<DeploymentStatus, string> = {
  Pending: "bg-amber-50 text-amber-600 border-amber-200",
  "In Progress": "bg-blue-50 text-blue-600 border-blue-200",
  Completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

function formatScheduledDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

const DeploymentCard = ({
  deployment,
  onAdvance,
  onStatusChange,
}: DeploymentCardProps) => {
  const [internalStatus, setInternalStatus] = useState<DeploymentStatus>(deployment.status);

  const currentStatus = onStatusChange || onAdvance ? deployment.status : internalStatus;

  const getNextStatus = (status: DeploymentStatus): DeploymentStatus | null => {
    switch (status) {
      case "Pending":
        return "In Progress";
      case "In Progress":
        return "Completed";
      case "Completed":
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(currentStatus);

  const handleAdvance = () => {
    if (!nextStatus) return;

    if (!onStatusChange && !onAdvance) {
      setInternalStatus(nextStatus);
    }

    if (onStatusChange) {
      onStatusChange(deployment.id, nextStatus);
    }

    if (onAdvance) {
      onAdvance({
        ...deployment,
        status: nextStatus,
      });
    }
  };

  const getButtonLabel = (status: DeploymentStatus) => {
    switch (status) {
      case "Pending":
        return "Advance to In Progress";
      case "In Progress":
        return "Advance to Completed";
      case "Completed":
        return "✓ Completed";
    }
  };

  return (
    <Card
      data-testid={`deployment-card-${deployment.id}`}
      className={cn(
        "flex flex-col justify-between rounded-xl bg-white shadow-xs border border-gray-200/80 transition-shadow hover:shadow-md",
        priorityBorderClasses[deployment.priority]
      )}
    >
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-gray-900 leading-tight">
              {deployment.application}
            </CardTitle>
            <CardDescription className="text-xs text-gray-400 mt-0.5 font-medium">
              {deployment.version}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border-gray-200 text-gray-600 bg-white"
          >
            {deployment.environment}
          </Badge>
        </div>

        <div className="mt-3">
          <div className="text-[11px] text-gray-400 font-medium">Deployment ID</div>
          <div className="text-xs font-bold text-gray-900 mt-0.5">{deployment.id}</div>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs">
          <Badge
            variant="outline"
            className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full border", statusBadgeClasses[currentStatus])}
          >
            {currentStatus}
          </Badge>
          <div className="text-xs">
            <span className="text-gray-400 font-medium">Priority </span>
            <span className="font-bold text-gray-900">{deployment.priority}</span>
          </div>
        </div>
      </CardHeader>

      <Separator className="my-1 bg-gray-100" />

      <CardContent className="p-5 py-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">
              Requested By
            </span>
            <span className="font-medium text-gray-900 text-xs">
              {deployment.requestedBy}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">
              Scheduled
            </span>
            <span className="font-medium text-gray-900 text-xs">
              {formatScheduledDate(deployment.scheduledAt)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">
              Region
            </span>
            <span className="font-medium text-gray-900 text-xs">
              {deployment.region}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">
              Environment
            </span>
            <span className="font-medium text-gray-900 text-xs">
              {deployment.environment}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button
          type="button"
          className={cn(
            "w-full text-xs font-semibold py-2.5 rounded-lg transition-colors cursor-pointer",
            currentStatus === "Completed"
              ? "bg-[#9CA3AF] text-white hover:bg-[#9CA3AF] cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
          )}
          disabled={currentStatus === "Completed"}
          onClick={handleAdvance}
        >
          {getButtonLabel(currentStatus)}
        </Button>
      </CardFooter>
    </Card>
  );
};

export { DeploymentCard };
export default DeploymentCard;