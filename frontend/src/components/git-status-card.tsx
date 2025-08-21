import { isBranchMetadata, type GitStatus } from "@/client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatGitRevision } from "@/types/nodes";
import { OctagonAlert } from "lucide-react";

interface GitStatusCardProps {
  status: GitStatus;
  footer?: (status: GitStatus) => React.ReactNode;
}

export function GitStatusCard({ status, footer }: GitStatusCardProps) {
  const { revision } = status;
  const isDetached = !isBranchMetadata(revision);

  return (
    <Card className="w-80 gap-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Git Status</CardTitle>
        <Badge variant="default">
          {isDetached ? (
            <span className="flex items-center gap-1">
              <OctagonAlert className="h-4 w-4" />
              Detached HEAD
            </span>
          ) : (
            "On Branch"
          )}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <div>
          <div className="max-w-full truncate overflow-hidden font-mono font-medium whitespace-nowrap">
            {formatGitRevision(revision)}
          </div>
        </div>
        <div className="text-muted-foreground">{revision.summary}</div>
      </CardContent>
      {footer && (
        <CardFooter className="flex gap-2">{footer(status)}</CardFooter>
      )}
    </Card>
  );
}
