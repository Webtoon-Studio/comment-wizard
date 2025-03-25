import { useSetting } from "@popup/services/setting";
import Button from "@shared/components/button";
import Switch from "@shared/components/switch";
import ToolTip from "@shared/components/toolTip";
import { ComponentProps, ForwardedRef, forwardRef, MouseEvent, useEffect, useId, useRef } from "react";
import { FaX } from "react-icons/fa6";

interface SettingDialogProps {
    open: boolean;
    onClose?: () => void;
}

export default function SettingDialog(props: SettingDialogProps) {
    const {
        open,
        onClose,
        ...others
    } = props;

    
    const id = useId();
    const contentRef = useRef<HTMLDivElement>(null);
	const [setting, updateSetting] = useSetting();
    
    if (!open) return null;

    // useEffect(() => {
    //     if (open && contentRef.current) {
    //         const handleClickOutside = (e: globalThis.MouseEvent) => {
    //             if (!contentRef.current?.contains(e.target as HTMLElement)) {
    //                 console.log("clicked outside!")
    //                 onClose?.();
    //             }
    //         }
    //         const fid = document.addEventListener("click", handleClickOutside, false)
            
    //         return () => {
    //             document.removeEventListener("click", handleClickOutside, false)
    //         }
    //     }
    // }, [contentRef, open, onClose]);

    const handleCloseButton = (event: MouseEvent<HTMLButtonElement>) => {
        onClose?.();
    }

	const handleSwitchChange = (key: string, newValue: boolean) => {
		updateSetting(key, newValue);
	};

    return (
        <div
            id={`${id}setting-wrapper`}
            className={"bg-black/80"}
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                height: "auto",
                margin: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <div
                className="bg-white text-gray-500 dark:bg-black dark:text-gray-100 m-4 border-2 rounded"
        >
                <div className="p-2 space-y-2">
                    <div className="flex items-start text-sm">
                        <p className="flex-auto">Hover over each option for additional information.</p>
                        <Button round="full" onClick={handleCloseButton}>
                            <FaX />
                        </Button>
                    </div>
                    <ul
                        role="list"
                        className={["rounded border-2", "dark:border-gray-600"].join(" ")}
                    >
                        {setting
                            ? setting.map((el, i) => (
                                    <li
                                        key={i}
                                        className={[
                                            "border-b-2 last:border-b-0 border-inherit",
                                            "hover:bg-gray-100 dark:hover:bg-gray-800",
                                            "",
                                        ].join(" ")}
                                    >
                                        <ToolTip width={"280px"} text={el.toolTip}>
                                            <div className="flex justify-between px-2 py-1">
                                                <span className="text-sm">{el.desc}</span>
                                                <Switch
                                                    size="small"
                                                    checked={el.value}
                                                    onChange={(newValue: boolean) =>
                                                        handleSwitchChange(el.key, newValue)
                                                    }
                                                />
                                            </div>
                                        </ToolTip>
                                    </li>
                                ))
                            : null}
                    </ul>
                    <div className="text-right text-xs">
                        <p>* Changes will apply when the page is refreshed</p>
                    </div>

                </div>
            </div>
        </div>
    )
}