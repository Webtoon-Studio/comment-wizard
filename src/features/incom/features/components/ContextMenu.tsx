import { Children, ComponentProps, ReactNode, useEffect, useRef } from "react";

interface ContextMenuProps extends ComponentProps<"div"> {
    open: boolean;
    position: {x: number, y: number};
    onClose?: () => void;
}

export default function ContextMenu(props: ContextMenuProps) {
    const { 
        open,
        position,
        onClose,
        children
    } = props;
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside: EventListener = function(event) {
            if (rootRef.current) {
                if (!rootRef.current.contains(event.target as Node)) {
                    onClose?.();
                }
            }
        };

        document.addEventListener("click", handleClickOutside, true);
        document.addEventListener("contextmenu", handleClickOutside, true);

        return () => {
            document.removeEventListener("click", handleClickOutside, true);
            document.removeEventListener("contextmenu", handleClickOutside, true);
        }
    }, [rootRef, onClose])

    return open ? (
        <div
            ref={rootRef}
            className={[
                "fixed z-30 bg-white border-[1px] rounded shadow-lg",
                open ? "h-auto visible" : "h-0 invisible"
            ].join(" ")}
            style={{
                left: position.x,
                top: position.y
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <ul>
                {Children.map<ReactNode, ReactNode>(children, (child, index) => (
                    <li key={index} >
                        {child}
                    </li>
                ))}
            </ul>
        </div>
    ) : null;
}