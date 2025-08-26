import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStore, useUiStore } from "@/store";
import { formatGitRevision } from "@/types/nodes";
import type { AppState, UiState } from "@/types/state";
import { Panel } from "@xyflow/react";
import { RotateCcw } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { GitStatusCard } from "./git-status-card";

const selector = (state: AppState) => ({
  pinnedNodes: state.pinnedNodes,
  clearPinnedNodes: state.clearPinnedNodes,
  gitStatus: state.gitStatus,
  prevGitStatus: state.prevGitStatus,
  restoreGitStatus: state.restoreGitStatus,
  hasRevisions: state.pinnedNodes[0] !== null,
  displayPanel: state.pinnedNodes[0] !== null || state.gitStatus != null,
});

const uiSelector = (s: UiState) => ({
  setIsGitDialogOpen: s.setIsGitDialogOpen,
});

export const GitRevisionsPanel = () => {
  const {
    pinnedNodes,
    clearPinnedNodes,
    gitStatus,
    prevGitStatus,
    restoreGitStatus,
    hasRevisions,
    displayPanel,
  } = useStore(useShallow(selector));

  const { setIsGitDialogOpen } = useUiStore(useShallow(uiSelector));

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
