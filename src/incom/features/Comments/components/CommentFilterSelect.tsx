import { MouseEvent, useCallback, useEffect, useReducer, useRef, useState } from "react";

interface CommentFilterSelectProps {
    items: string[];
    value?: string;
    onChange?: (newValue: string) => void;
}

export default function CommentFilterSelect(props: CommentFilterSelectProps) {
    const {
        items,
        value,
        onChange
    } = props;
    const rootRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(value);

    useEffect(() => {
        const handleClickOutside = function(event: globalThis.MouseEvent) {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("click", handleClickOutside, true);
        return () => {
            document.removeEventListener("click", handleClickOutside, true);
        }
    }, []);

    const handleMenuTrigger = useCallback(function() {
        setOpen(!open);
    }, [open]);

    const handleSelect = function(newItem: string) {
        if (selected === newItem) { 
            setSelected(undefined);
        } else {
            setSelected(newItem);
        }
        setOpen(false);
    }


    return (
        <div ref={rootRef} className="relative w-fit">
            <div className="w-[120px] h-[33px]">
                <button
                    className="w-full h-full bg-white rounded-[2px] border-[0.5px] border-solid border-[#d3d3d3] text-[14px] px-[9.5px]"
                    onClick={() => handleMenuTrigger()}
                >
                    <div className="min-h-[22px]">
                        <span>
                            {selected || ""}
                        </span>
                    </div>
                </button>
            </div>
            <ul 
                className={[
                    "absolute w-full max-h-[240px] overflow-y-auto z-20 bg-white mt-2 border-[0.5px] border-solid border-[#d3d3d3]",
                    open ? "" : "hidden"
                ].join(" ")}
            >
                {items.map((item, index) => (
                    <li 
                        key={index} 
                        className={[
                            "text-[14px] px-[9.5px] py-[6px] border-b-[1px] last:border-b-0 hover:bg-gray-100",
                            selected === item ? "bg-gray-200" : ""
                        ].join(" ")}
                    >
                        <div
                            className="cursor-pointer select-none text-center"
                            onClick={() => handleSelect(item)}
                        >
                            <span>{item}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}