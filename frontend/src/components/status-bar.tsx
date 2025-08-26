import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEventStream } from "@/hooks/use-event-stream";
import { cn } from "@/lib/utils";
import { useStore, useUiStore } from "@/store";
import type { RepositoryStatus } from "@/types/api-types";
import {
  formatGitRevision,
  PinnedState,
  type PinnedNodeData,
} from "@/types/nodes";
import type { AppState, UiState } from "@/types/state";
import {
  FileDiff,
  FileInput,
  FileMinus,
  FilePlus,
  GitBranch,
  GitCommitVertical,
  type LucideIcon,
} from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "./ui/button";

const StatusBarItem = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn(
        "flex h-full items-center gap-1 px-2",
        "text-sm [&>svg]:h-3 [&>svg]:w-3",
        // "[&>svg]:w-3 [&>svg]:h-3 text-xs",
        className,
      )}
      {...props}
    ></div>
  );
};

const BranchStatusBarItem = React.memo(
  ({ status }: { status: RepositoryStatus }) => {
    if (status.isDetachedHead) {
      return (
        // TODO: Allow checking out a branch on the commit
        <StatusBarItem>
          <GitCommitVertical /> {status.head.id.slice(0, 7)}
        </StatusBarItem>
      );
    }
    // TODO: Allow creating a branch/tag or switching branch

    return (
      <StatusBarItem>
        <GitBranch /> {status.currentBranch}
      </StatusBarItem>
    );
  },
);

const GitStatusFileList = ({
  paths,
  icon,
  className,
  ...props
}: {
  paths: string[];
  icon: LucideIcon;
} & React.ComponentProps<"div">) => {
  const Icon = icon;
  return (
    <>
      {paths.map((path) => {
        return (
          <div
            key={path}
            className={cn(
              "flex items-center gap-1 pl-1 font-mono text-sm",
              className,
            )}
            {...props}
          >
            <Icon size={14} className="shrink-0" /> {path}
          </div>
        );
      })}
    </>
  );
};

