import React, { PropsWithChildren } from "react";
import { useCommandCenterController } from "./useCommandCenterController";
import type { CommandCenterController } from "./types";
import { LayoutFrame } from "./LayoutFrame";
import { CommandCenterModals } from "./CommandCenterModals";

export const CommandCenterLayout = () => {
  const controller = useCommandCenterController();

  return (
    <LayoutFrame controller={controller}>
      <CommandCenterModals controller={controller} />
    </LayoutFrame>
  );
};

export type LayoutFrameProps = PropsWithChildren<{ controller: CommandCenterController }>;
