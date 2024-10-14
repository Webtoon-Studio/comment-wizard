import {
	Rgb,
	getComponentColor,
	getInverseColorHex,
} from "@shared/utils/colorHelper";
import type { ComponentColorType } from "@popup/interface";
import { type ComponentProps, useContext, useState } from "react";
import { ThemeContext } from "../../features/popup/context/ThemeProvider";

export interface ButtonProps extends Omit<ComponentProps<"button">, "color"> {
	round?: boolean | "full";
	color?: ComponentColorType;
}

export default function Button(props: ButtonProps) {
	const {
		children,
		color: colorProp = "default",
		round = true,
		...others
	} = props;
	const { mode } = useContext(ThemeContext);
	const [hover, setHover] = useState(false);

	const handleMouseEnter = () => {
		setHover(true);
	};
	const handleMouseLeave = () => {
		setHover(false);
	};
	// const handleMouseOut = () => {
	//   if (hover) setHover(false);
	// };

	const color = getComponentColor(colorProp);

	const roundClass = round
		? round === "full"
			? "rounded-full"
			: "rounded"
		: "";

	return (
		<div>
			<button
				{...others}
				role="button"
				title="button"
				aria-label="button"
				className={[
					roundClass,
					"px-2 py-1 border-2 dark:border-600 font-medium",
				].join(" ")}
				style={{
					background: hover ? color.hover : color.default,
					color: mode === "dark" ? getInverseColorHex(color.text) : color.text,
					borderColor:
						mode === "dark"
							? Rgb.fromHex(color.default)?.light().toHex() || color.default
							: Rgb.fromHex(color.default)?.dark().toHex() || color.default,
				}}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				// onMouseOut={handleMouseOut}
			>
				{children}
			</button>
		</div>
	);
}
