import useControlled from "@incom/common/hooks/useControlled";
import { ChangeEvent, FocusEvent, KeyboardEvent, MouseEvent, useCallback, useEffect, useId, useMemo, useReducer, useRef, useState } from "react";

interface CommentFilterSelectProps {
    label?: string;
    width?: `${number}px` | number;
    items: string[];
    value?: string;
    onChange?: (newValue: string) => void;
}

export default function CommentFilterSelect(props: CommentFilterSelectProps) {
    const {
        label,
        width: widthProp,
        items,
        value,
        onChange
    } = props;
    const id = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [open, setOpen] = useState(false);
    const [inputValue, setValue] = useState(value);
    const [selected, setSelected] = useControlled({controlled: value});
    const [currIndex, setIndex] = useState();

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
    
    const handleRootBlur = () => {
        setTimeout(() => {
            setOpen(false);
        }, 100);
    }
    
    const handleInputClick = () => {
        setOpen(true);
    }

    const handleInputChange = function(event: ChangeEvent<HTMLInputElement>) {
        setValue(event.target.value);
    }

    const handleInputKeyDown = function(event: KeyboardEvent) {

    }

    const handleSelect = function(newItem: string) {
        const newSelected = selected === newItem ? "" : newItem;

        setValue(newSelected);
        setSelected(newSelected);
        onChange?.(newSelected);

        setOpen(false);
    }

    const visibleItems = useMemo(() => {
        return items.filter(v => v.match("^"+inputValue))
    }, [items, inputValue]);

    return (
        <div ref={rootRef} className="relative w-fit"
            onBlur={handleRootBlur}
        >
            <div 
                className="relative h-[33px]"
                style={{
                    width: (typeof widthProp === 'number' ? `${widthProp}ch`: widthProp) || '120px',
                }}
            >
                {label ? (
                    <label
                        className={[
                            "absolute leading-[33px] text-[14px] px-[9.5px] pointer-events-none transition-all",
                            open || inputValue ? "translate-y-[-26px] translate-x-[-9.5px] scale-[80%] opacity-100" : "opacity-50"
                        ].join(" ")}
                    >
                        {label}
                    </label>
                ) : null}
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full h-full bg-white rounded-[2px] border-[0.5px] border-solid border-[#d3d3d3] text-[14px] px-[9.5px]"
                    value={inputValue}
                    onClick={handleInputClick}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                >
                </input>
            </div>
            <ul 
                ref={listRef}
                className={[
                    "absolute w-full max-h-[240px] overflow-y-auto z-20 bg-white mt-1 border-[0.5px] border-solid border-[#d3d3d3] ",
                    open ? "" : "hidden"
                ].join(" ")}
            >
                {visibleItems.map((item, index) => (
                    <li 
                        key={index} 
                        id={`${id}list-item-${index}`}
                        className={[
                            "cursor-pointer select-none",
                            "text-[14px] px-[9.5px] py-[6px] border-b-[1px] last:border-b-0",
                            selected === item ? "bg-gray-200" : "",
                            currIndex === index ? "bg-gray-100" : "hover:bg-gray-100"
                        ].join(" ")}
                        onClick={() => {handleSelect(item)}}
                    >
                        <div
                            className=""
                        >
                            <span>{item}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}