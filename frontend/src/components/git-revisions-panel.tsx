import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { GitGraph, RotateCcw, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { CopyButton } from "./action-button";
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
          {hasRevisions && (
            <Card className="w-80 gap-4">
              <CardHeader>
                <CardTitle>Git Revisions</CardTitle>
              </CardHeader>
              <CardContent className="divide-y text-sm">
                {pinnedNodes.map(
                  (node, index) =>
                    node && (
                      <div key={index} className="flex justify-between py-2">
                        <span className="block max-w-full overflow-hidden font-mono text-ellipsis whitespace-nowrap">
                          {formatGitRevision(node.git)}
                        </span>
                        <CopyButton value={node.git.rev} tooltip={false} />
                      </div>
                    ),
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  onClick={() => {
                    clearPinnedNodes();
                  }}
                  variant="destructive"
                >
                  <X /> Clear
                </Button>
                {pinnedNodes[1] !== null && (
                  <Button
                    onClick={() => {
                      setIsGitDialogOpen(true);
                    }}
                    variant="outline"
                  >
                    <GitGraph />
                    Show Graph
                  </Button>
                )}
              </CardFooter>
            </Card>
          )}
        </Panel>
      </TooltipProvider>
    )
  );
};
