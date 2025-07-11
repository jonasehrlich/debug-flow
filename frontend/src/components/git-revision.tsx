import { cn } from "@/lib/utils";
import { GitBranch, Pin } from "lucide-react";
import { useCallback, useRef, type RefObject } from "react";
import { CopyButton } from "./copy-button";
import { DynamicTooltip } from "./dynamic-tooltip";
import { Button } from "./ui/button";
/**
 * @interface GitRevisionProps
 * @description Props for the GitRevisionProps component.
 * @property {string} revision - The text string to be copied to the clipboard.
 */
interface GitRevisionProps {
  revision: string;
  onClickPinRevision?: (rev: string) => void;
}

export const GitRevision = ({
  revision,
  onClickPinRevision: onClickPinRevision,
}: GitRevisionProps) => {
  const ref = useRef<HTMLButtonElement>(null);

  const handlePinCommitId = useCallback(() => {
    if (!onClickPinRevision) {
      return Promise.resolve(false);
    }
    onClickPinRevision(revision);
    return Promise.resolve(true);
  }, [revision, onClickPinRevision]);

  const contentName = "revision";
  const paddedContentName = " " + contentName;

  return (
    <div className={cn("flex flex-1 items-center text-muted-foreground")}>
      <GitBranch size={16} />

      <span className="flex-1 font-mono px-3  truncate align-middle">
        {revision}
      </span>
      {onClickPinRevision && (
        <DynamicTooltip
          onClickAction={handlePinCommitId}
          defaultHoverContent={"Pin" + paddedContentName}
          successContent={"Pinned" + paddedContentName}
          failedContent={"Failed to pin" + paddedContentName}
        >
          <Button
            ref={ref}
            variant="ghost"
            className={cn("nodrag size-6 cursor-pointer")}
          >
            <Pin size={16} />
          </Button>
        </DynamicTooltip>
      )}
      <CopyButton
        text={revision}
        contentName={contentName}
        ref={ref as RefObject<HTMLButtonElement>}
      />
    </div>
  );
};
