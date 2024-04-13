import { MouseEvent, ComponentProps, useState, useCallback, ChangeEvent } from "react";

interface SwitchProps extends Omit<ComponentProps<"div">,"onChange"> {
    value?: boolean;
    onChange?: (newValue: boolean) => void;
}

export default function Switch(props: SwitchProps) {
    const {className, value: _value} = props;
    const [value, setValue] = useState(_value);

    const sizeClass = "w-[40px] h-[20px]"
    const dotSizeClass = "w-[16px] h-[16px]"

    const handleChange = function(event: ChangeEvent) {
        console.log(event);
        if (value) {
            setValue(false);
        } else {
            setValue(true);
        }
    }

    return (
        <div className="flex items-center" >
            <label>
                <div 
                    className={[
                        sizeClass,
                        "relative rounded-full border-2 border-gray-200 overflow-clip z-20",
                        className,
                    ].join(" ")}
                >
                    <div 
                        className={[
                            dotSizeClass,
                            "absolute bg-white rounded-full transition duration-300 z-10",
                            value ? "translate-x-[20px]" : "",
                        ].join(" ")}
                    />
                    <div 
                        className={[
                            "absolute inset-0",
                            value ? "bg-webtoon" : "bg-gray-300",
                        ].join(" ")}
                    />
                </div>
                <input type="checkbox" className="hidden" checked={value} onChange={handleChange} />
            </label>
        </div>
    )
}