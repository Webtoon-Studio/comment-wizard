import Button, { ButtonProps } from "@shared/components/button";
import { ThemeContext } from "@popup/context/ThemeProvider";
import { Rgb, twColor } from "@shared/utils/colorHelper";
import type { IComponentColor } from "@popup/interface";
import { useContext, useMemo, useState } from "react";
import { FaGear } from "react-icons/fa6";

interface SettingButtonProps extends ButtonProps {}

export default function SettingButton(props: SettingButtonProps) {
	const {
		onClick
	} = props;
	const { mode } = useContext(ThemeContext);

	const mainDarkColor = Rgb.fromHex(twColor.gray[800]) || new Rgb(40, 40, 40);
	const mainLightColor =
		Rgb.fromHex(twColor.gray[100]) || new Rgb(255, 255, 255);

	const lightColor: IComponentColor = {
		_type: "componentColor",
		default: mainLightColor.toHex(),
		hover: mainLightColor.dark().toHex(),
		text: twColor.gray[500],
	};

	const darkColor: IComponentColor = {
		_type: "componentColor",
		default: mainDarkColor.toHex(),
		hover: mainDarkColor.light().toHex(),
		text: twColor.gray[100],
	};

	const iconComponent = useMemo(() => {
		return mode === "dark" ? (
			<FaGear color={darkColor.text} />
		) : (
			<FaGear color={lightColor.text} />
		);
	}, [mode]);

	return (
		<Button
			role="button"
			title="setting-button"
			aria-label="setting-button"
			color={mode === "dark" ? darkColor : lightColor}
			onClick={onClick}
		>
			{iconComponent}
		</Button>
	);
}
