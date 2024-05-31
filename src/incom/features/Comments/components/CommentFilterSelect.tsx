import { useState } from "react";

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
    const [selected, setSelected] = useState(value);

    const handleSelect = function(newItem: string) {
        if (selected === newItem) { 
            setSelected(undefined);
        } else {
            setSelected(newItem);
        }
    }

    return (
        <div className="relative w-fit">
            <div className="w-[120px] h-[33px]">
                <button
                    className="w-full h-full bg-white rounded-[2px] border-[0.5px] border-solid border-[#d3d3d3] text-[14px] px-[9.5px]"
                >
                    <div className="min-h-[22px]">
                        <span>
                            {selected || ""}
                        </span>
                    </div>
                </button>
            </div>
            <ul 
                className="absolute w-full z-20 bg-white mt-2 border-[0.5px] border-solid border-[#d3d3d3]"
            >
                {items.map((item, index) => (
                    <li key={index} className="text-[14px] px-[9.5px] py-[6px]">
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