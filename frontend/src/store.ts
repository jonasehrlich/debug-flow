import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import log from "loglevel";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  checkoutRevision,
  client,
  createFlow,
  deleteFlow,
  fetchFlows,
  fetchStatus,
  pushFlow,
} from "./client";
import { notify } from "./lib/notify";
import {
  getMatchingMetaData,
  isAppNode,
  isStatusNode,
  type AppNode,
  type AppNodeType,
} from "./types/nodes";
import { type AppState, type UiState } from "./types/state";

/**
 * Whether the state before a set of {@link NodeChange}s should be added to the
 * {@link AppState.undoStack}
 * @param changes - Array of changes passed to {@link AppState.onNodesChange}
 * @param nodes - Nodes existing before the changes are applied
 * @returns Whether the changes should be added to the undo stack
 */
const areNodeChangesNotableForUndoStack = (
  changes: NodeChange<AppNode>[],
  nodes: AppNode[],
) => {
  if (nodes.length === 0) {
    /// Don't allow undoing creation of the initial node
    return false;
  }

  return changes.some((change) => {
    return (
      change.type === "remove" ||
      change.type === "add" ||
      change.type === "replace"
    );
  });
};

/**
 * Whether the {@link NodeChange}s should set {@link AppState.hasUnsavedChanges}
 * @param changes - Array of changes passed to {@link AppState.onEdgesChange}
 * @returns Whether the {@link NodeChange}s should set {@link AppState.hasUnsavedChanges}
 */
const areNodeChangesNotableForHasUnsavedChanges = (
  changes: NodeChange<AppNode>[],
) => {
  return changes.some((change) => {
    return (
      change.type === "remove" ||
      change.type === "add" ||
      change.type === "replace" ||
      change.type === "position"
    );
  });
};

/**
 * Whether the state before a state before a set of {@link EdgeChange}ss should be added
 * to the {@link AppState.undoStack} and should set {@link AppState.hasUnsavedChanges}
 * @param changes - Array of changes passed to {@link AppState.onEdgesChange}
 * @param nodes - Nodes existing before the changes are applied
 * @returns Whether the state before a state before a set of {@link EdgeChange}ss should be added
 * to the {@link AppState.undoStack} and should set {@link AppState.hasUnsavedChanges}
 */
const areEdgeChangesNotable = (
  changes: EdgeChange<Edge>[],
  nodes: AppNode[],
) => {
  if (nodes.length === 0) {
    return false;
  }

  return changes.some((change) => {
    return change.type !== "select";
  });
};

const initialState = {
  nodes: [],
  edges: [],
  undoStack: [],
  undoInProgress: false,
  redoStack: [],
  currentFlow: null,
  flows: [],
  hasUnsavedChanges: false,
  dialogNodeData: null,
  pinnedNodes: [null, null] as [null, null],
  gitStatus: null,
  prevGitStatus: null,
};