const ChangesStatusBarItem = React.memo(
  ({ status }: { status: RepositoryStatus }) => {
    const added =
      status.index.newFiles.length + status.worktree.newFiles.length;
    const modified =
      status.index.modifiedFiles.length + status.worktree.modifiedFiles.length;
    const renamed =
      status.index.renamedFiles.length + status.worktree.renamedFiles.length;
    const deleted =
      status.index.deletedFiles.length + status.worktree.deletedFiles.length;

    const indexChanges =
      status.index.newFiles.length +
      status.index.modifiedFiles.length +
      status.index.renamedFiles.length +
      status.index.deletedFiles.length;
    const worktreeChanges =
      status.worktree.newFiles.length +
      status.worktree.modifiedFiles.length +
      status.worktree.renamedFiles.length +
      status.worktree.deletedFiles.length;
    if (added + deleted + renamed + modified === 0) {
      return null;
    }
    return (
      <Popover>
        <PopoverTrigger asChild>
          <StatusBarItem>
            {added > 0 && (
              <>
                <FilePlus /> {added}
              </>
            )}
            {deleted > 0 && (
              <>
                <FileMinus /> {deleted}
              </>
            )}
            {renamed > 0 && (
              <>
                <FileInput />
                {renamed}
              </>
            )}
            {modified > 0 && (
              <>
                <FileDiff /> {modified}
              </>
            )}
          </StatusBarItem>
        </PopoverTrigger>
        <PopoverContent className="w-fit cursor-default space-y-1">
          {indexChanges > 0 && (
            <>
              <h4 className="font-medium">Index</h4>
              <div className="text-emerald-600">
                <GitStatusFileList
                  paths={status.index.newFiles}
                  icon={FilePlus}
                />
                <GitStatusFileList
                  paths={status.index.modifiedFiles}
                  icon={FileDiff}
                />
                <GitStatusFileList
                  paths={status.index.renamedFiles}
                  icon={FileInput}
                />
                <GitStatusFileList
                  paths={status.index.deletedFiles}
                  icon={FileMinus}
                />
              </div>
            </>
          )}
          {worktreeChanges > 0 && (
            <>
              <h4 className="font-medium">Worktree</h4>
              <div className="text-red-600">
                <GitStatusFileList
                  paths={status.worktree.newFiles}
                  icon={FilePlus}
                />
                <GitStatusFileList
                  paths={status.worktree.modifiedFiles}
                  icon={FileDiff}
                />
                <GitStatusFileList
                  paths={status.worktree.renamedFiles}
                  icon={FileInput}
                />
                <GitStatusFileList
                  paths={status.worktree.deletedFiles}
                  icon={FileMinus}
                />
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    );
  },
);

const uiSelector = (s: UiState) => ({
  setIsGitDialogOpen: s.setIsGitDialogOpen,
});

const selector = (state: AppState) => ({
  pinnedNodes: state.pinnedNodes,
  clearPinnedNodes: state.clearPinnedNodes,
  gitStatus: state.gitStatus,
  prevGitStatus: state.prevGitStatus,
  restoreGitStatus: state.restoreGitStatus,
  hasPinnedNodes: state.pinnedNodes.some((value) => value !== null),
  highlightPinnedNode: state.highlightPinnedNode,
  clearHighlightedNode: state.clearHighlightedNode,
});

const PinnedGitRev = ({
  node,
  letter,
  highlightPinnedNode,
  clearHighlightedNode,
}: {
  node: PinnedNodeData | null;
  letter: string;
  highlightPinnedNode: (nodeId: string) => void;
  clearHighlightedNode: () => void;
}) => {
  if (!node) return null;

  const handleMouseEnter = () => {
    highlightPinnedNode(node.id);
  };

  const handleMouseLeave = () => {
    clearHighlightedNode();
  };

  return (
    <div
      className="flex items-center gap-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-primary text-primary-foreground flex h-4 w-4 items-center justify-center rounded-full text-xs font-medium select-none">
        {letter}
      </div>
      <span className="max-w-48 truncate font-mono text-sm select-none">
        {formatGitRevision(node.git)}
      </span>
    </div>
  );
};

export const PinnedNodesStatusBarItem = () => {
  const {
    pinnedNodes,
    clearPinnedNodes,
    hasPinnedNodes,
    highlightPinnedNode,
    clearHighlightedNode,
  } = useStore(useShallow(selector));
  const { setIsGitDialogOpen } = useUiStore(useShallow(uiSelector));
  if (!hasPinnedNodes) {
    return null;
  }

  const [nodeA, nodeB] = pinnedNodes;

  return (
    <StatusBarItem>
      <PinnedGitRev
        node={nodeA}
        letter={PinnedState.PinnedA}
        highlightPinnedNode={highlightPinnedNode}
        clearHighlightedNode={clearHighlightedNode}
      />
      {nodeA && nodeB && <span className="text-muted-foreground">...</span>}
      <PinnedGitRev
        node={nodeB}
        letter={PinnedState.PinnedB}
        highlightPinnedNode={highlightPinnedNode}
        clearHighlightedNode={clearHighlightedNode}
      />
      <Button
        variant="destructive"
        size="sm"
        className="h-6 px-2 text-xs"
        onClick={() => {
          clearPinnedNodes();
        }}
      >
        Clear
      </Button>
      <Button
        disabled={pinnedNodes[1] === null}
        variant="secondary"
        size="sm"
        className="h-6 px-2 text-xs"
        onClick={() => {
          setIsGitDialogOpen(true);
        }}
      >
        Git Graph
      </Button>
    </StatusBarItem>
  );
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type GitStatusEventMap = {
  "git-status": RepositoryStatus; // custom event payload
};

export const StatusBar = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const { events, subscribe } = useEventStream<GitStatusEventMap>(
    "/api/v1/git/repository/status/stream",
  );

  React.useEffect(() => {
    subscribe("git-status");
  }, [subscribe]);

  if (!events["git-status"]) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-background flex h-9 cursor-default items-center divide-x divide-solid overflow-hidden rounded-md border shadow-xs",
        className,
      )}
      {...props}
    >
      <BranchStatusBarItem status={events["git-status"]} />
      <ChangesStatusBarItem status={events["git-status"]} />
      {<PinnedNodesStatusBarItem />}
    </div>
  );
};
