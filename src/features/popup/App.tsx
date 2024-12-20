import Button from "@shared/components/button";
import Switch from "@shared/components/switch";
import ToolTip from "@shared/components/toolTip";
import ThemeSwitch from "@popup/features/components/themeSwitch";
import { useSetting } from "@popup/services/setting";

import SettingButton from "@popup/features/components/settingButton";
import { IS_DEV } from "@shared/global";
import { FaGear } from "react-icons/fa6";

export default function App() {
	// const { mode } = useContext(ThemeContext);
	const [setting, updateSetting] = useSetting();

	const handleSwitchChange = (key: string, newValue: boolean) => {
		updateSetting(key, newValue);
	};

	return (
		<div
			className={[
				"dark:border-gray-600",
				"p-2 space-y-2 text-base",
				IS_DEV ? "border-2" : "",
			].join(" ")}
		>
			<div className="text-center my-2">
				<h3>Comment Wizard</h3>
			</div>
			<div className="flex justify-end items-strech gap-2">
				<ThemeSwitch />
				<SettingButton />
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
								key={i}
								className={[
									"border-b-2 last:border-b-0 border-inherit",
									"bg-white dark:bg-black",
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
	);
}
