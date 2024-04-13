import { ComponentProps, MouseEvent, useCallback, useRef, useState } from "react";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@root/tailwind.config.ts";

interface ToolTipProps extends ComponentProps<"div"> {
    width?: `${number}px` | `${number}%`
    text?: string
}

export default function ToolTip(props: ToolTipProps) {
    const {children, className, text, width, ...others} = props;
    const popperRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const twConfig = resolveConfig(tailwindConfig);

    const handleMouseEnter = useCallback(
        function(event: MouseEvent) {
            if (!open && event.target !== popperRef.current) {
                setOpen(true);
            }
        },
        [popperRef, open]
    );

    const handleMouseLeave = function(event: MouseEvent) {
        if (open) {
            setOpen(false);
        }
    }

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
                borderTop: "8px solid " + twConfig.theme.colors.gray.DEFAULT,
            }}
        />
    )

    return (
        <div 
            {...others}
            className={[
                "relative",
                text ? "cursor-default" : "",
                className
            ].join(" ")}
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
                    opacity: open ? "100%" : "0%"
                }}
            >
                <Arrow />
                <div className="rounded bg-gray text-white text-sm p-1">
                    <span>
                        {text}
                    </span>
                </div>
            </div>
        </div>
    )

}