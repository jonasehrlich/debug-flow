import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStore } from "@/store";
import { formatGitRevision } from "@/types/nodes";
import type { AppState } from "@/types/state";
import { Panel } from "@xyflow/react";
import { RotateCcw } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { GitStatusCard } from "./git-status-card";

const selector = (state: AppState) => ({
  gitStatus: state.gitStatus,
  prevGitStatus: state.prevGitStatus,
  restoreGitStatus: state.restoreGitStatus,
  displayPanel: state.pinnedNodes[0] !== null || state.gitStatus != null,
});

export const GitRevisionsPanel = () => {
  const { gitStatus, prevGitStatus, restoreGitStatus, displayPanel } = useStore(
    useShallow(selector),
  );

  const prevRevision = prevGitStatus
    ? formatGitRevision(prevGitStatus.revision)
    : "previous status";

  return (
    displayPanel && (
      <TooltipProvider>
        <Panel position="bottom-left" className="space-y-4">
          {gitStatus && (
            <GitStatusCard
              status={gitStatus}
              footer={() => (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => {
                        restoreGitStatus()
                          .then()
                          .catch((e: unknown) => {
                            console.warn("Failed to restore git status:", e);
                          });
                      }}
                      variant="destructive"
                      className="max-w-[150px] truncate"
                    >
                      <RotateCcw />
                      Restore
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Checkout revision {prevRevision}
                  </TooltipContent>
                </Tooltip>
              )}
            />
          )}
        </Panel>
      </TooltipProvider>
    )
  );
};
