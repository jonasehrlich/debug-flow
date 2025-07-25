import { useUiStore } from "@/store";
import type { components } from "@/types/api";
import type { UiState } from "@/types/state";
import { useTheme } from "next-themes";
import React from "react";
import ReactDiffViewer from "react-diff-viewer-continued";
import { useShallow } from "zustand/react/shallow";
import { ButtonGroup } from "./button-group";

interface GitDiffDialogProps {
  isVisible: boolean;
  baseRev: string;
  headRev: string;
  diffs: components["schemas"]["Diff"][];
}

const selector = (s: UiState) => ({
  isInlineDiff: s.isInlineDiff,
  setIsInlineDiff: s.setIsInlineDiff,
});

export const GitDiffView = React.memo(
  ({
    isVisible,
    baseRev,
    headRev,
    diffs,
    ...props
  }: GitDiffDialogProps & React.ComponentProps<"div">) => {
    const { theme, systemTheme } = useTheme();
    const getTheme = (theme: string, systemTheme: string) => {
      if (theme === "system") {
        return systemTheme;
      }
      return theme;
    };
    const [isDarkMode, setIsDarkMode] = React.useState(
      getTheme(theme ?? "system", systemTheme ?? "light") === "dark",
    );
    React.useEffect(() => {
      setIsDarkMode(
        getTheme(theme ?? "system", systemTheme ?? "light") === "dark",
      );
    }, [theme, systemTheme]);

    const { isInlineDiff, setIsInlineDiff } = useUiStore(useShallow(selector));
    return (
      isVisible && (
        <div {...props}>
          <h2 className="text-lg font-semibold mb-4">Git Diff</h2>
          <div className="flex items-center justify-between w-full pr-2">
            <h3 className="font-mono mb-4">
              {baseRev}..{headRev}
            </h3>
            <div className="flex items-center space-x-2 gap-2 mb-4">
              <ButtonGroup
                selectedButton={isInlineDiff ? "inline" : "split"}
                onChange={(key) => {
                  setIsInlineDiff(key === "inline");
                }}
                variant="outline"
                buttons={[
                  {
                    key: "inline",
                    label: "Inline View",
                  },
                  {
                    key: "split",
                    label: "Split View",
                  },
                ]}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 space-y-4">
            {diffs.map((diff, index) => (
              <ReactDiffViewer
                leftTitle={diff.old?.path ?? ""}
                rightTitle={diff.new?.path ?? ""}
                oldValue={diff.old?.content ?? ""}
                newValue={diff.new?.content ?? ""}
                useDarkTheme={isDarkMode}
                splitView={!isInlineDiff}
                key={index}
              />
            ))}
          </div>
        </div>
      )
    );
  },
);
