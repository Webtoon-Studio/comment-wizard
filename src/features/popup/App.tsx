import { useContext, useEffect, useState } from "react";
import { IS_DEV, STROAGE_COUNT_NAME } from "@shared/global";
import ThemeSwitch from "@popup/components/ThemeSwitch";
import SettingButton from "@popup/components/SettingButton";
import SettingDialog from "@popup/components/SettingDialog";
import { useTitle } from "@popup/services/title";
import TitleItem from "@popup/components/TitleItem";
import { CountContext } from "@popup/context/CountProvider";

export default function App() {
	// const { mode } = useContext(ThemeContext);
	const { refresh: refreshCounts } = useContext(CountContext);
	const [settingOpen, setSettingOpen] = useState(false);
	const [titles, fetchTitles] = useTitle();

	// Event listener
	useEffect(() => {
		if (chrome.storage) {
			const handleStorageChange = (changes: {[key:string]:chrome.storage.StorageChange}) => {
				if (STROAGE_COUNT_NAME in changes) {
					refreshCounts();
				}
			}
			chrome.storage.sync.onChanged.addListener(handleStorageChange);
	
			return () => {
				chrome.storage.sync.onChanged.removeListener(handleStorageChange);
			}
		}
		// TODO: DEV test for count changes
	});

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
			<div className="w-full h-[300px] px-4 py-1 flex justify-center items-start overflow-y-auto">
				<ul className="w-full flex flex-col items-stretch gap-2">
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
