import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getNodeId } from "@/lib/utils";
import { useStore } from "@/store";
import { AppNodeSchema } from "@/types/nodes";
import type { AppState } from "@/types/state";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { NodeForm } from "./node-form";
import { Button } from "./ui/button";

const selector = (state: AppState) => ({
  nodes: state.nodes,
  pendingNode: state.pendingNodeData,
  setPendingNode: state.setPendingNodeData,
});

export const CreateNodeDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { pendingNode, setPendingNode, nodes } = useStore(useShallow(selector));
  const form = useForm<z.infer<typeof AppNodeSchema>>({
    resolver: zodResolver(AppNodeSchema),
  });

  useEffect(() => {
    if (pendingNode) {
      if (pendingNode.type === "statusNode") {
        form.reset({
          data: {
            title: "",
            description: "",
            state: "unknown",
            git: pendingNode.defaultRev,
          },
          type: pendingNode.type,
        });
      } else {
        form.reset({
          data: { title: "", description: "" },
          type: pendingNode.type,
        });
      }

      setIsOpen(true);
    } else {
      setIsOpen(false);
      form.reset();
    }
  }, [pendingNode, form, nodes]);

  const { addNodes, addEdges, screenToFlowPosition } = useReactFlow();

  if (pendingNode === null) {
    return null;
  }

  const submitForm = (values: z.infer<typeof AppNodeSchema>) => {
    const isRootNode = nodes.length === 0;
    const node = {
      id: getNodeId(pendingNode.type),
      type: pendingNode.type,
      position: screenToFlowPosition(pendingNode.eventScreenPosition),
      data: values.data,
      deletable: !isRootNode,
    };

    if (pendingNode.type === "statusNode") {
      node.data = {
        ...node.data,
        ...{
          isRootNode: isRootNode,
        },
      };
    }
    addNodes(node);
    if (pendingNode.fromNodeId) {
      addEdges({
        id: `edge-${crypto.randomUUID()}`,
        source: pendingNode.fromNodeId,
        target: node.id,
      });
    }
    setPendingNode(null);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          if (nodes.length === 0) {
            // If there are no nodes yet, one needs to be created first and the dialog cannot be closed yet
            return;
          }
          // When closing the dialog, set pending node data to null.
          // pendingNodeData is stored persistently (to-reopen the create node dialog if no nodes
          // are created). If the data would not be reset here, a potential reload would reopen the
          // dialog, as pendingNodeData still has a value. This avoids that a the dialog is automatically
          // opened after a reload
          setPendingNode(null);
          // At this point it is sufficient to set the pending node data to null, the useEffect in this
          // component will close it for us
        }
      }}
    >
      <DialogContent
        className="md:max-w-[700px]"
        showCloseButton={nodes.length > 0}
      >
        <DialogHeader>
          <DialogTitle>
            New{" "}
            {pendingNode.type.charAt(0).toUpperCase() +
              pendingNode.type.replace("Node", "").slice(1)}{" "}
            Node
          </DialogTitle>
          <DialogDescription>Create a new node</DialogDescription>
        </DialogHeader>
        <NodeForm
          nodeType={pendingNode.type}
          form={form}
          submitForm={submitForm}
          submitButtonText="Create"
          cancelComponent={
            nodes.length > 0 ? (
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            ) : null
          }
        />
      </DialogContent>
    </Dialog>
  );
};
