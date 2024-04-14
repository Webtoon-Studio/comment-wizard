import { MouseEvent, ComponentProps, useState, useCallback, ChangeEvent } from "react";
import useControlled from "@popup/src/common/utils/useControlled";

interface SwitchProps extends Omit<ComponentProps<"div">,"onChange"> {
    checked?: boolean;
    onChange?: (newValue: boolean) => void;
}

export default function Switch(props: SwitchProps) {
    const {
        className, 
        checked: checkedProp, 
        onChange
    } = props;

    const [checked, setCheckedState] = useControlled({controlled: checkedProp})

    const sizeClass = "w-[40px] h-[20px]"
    const dotSizeClass = "w-[16px] h-[16px]"

    const handleChange = function(event: ChangeEvent<HTMLInputElement>) {

        const newChecked = event.target.checked;
        
        setCheckedState(newChecked);

        if (onChange) {
            onChange(newChecked);
        }
    }

    return (
        <div className="flex items-center" >
            <label>
                <div 
                    className={[
                        sizeClass,
                        "relative rounded-full border-2 border-gray-200 overflow-clip z-20 cursor-pointer",
                        className,
                    ].join(" ")}
                >
                    <div 
                        className={[
                            dotSizeClass,
                            "absolute bg-white rounded-full transition duration-300 z-10",
                            checked ? "translate-x-[20px]" : "",
                        ].join(" ")}
                    />
                    <div 
                        className={[
                            "absolute inset-0",
                            checked ? "bg-webtoon" : "bg-gray-300",
                        ].join(" ")}
                    />
                </div>
                <input type="checkbox" className="hidden" checked={checked} onChange={handleChange} />
            </label>
        </div>
    )
}