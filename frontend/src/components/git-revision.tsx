import { isCommitMetadata, isTagMetadata, type GitMetadata } from "@/client";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { formatGitRevision, PinnedState } from "@/types/nodes";
import type { AppState } from "@/types/state";
import {
  ArrowDownToLine,
  GitBranch,
  GitCommitVertical,
  Pin,
  Tag,
} from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";
import { ActionButton, CopyButton } from "./action-button";

const selector = (s: AppState) => ({
  addPinnedNode: s.addPinnedNode,
  checkoutGitRevision: s.checkoutGitRevision,
  clearPinnedNodes: s.clearPinnedNodes,
  pinnedNodes: s.pinnedNodes,
});

interface GitRevisionIconProps {
  revision: GitMetadata;
  size?: number;
}
export const GitRevisionIcon = ({
  revision,
  size,
}: GitRevisionIconProps): React.JSX.Element => {
  if (isTagMetadata(revision)) {
    return <Tag size={size} />;
  } else if (isCommitMetadata(revision)) {
    return <GitCommitVertical size={size} />;
  }

  return <GitBranch size={size} />;
};

/**
 * @interface GitRevisionProps
 * @description Props for the GitRevisionProps component.
 * @property {GitMetadata} revision - The text string to be copied to the clipboard.
 * @property {string} nodeId - The ID of the associated node
 */
interface GitRevisionProps {
  revision: GitMetadata;
  nodeId: string;
}
export const GitRevision = ({ revision, nodeId }: GitRevisionProps) => {
  const { addPinnedNode, checkoutGitRevision, clearPinnedNodes, pinnedNodes } =
    useStore(useShallow(selector));
  const [pinnedState, setPinnedState] = React.useState<PinnedState>(
    PinnedState.NotPinned,
  );

  const formattedRev = React.useMemo(() => {
    return formatGitRevision(revision);
  }, [revision]);

  React.useEffect(() => {
    const isNodePinnedInSlotA = pinnedNodes[0]?.id === nodeId;
    const isNodePinnedInSlotB = pinnedNodes[1]?.id === nodeId;

    if (isNodePinnedInSlotA) {
      setPinnedState(PinnedState.PinnedA);
    } else if (isNodePinnedInSlotB) {
      setPinnedState(PinnedState.PinnedB);
    } else {
      setPinnedState(PinnedState.NotPinned);
    }
  }, [pinnedNodes, nodeId]);

  const handlePinClick = () => {
    const result = addPinnedNode({ id: nodeId, git: revision });
    setPinnedState(result);
    return true;
  };

  const handleUnpinClick = () => {
    clearPinnedNodes(pinnedState);
    setPinnedState(PinnedState.NotPinned);
    return true;
  };

  const renderPinButton = () => {
    if (pinnedState === PinnedState.NotPinned) {
      return (
        <ActionButton
          tooltipContent="Pin revision"
          icon={<Pin />}
          onClick={handlePinClick}
          className="size-6"
        />
      );
    }

    return (
      <ActionButton
        tooltipContent="Unpin revision"
        onClick={handleUnpinClick}
        className="size-6 text-sm font-bold"
        icon={pinnedState}
      ></ActionButton>
    );
  };

  return (
    <div className={cn("text-muted-foreground flex flex-1 items-center")}>
      <GitRevisionIcon revision={revision} size={16} />
      <span className="flex-1 truncate px-3 align-middle font-mono">
        {formattedRev}
      </span>
      {renderPinButton()}
      <CopyButton value={formattedRev} />
      <ActionButton
        tooltipContent="Checkout revision"
        icon={<ArrowDownToLine />}
        onClick={async () => {
          await checkoutGitRevision(formattedRev);
        }}
        className="size-6"
      />
    </div>
  );
};
