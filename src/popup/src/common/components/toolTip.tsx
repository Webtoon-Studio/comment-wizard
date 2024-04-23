import {
  ComponentProps,
  MouseEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { twColor } from "../utils/colorHelper";

interface ToolTipProps extends ComponentProps<"div"> {
  width?: `${number}px` | `${number}%`;
  text?: string;
}

export default function ToolTip(props: ToolTipProps) {
  const { children, className, text, width, ...others } = props;
  const popperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const handleMouseEnter = useCallback(
    function (event: MouseEvent) {
      if (!open && event.target !== popperRef.current) {
        setOpen(true);
      }
    },
    [popperRef, open]
  );

  const handleMouseLeave = function (_: MouseEvent) {
    if (open) {
      setOpen(false);
    }
  };

  const Arrow = () => (
    <div
      style={{
        position: "absolute",
        bottom: -4,
        left: 12,
        width: 0,
        height: 0,
        borderLeft: "5px solid transparent",
        borderRight: "3px solid transparent",
        borderTop: "8px solid " + twColor.gray,
      }}
    />
  );

  return (
    <div
      {...others}
      className={["relative", text ? "cursor-default" : "", className].join(
        " "
      )}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className=""
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      <div
        ref={popperRef}
        className="absolute z-[100] p-1 transition duration-300"
        style={{
          width: width,
          top: popperRef.current ? -popperRef.current.clientHeight : 0,
          visibility: open ? "visible" : "hidden",
          opacity: open ? "100%" : "0%",
        }}
      >
        <Arrow />
        <div
          className={[
            "rounded box-border border-2 bg-white text-black text-xs p-1",
            "dark:border-0 dark:bg-gray-500 dark:text-white",
          ].join(" ")}
        >
          <span>{text}</span>
        </div>
      </div>
    </div>
  );
}
