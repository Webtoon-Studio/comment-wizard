import Button from "@incom/features/components/Button";
import { useState, type ComponentProps, type MouseEvent } from "react";

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

    const [open, setOpen] = useState(false);

    const handleButtonClick = function(event: MouseEvent) {
        if (open) setOpen(false);
        else setOpen(true);
    }

    return (
        <div className="relative">
            <Button className="hover:text-gray-500" onClick={handleButtonClick}>
                <MenuIcon />
            </Button>
            <div 
                className={[
                    "absolute z-30 bg-white border-[1px] rounded shadow",
                    open ? "h-auto visible" : "h-0 invisible"
                ].join(" ")}
            >
                <ul>
                    <li className="px-2 py-1 border-b-[1px]">
                        <div className="text-nowrap">
                            Mark as read
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    )
}