const logger = log.getLogger("store");
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      undo() {
        const { undoStack, redoStack, nodes, edges } = get();
        if (undoStack.length === 0) return;
        const prev = undoStack[undoStack.length - 1];
        // TODO: logging
        // console.log(prev.nodes[0]);
        set({ undoInProgress: true });
        set({
          ...prev,
          hasUnsavedChanges: true,
          undoStack: undoStack.slice(0, -1),
          redoStack: [...redoStack, { nodes, edges }],
        });
        set({ undoInProgress: false });
      },
      pushToUndoStack() {
        const { nodes, edges, undoStack } = get();
        // TODO: logging
        // console.log("push to undo stack", undoStack);
        const newUndoStack = [...undoStack, { nodes, edges }];
        set({ undoStack: newUndoStack, redoStack: [] });
      },
      redo() {
        const { undoStack, redoStack, nodes, edges } = get();
        if (redoStack.length === 0) return;

        const next = redoStack[redoStack.length - 1];
        set({
          ...next,
          hasUnsavedChanges: true,
          redoStack: redoStack.slice(0, -1),
          undoStack: [...undoStack, { nodes, edges }],
        });
      },
      setPendingNodeData(nodeData) {
        if (nodeData === null) {
          set({ dialogNodeData: null });
          return;
        }
        set({ dialogNodeData: { type: "pending", data: nodeData } });
      },
      addPinnedNode(node) {
        const pinnedNodes = get().pinnedNodes;
        if (pinnedNodes[0] === null) {
          pinnedNodes[0] = node;
        } else {
          pinnedNodes[1] = node;
        }
        set({ pinnedNodes: pinnedNodes });
      },
      clearPinnedNodes() {
        set({ pinnedNodes: [null, null] });
      },
      async checkoutGitRevision(rev: string) {
        try {
          const prevGitStatus = get().prevGitStatus ?? (await fetchStatus());
          await checkoutRevision(rev);
          const gitStatus = await fetchStatus();
          set({
            prevGitStatus,
            gitStatus,
          });
        } catch (e: unknown) {
          notify.error(e);
          return;
        }

        notify.success(`Checked out revision ${rev}`);
      },
      async restoreGitStatus() {
        const rev = get().prevGitStatus?.revision.rev;
        if (!rev) {
          return;
        }

        try {
          await checkoutRevision(rev);
        } catch (e: unknown) {
          notify.error(e);
          return;
        }

        set({
          prevGitStatus: null,
          gitStatus: null,
        });

        notify.success(`Checked out revision ${rev}`);
      },
      createFlow: async (name: string) => {
        let flow;
        try {
          flow = await createFlow(name);
        } catch (e: unknown) {
          notify.error(e);
          return false;
        }

        // TODO: If current flow is set, save it first. Or maybe save every time this dialog is opened
        set({ currentFlow: flow });

        const store = get();
        store.setNodes([]);
        store.setEdges([]);
        notify.success(`Created Flow ${flow.name}`);
        return true;
      },
      deleteFlow: async (id: string) => {
        const { loadFlowsMetadata, currentFlow, closeCurrentFlow } = get();
        try {
          await deleteFlow(id);
        } catch (e: unknown) {
          notify.error(e);
          return;
        }

        if (id === currentFlow?.id) {
          closeCurrentFlow();
        }
        await loadFlowsMetadata();
      },
      loadFlowsMetadata: async () => {
        let flows;
        try {
          flows = await fetchFlows();
        } catch (e: unknown) {
          notify.error(e);
        }

        set({
          flows: flows,
        });
      },
      loadFlow: async (id: string) => {
        const { data, error } = await client.GET("/api/v1/flows/{id}", {
          params: { path: { id: id } },
        });
        if (error) {
          notify.error(`Error loading flow: ${error.message}`);
        }
        if (data) {
          // The flow has been loaded successfully, first set the metadata of the flow that is currently loaded
          set({
            currentFlow: { id: id, name: data.flow.name },
          });

          const store = get();
          store.setNodes(data.flow.reactflow.nodes as AppNode[]);
          store.setEdges(data.flow.reactflow.edges as Edge[]);
        }
      },
      saveCurrentFlow: async () => {
        const { currentFlow, hasUnsavedChanges, nodes, edges } = get();
        if (!currentFlow || !hasUnsavedChanges) {
          return;
        }

        try {
          await pushFlow(currentFlow.id, currentFlow.name, nodes, edges);
        } catch (error) {
          notify.error(error);
          return;
        }

        notify.success("Saved");
        set({ hasUnsavedChanges: false });
      },
      closeCurrentFlow: () => {
        set({
          nodes: [],
          edges: [],
          currentFlow: null,
          hasUnsavedChanges: false,
          undoStack: [],
          redoStack: [],
        });
      },
      onNodesChange: (changes) => {
        const { nodes, undoInProgress, pushToUndoStack, hasUnsavedChanges } =
          get();
        if (
          !undoInProgress &&
          areNodeChangesNotableForUndoStack(changes, nodes)
        ) {
          pushToUndoStack();
        }
        const newNodes = applyNodeChanges(changes, nodes);

        set({
          nodes: newNodes,
          hasUnsavedChanges:
            hasUnsavedChanges ||
            areNodeChangesNotableForHasUnsavedChanges(changes),
        });
      },
      onEdgesChange: (changes) => {
        const { edges, nodes, undoStack, hasUnsavedChanges } = get();
        const notableChanges = areEdgeChangesNotable(changes, nodes);
        if (notableChanges) {
          set({
            undoStack: [...undoStack, { nodes, edges }],
            redoStack: [],
          });
        }

        set({
          edges: applyEdgeChanges(changes, edges),
          hasUnsavedChanges: hasUnsavedChanges || notableChanges,
        });
      },
      onConnect: (connection) => {
        set({
          edges: addEdge(connection, get().edges),
          hasUnsavedChanges: true,
        });
      },
      onConnectEnd: (event, connectionState) => {
        const connectedToAnotherNode = connectionState.isValid;
        if (connectedToAnotherNode) {
          return;
        }

        const fromNode = connectionState.fromNode;
        if (!isAppNode(fromNode)) {
          return;
        }
        const newNodeType: AppNodeType = isStatusNode(fromNode)
          ? "actionNode"
          : "statusNode";

        const fromMetadata = fromNode.data.git;
        getMatchingMetaData(fromMetadata, newNodeType)
          .then((fromMetadata) => {
            const { clientX, clientY } =
              "changedTouches" in event ? event.changedTouches[0] : event;
            get().setPendingNodeData({
              eventScreenPosition: { x: clientX, y: clientY },
              type: newNodeType,
              fromNodeId: fromNode.id,
              defaultRev: fromMetadata,
            });
          })
          .catch((e: unknown) => {
            logger.error("Error getting matching metadata", e);
          });
      },
      setEdgeType: (newType) => {
        set((state) => ({
          edges: state.edges.map((edge) => ({
            ...edge,
            type: newType,
          })),
        }));
      },
      setNodes: (nodes) => {
        set({ nodes });
      },
      setEdges: (edges) => {
        set({ edges });
      },
      setCurrentEditNodeData: (data) => {
        if (data === null) {
          set({ dialogNodeData: null });
          return;
        }
        set({ dialogNodeData: { type: "edit", data: data } });
      },
      reset: () => {
        set({ ...initialState });
      },
    }),
    {
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        currentFlow: state.currentFlow,
        hasUnsavedChanges: state.hasUnsavedChanges,
        dialogNodeData:
          state.dialogNodeData?.type === "pending"
            ? state.dialogNodeData
            : null,
      }),
      name: "debug-flow-flow-storage",
    },
  ),
);

export const useUiStore = create<UiState>()(
  persist(
    // @ts-expect-error: Keep for now, get will be required later
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (set, get) => ({
      isMiniMapVisible: true,
      setIsMiniMapVisible: (isVisible) => {
        set({ isMiniMapVisible: isVisible });
      },
      isFlowsDialogOpen: false,
      setIsFlowsDialogOpen(isOpen) {
        set({ isFlowsDialogOpen: isOpen });
      },
      isInlineDiff: false,
      setIsInlineDiff(isInlineDiff) {
        set({ isInlineDiff: isInlineDiff });
      },
      isHelpDialogOpen: false,
      setIsHelpDialogOpen(isOpen) {
        set({ isHelpDialogOpen: isOpen });
      },
      isKeybindingsDialogOpen: false,
      setIsKeybindingsDialogOpen(isOpen) {
        set({ isKeybindingsDialogOpen: isOpen });
      },
      isGitDialogOpen: false,
      setIsGitDialogOpen(isOpen) {
        set({ isGitDialogOpen: isOpen });
      },
    }),
    {
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !["isGitDialogOpen", "setIsGitDialogOpen"].includes(key),
          ),
        ),

      name: "debug-flow-ui-storage",
    },
  ),
);
