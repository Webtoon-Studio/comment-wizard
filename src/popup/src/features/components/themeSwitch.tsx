import Switch, { SwitchProps } from "@popup/src/common/components/switch";
import { FaSun } from "react-icons/fa6";
import { FaMoon } from "react-icons/fa6";
import { Rgb, twColor } from "../../common/utils/colorHelper";
import { IComponentColor } from "@popup/src/interface";
import { useContext, useMemo } from "react";
import { ThemeContext } from "@popup/src/common/context/ThemeProvider";
import Button, { ButtonProps } from "@popup/src/common/components/button";

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
    text: new Rgb(250, 230, 100).getContrastText().toHex(),
  };

  const darkColor: IComponentColor = {
    iType: "componentColor",
    default: mainDarkColor.toHex(),
    hover: mainDarkColor.light().toHex(),
    text: new Rgb(250, 230, 100).getContrastText().toHex(),
  };

  const handleClick = () => {
    toggle();
  };

  const iconComponent = useMemo(() => {
    return mode === "dark" ? (
      <FaMoon color={mainLightColor.toHex()} />
    ) : (
      <FaSun color={mainDarkColor.toHex()} />
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
