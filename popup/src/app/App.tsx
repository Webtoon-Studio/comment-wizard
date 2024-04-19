import { useSetting } from "@popup/src/services/setting";
import ToolTip from "@popup/src/common/components/toolTip";
import Switch from "@popup/src/common/components/switch";
import Button from "@popup/src/common/components/button";
import ThemeSwitch from "@popup/src/features/components/themeSwitch";

import { FaGear } from "react-icons/fa6";

export default function App() {
  // const { mode } = useContext(ThemeContext);
  const [setting, updateSetting] = useSetting();

  const handleSwitchChange = function (key: string, newValue: boolean) {
    updateSetting(key, newValue);
  };

  return (
    <div
      className={[
        "dark:border-gray-600",
        "p-2 space-y-2 text-base",
        import.meta.env.DEV ? "border-2" : "",
      ].join(" ")}
    >
      <div className="text-center my-2">
        <h3>Comment Wizard</h3>
      </div>
      <div className="flex justify-between items-center gap-2">
        <div id="left-menu" className="flex justify-start gap-2">
          <ThemeSwitch />
        </div>
        <div id="right-menu" className="flex justify-end gap-2">
          <Button color="gray" round="full" className="">
            <FaGear color="inherit" />
          </Button>
        </div>
      </div>
      <div className="text-sm">
        <p>Hover over each option for additional information.</p>
      </div>
      <ul
        role="list"
        className={["rounded border-2", "dark:border-gray-600"].join(" ")}
      >
        {setting
          ? setting.map((el, i) => (
              <li
                className={[
                  "border-b-2 last:border-b-0 border-inherit",
                  "bg-white dark:bg-black",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  "",
                ].join(" ")}
              >
                <ToolTip key={i} width={"280px"} text={el.toolTip}>
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
  );
}
