import { Children, Component, ComponentProps } from "react";
import { ComponentColorType } from "@popup/src/interface";
import {
  getColorClass,
  getHoverColorClass,
} from "@popup/src/common/utils/colorHelper";

interface ButtonProps extends ComponentProps<"button"> {
  round?: boolean | "full";
  color?: ComponentColorType;
}

export default function Button(props: ButtonProps) {
  const { children, color = "default", round = true, ...others } = props;

  const colorClass = getColorClass(color);
  const hoverClass = getHoverColorClass(color);
  const roundClass = round
    ? round === "full"
      ? "rounded-full"
      : "rounded"
    : "";

  return (
    <div>
      <button
        {...others}
        role="button"
        className={[
          colorClass,
          hoverClass,
          roundClass,
          "px-2 py-1 border-2 font-medium",
        ].join(" ")}
      >
        {children}
      </button>
    </div>
  );
}
