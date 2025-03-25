import Button, { type ButtonProps } from "@shared/components/button";
import Switch, { SwitchProps } from "@shared/components/switch";
import { ThemeContext } from "@popup/context/ThemeProvider";
import type { IComponentColor } from "@popup/interface";
import { useContext, useMemo } from "react";
import { FaSun } from "react-icons/fa6";
import { FaMoon } from "react-icons/fa6";
import { Rgb, twColor } from "../../../shared/utils/colorHelper";

interface ThemeSwitchProps extends ButtonProps {}

export default function ThemeSwitch(props: ThemeSwitchProps) {
	const { ...others } = props;
	const { mode, toggle } = useContext(ThemeContext);

	const mainDarkColor = Rgb.fromHex(twColor.gray[800]) || new Rgb(40, 40, 40);
	const mainLightColor =
		Rgb.fromHex(twColor.gray[100]) || new Rgb(255, 255, 255);

	const lightColor: IComponentColor = {
		iType: "componentColor",
		default: mainLightColor.toHex(),
		hover: mainLightColor.dark().toHex(),
		text: twColor.amber[400],
	};

	const darkColor: IComponentColor = {
		iType: "componentColor",
		default: mainDarkColor.toHex(),
		hover: mainDarkColor.light().toHex(),
		text: twColor.gray[100],
	};

	const handleClick = () => {
		toggle();
	};

	const iconComponent = useMemo(() => {
		return mode === "dark" ? (
			<FaMoon color={darkColor.text} />
		) : (
			<FaSun color={lightColor.text} />
		);
	}, [mode]);

	return (
		<Button
			{...others}
			color={mode === "dark" ? darkColor : lightColor}
			onClick={() => handleClick()}
		>
			{iconComponent}
		</Button>
	);
}
