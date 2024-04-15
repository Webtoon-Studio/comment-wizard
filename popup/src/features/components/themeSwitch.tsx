import Switch, { SwitchProps } from "@popup/src/common/components/switch";
import { FaSun } from "react-icons/fa6";
import { FaMoon } from "react-icons/fa6";
import { Rgb } from "../../common/utils/colorHelper";
import { IComponentColor } from "@popup/src/interface";
import { useContext } from "react";
import { ThemeContext } from "@popup/src/common/context/ThemeProvider";

interface ThemeSwitchProps extends SwitchProps {}

export default function ThemeSwitch(props: ThemeSwitchProps) {
  const { ...others } = props;
  const { mode, toggle } = useContext(ThemeContext);

  const sunColor = new Rgb(250, 230, 0);
  const moonColor = new Rgb(20, 40, 50);
  const mainColor = new Rgb(250, 230, 100);

  const color: IComponentColor = {
    iType: "componentColor",
    default: mainColor.toHex(),
    dark: mainColor.dark().toHex(),
    light: mainColor.light().toHex(),
    contrastText: new Rgb(250, 230, 100).getContrastText().toHex(),
  };

  const handleChange = (newValue: boolean) => {
    if ((newValue && mode === "dark") || (!newValue && mode === "light")) {
      toggle();
    }
  };

  return (
    <Switch
      {...others}
      color={color}
      checked={mode === "light"}
      onChange={handleChange}
      startIcon={<FaSun color={sunColor.toHex()} />}
      endIcon={<FaMoon color={moonColor.toHex()} />}
    />
  );
}
