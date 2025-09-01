import { BaseHandle } from "@/components/base-handle";
import {
  BaseNode,
  NodeContent,
  NodeMarkdownSection,
  NodeSection,
} from "@/components/base-node";
import {
  NodeHeader,
  NodeHeaderActions,
  NodeHeaderIcon,
  NodeHeaderMenuAction,
  NodeHeaderTitle,
} from "@/components/node-header";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import type {
  ActionNode as ActionNodeType,
  EditAppNodeData,
  StatusNodeState,
  StatusNode as StatusNodeType,
} from "@/types/nodes";
import type { AppState } from "@/types/state";
import { Position, useReactFlow, type NodeProps } from "@xyflow/react";
import {
  ChartLine,
  EllipsisVertical,
  Pencil,
  Rocket,
  Trash,
} from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";
import { GitRevision } from "./git-revision";
import { IconSelect } from "./icon-select";
import {
  statusNodeStateClasses,
  statusNodeStateIconConfig,
} from "./state-colors-icons";
import { DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";

const AppNodeHeaderMenuAction = ({
  id,
  type,
  data,
  deletable = true,
}: EditAppNodeData & { deletable?: boolean }) => {
  const { setEditNodeData } = useStore(useShallow(selector));
  const { setNodes } = useReactFlow();

  const deleteNode = React.useCallback(() => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
  }, [id, setNodes]);

  const ref = React.useRef<HTMLButtonElement>(null);
  return (
    <NodeHeaderMenuAction
      ref={ref}
      label="App Node Menu"
      trigger={<EllipsisVertical />}
      children={
        <DropdownMenuContent>
          <DropdownMenuItem
            onSelect={() => {
              setEditNodeData({
                id: id,
                type: type,
                data: data,
              } as EditAppNodeData);
            }}
          >
            <Pencil /> Edit
          </DropdownMenuItem>
          {deletable && (
            <DropdownMenuItem onSelect={deleteNode}>
              <Trash /> Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      }
    ></NodeHeaderMenuAction>
  );
};

const selector = (s: AppState) => ({
  setEditNodeData: s.setCurrentEditNodeData,
  highlightedNodeId: s.highlightedNodeId,
});

const commonNodeClasses = "w-xs" as const;
const highlightClasses = "z-10 scale-110 ring-2 ring-blue-500";

export const ActionNode = React.memo(
  ({ id, data, selected }: NodeProps<ActionNodeType>) => {
    const { highlightedNodeId } = useStore(useShallow(selector));
    const [handleIds] = React.useState(() => {
      return { target: `target-${id}`, source: `source-${id}` };
    });

    const isHighlighted = highlightedNodeId === id;

    return (
      <BaseNode
        selected={selected}
        className={cn(commonNodeClasses, isHighlighted && highlightClasses)}
      >
        <NodeContent className="divide-y">
          <NodeHeader>
            <NodeHeaderIcon>
              <Rocket size="16" />
            </NodeHeaderIcon>
            <NodeHeaderTitle>{data.title}</NodeHeaderTitle>
            <NodeHeaderActions>
              <AppNodeHeaderMenuAction
                id={id}
                type={"actionNode"}
                data={data}
              />
            </NodeHeaderActions>
          </NodeHeader>
          <NodeMarkdownSection children={data.description} />
        </NodeContent>
        <NodeSection
          children={
            data.git ? <GitRevision revision={data.git} nodeId={id} /> : null
          }
        />
        <BaseHandle
          id={handleIds.target}
          type="target"
          position={Position.Left}
        />
        <BaseHandle
          id={handleIds.source}
          type="source"
          position={Position.Right}
        />
      </BaseNode>
    );
  },
);

ActionNode.displayName = "ActionNode";

export const StatusNode = React.memo(
  ({ id, data, selected }: NodeProps<StatusNodeType>) => {
    const { highlightedNodeId } = useStore(useShallow(selector));
    const { updateNodeData } = useReactFlow();

    const handleIds = React.useMemo(() => {
      return {
        target: `target-${id}`,
        source: `source-${id}`,
      };
    }, [id]);

    const isHighlighted = highlightedNodeId === id;

    return (
      <BaseNode
        selected={selected}
        className={cn(
          commonNodeClasses,
          statusNodeStateClasses[data.state].bg,
          statusNodeStateClasses[data.state].border,
          isHighlighted && highlightClasses,
        )}
      >
        <NodeContent
          className={cn("divide-y", statusNodeStateClasses[data.state].divide)}
        >
          <NodeHeader>
            <NodeHeaderIcon>
              <ChartLine size="16" />
            </NodeHeaderIcon>
            <NodeHeaderTitle>{data.title}</NodeHeaderTitle>
            <NodeHeaderActions>
              <IconSelect<StatusNodeState>
                selectedIcon={data.state}
                onSelectChange={(newState) => {
                  updateNodeData(id, { state: newState });
                }}
                optionsAndIcons={statusNodeStateIconConfig}
                ariaLabel="Select node state"
              />
              <AppNodeHeaderMenuAction
                id={id}
                type={"statusNode"}
                data={data}
                deletable={!data.isRootNode}
              />
            </NodeHeaderActions>
          </NodeHeader>
          <NodeMarkdownSection children={data.description} />
          <NodeSection
            children={
              data.git ? <GitRevision revision={data.git} nodeId={id} /> : null
            }
          />
        </NodeContent>
        {!data.isRootNode && (
          <BaseHandle
            id={handleIds.target}
            type="target"
            position={Position.Left}
          />
        )}
        <BaseHandle
          id={handleIds.source}
          type="source"
          position={Position.Right}
        />
      </BaseNode>
    );
  },
);

StatusNode.displayName = "StatusNode";
