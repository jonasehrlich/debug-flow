import {
  fetchCommitForRevision,
  getGitMetaDataSchema,
  isBranchMetadata,
  isCommitMetadata,
  type GitMetadata,
} from "@/client";
import type { Node } from "@xyflow/react";
import { z } from "zod";

/**
 * Format the revision of a {@link GitMetadata} object. If it is a tag, the {@link GitMetadata.rev}
 * is returned, otherwise the first 7 characters are returned
 * @param git - Git metadata to format
 * @returns Git revision
 */
export const formatGitRevision = (git: GitMetadata) => {
  if (isCommitMetadata(git)) {
    return git.rev.slice(0, 7);
  }
  return git.rev;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ActionNodeData = {
  title: string;
  description: string;
  git: GitMetadata | null;
};

export type ActionNode = Node<ActionNodeData, "actionNode">;

export type StatusNodeState = "unknown" | "fail" | "progress" | "success";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type StatusNodeData = {
  title: string;
  state: StatusNodeState;
  description: string;
  git: GitMetadata | null;
  /// If set to true, the node does not get a target handle, and is not deletable
  isRootNode: boolean;
};

export type AppNodeType = "actionNode" | "statusNode";
export type StatusNode = Node<StatusNodeData, "statusNode">;
export type AppNodeData = StatusNodeData | ActionNodeData;
export type AppNode = StatusNode | ActionNode;

interface PendingNodeData<NodeType extends string> {
  // Position included in the event where the edge was dropped
  eventScreenPosition: Node["position"];
  // Node type to create
  type: NodeType;
  // Node the dropped edge is connected to
  fromNodeId?: string;
  // Default revision to display during creation
  defaultRev: GitMetadata | null;
}

export type PendingAppNodeData =
  | PendingNodeData<"actionNode">
  | PendingNodeData<"statusNode">;

interface EditNodeData<
  NodeType extends string,
  NodeDataType extends Record<string, unknown>,
> {
  id: string;
  type: NodeType;
  data: NodeDataType;
}

export type EditAppNodeData =
  | EditNodeData<"actionNode", ActionNodeData>
  | EditNodeData<"statusNode", StatusNodeData>;

export enum PinnedState {
  PinnedA = "PinnedA",
  PinnedB = "PinnedB",
  NotPinned = "NotPinned",
}

export interface PinnedNodeData {
  id: string;
  git: GitMetadata;
}

export function isStatusNode(node: Node): node is StatusNode {
  return node.type == "statusNode";
}

export function isActionNode(node: Node): node is ActionNode {
  return node.type == "actionNode";
}

export function isAppNode(node: Node | null): node is AppNode {
  return !!node && (isStatusNode(node) || isActionNode(node));
}

const commonNodeDataFields = {
  title: z.string().min(2),
  description: z.string(),
  git: getGitMetaDataSchema().nullable(),
};

export const AppNodeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("actionNode"),
    data: z.object({
      ...commonNodeDataFields,
    }),
  }),
  z.object({
    type: z.literal("statusNode"),
    data: z.object({
      ...commonNodeDataFields,
      state: z.enum(["unknown", "progress", "fail", "success"]),
    }),
  }),
]);

export async function getMatchingMetaData(
  metadata: GitMetadata | null,
  nodeType: AppNodeType,
): Promise<GitMetadata | null> {
  if (!metadata) {
    return null;
  }
  let clonedMetadata = { ...metadata };

  if (isBranchMetadata(clonedMetadata)) {
    const refetchedHead = await fetchCommitForRevision(clonedMetadata.rev);
    clonedMetadata.summary = refetchedHead.summary;
    // Status nodes should only have Tags or Commits as git metadata
    clonedMetadata = nodeType === "statusNode" ? refetchedHead : clonedMetadata;
  }
  return clonedMetadata;
}
