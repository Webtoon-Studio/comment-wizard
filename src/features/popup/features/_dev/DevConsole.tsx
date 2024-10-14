import Button from "@shared/components/button";
import { ThemeContext } from "@popup/context/ThemeProvider";
import { useCounter } from "@popup/services/counter";
import { useContext } from "react";

interface DevConsoleProps {
	embedded?: boolean;
}

export default function DevConsole({ embedded }: DevConsoleProps) {
	const { mode, toggle } = useContext(ThemeContext);
	const [counter, updateCounter] = useCounter();

	const handleToggleTheme = () => {
		toggle();
	};

	const handleCounterUpdate = () => {
		updateCounter();
	};

	return (
		<div
			className={[
				"border-2",
				embedded ? "w-full" : "fixed z-[1000] top-4 right-4",
			].join(" ")}
		>
			<h3 className="p-2">Dev Console</h3>
			<hr />
			<div className="p-2">
				<div>
					<span>Current Theme: {mode}</span>
					<Button onClick={handleToggleTheme}>Toggle</Button>
				</div>
				<div>
					<span>New Comments Counter</span>
					<div>
						<p>
							Counter: <span>{counter}</span>
						</p>
						<Button onClick={handleCounterUpdate}>Update</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
