import { cn } from "@/lib/utils";
import { Handle, type HandleProps } from "@xyflow/react";
import React from "react";

export type BaseHandleProps = HandleProps;

export const BaseHandle = React.forwardRef<HTMLDivElement, BaseHandleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Handle
        ref={ref}
        {...props}
        className={cn(
          "h-[11px] w-[11px] rounded-full border border-slate-300 bg-slate-100 transition dark:border-secondary dark:bg-secondary",
          className,
        )}
        {...props}
      >
        {children}
      </Handle>
    );
  },
);

BaseHandle.displayName = "BaseHandle";
