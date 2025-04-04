import Button from "@incom/features/components/Button";
import { Children, useEffect, useRef, useState, type ComponentProps, type MouseEvent } from "react";

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16">
        <path fill="currentColor" d="M3 9.5a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3" />
    </svg>
)

interface PostPanelItemMenuProps extends ComponentProps<"div"> {}

export default function PostPanelItemMenu(props: PostPanelItemMenuProps) {
    const {
        children
    } = props;
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleClickOutsideDropdown: EventListener = function(event) {
            if (dropdownRef.current && buttonRef.current) {
                if (
                    !dropdownRef.current.contains(event.target as Node) &&
                    !buttonRef.current.contains(event.target as Node)
                ) {
                    setOpen(false);
                }
            }
        };

        document.addEventListener("click", handleClickOutsideDropdown, true);

        return () => {
            document.removeEventListener("click", handleClickOutsideDropdown, true);
        }
    }, [dropdownRef, buttonRef]);

    const handleButtonClick = function(event: MouseEvent) {
        setOpen((open) => !open);
    }

    const handleListClick = function(event: MouseEvent) {
        setOpen(false);
    }

    return (
        <div className="relative">
            <Button 
                ref={buttonRef}
                className="hover:text-gray-500" 
                onClick={handleButtonClick}
                onDoubleClick={(e) => e.stopPropagation()}
            >
                <MenuIcon />
            </Button>
            <div 
                ref={dropdownRef}
                className={[
                    "absolute z-30 bg-white border-[1px] rounded shadow-lg",
                    open ? "h-auto visible" : "h-0 invisible"
                ].join(" ")}
                onDoubleClick={(e) => e.stopPropagation()}
            >
                <ul onClick={handleListClick}>
                    {Children.map(children, (child) => (
                        <li className="px-2 py-1 border-b-[1px] last:border-b-0">
                            {child}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}