import { useState } from "react";
import { IS_DEV } from "@shared/global";
import ThemeSwitch from "@popup/components/ThemeSwitch";
import SettingButton from "@popup/components/SettingButton";
import SettingDialog from "@popup/components/SettingDialog";
import { useTitle } from "@popup/services/title";
import TitleItem from "@popup/components/TitleItem";

export default function App() {
	// const { mode } = useContext(ThemeContext);
	const [settingOpen, setSettingOpen] = useState(false);
	const [titles, fetchTitles] = useTitle();

	const handleSettingClick = () => {
		setSettingOpen(true);
	}

	const handleSettingClose = () => {
		setSettingOpen(false);
	}

	return (
		<div
			className={[
				"relative",
				"dark:border-gray-600",
				"p-2 space-y-2 text-base",
				IS_DEV ? "border-2" : "",
			].join(" ")}
			style={{
				minHeight: "400px"
			}}
		>
			<div className="text-center my-2">
				<h3>Comment Wizard</h3>
			</div>
			<div className="flex justify-end items-strech gap-2">
				<ThemeSwitch />
				<SettingButton onClick={handleSettingClick} />
			</div>
			<div className="h-[300px] w-full flex justify-center items-start overflow-y-auto">
				<ul className="px-4 grid grid-cols-3 gap-2">
					{titles.map((title, index) => (
						<li key={index}>
							<TitleItem title={title} />
						</li> 
					))}
				</ul>
			</div>
			<SettingDialog open={settingOpen} onClose={handleSettingClose}/>
		</div>
	);
}
