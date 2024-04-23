import { ComponentProps, useContext, useState } from "react";
import { ComponentColorType } from "@popup/src/interface";
import {
  getComponentColor,
  getInverseColorHex,
} from "@popup/src/common/utils/colorHelper";
import { ThemeContext } from "../context/ThemeProvider";

interface ButtonProps extends Omit<ComponentProps<"button">, "color"> {
  round?: boolean | "full";
  color?: ComponentColorType;
}

export default function Button(props: ButtonProps) {
  const {
    children,
    color: colorProp = "default",
    round = true,
    ...others
  } = props;
  const { mode } = useContext(ThemeContext);
  const [hover, setHover] = useState(false);

  const handleMouseEnter = () => {
    setHover(true);
  };
  const handleMouseLeave = () => {
    setHover(false);
  };
  const handleMouseOut = () => {
    if (hover) setHover(false);
  };

  const color = getComponentColor(colorProp);

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
        title="button"
        aria-label="button"
        className={[
          roundClass,
          "px-2 py-1 border-2 dark:border-600 font-medium",
        ].join(" ")}
        style={{
          background: hover
            ? mode === "dark"
              ? color.default
              : color.dark
            : mode === "dark"
            ? color.dark
            : color.default,
          color:
            mode === "dark"
              ? getInverseColorHex(color.contrastText)
              : color.contrastText,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseOut={handleMouseOut}
      >
        {children}
      </button>
    </div>
  );
}
