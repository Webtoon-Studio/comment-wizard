import { useSetting } from "@popup/src/services/setting"
import ToolTip from "@popup/src/common/components/toolTip";
import Switch from "../common/components/switch";

export default function App() {
    const [setting, updateSetting] = useSetting();

    const handleSwitchChange = function(key: string, newValue: boolean) {
        updateSetting(key, newValue);
    }

    return (
        <div 
            className={[
                "p-2",
                import.meta.env.DEV ? "border-2" : "",
            ].join(" ")}
        >
            <div className="text-center my-2">
                <h3>Comment Wizard</h3>
            </div>
            <div>
                <p>Hover over each option for additional information.</p>
            </div>
            <ul role="lsit" className="rounded border-2">
                {setting ? setting.map((el, i) => (
                    <li className="border-b-2 last:border-b-0 hover:bg-gray-100">
                        <ToolTip key={i} width={"280px"} text={el.toolTip}>
                            <div className="flex justify-between px-2 py-1">
                                <span>{el.desc}</span>
                                <Switch 
                                    checked={el.value}
                                    onChange={(newValue: boolean) => handleSwitchChange(el.key, newValue)}
                                />
                            </div>
                        </ToolTip>
                    </li>
                )): null}
            </ul>
            <div className="text-right text-sm">
                <span>* applies only when you are logged in</span>
            </div>
            <div>
                <p>
                    Refresh the page after changing settings. Some settings might take up to
                    10 minutes to take effect.
                </p>
            </div>
        </div>
    )
}