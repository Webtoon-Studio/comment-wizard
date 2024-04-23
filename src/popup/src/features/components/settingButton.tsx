import Button from "@popup/src/common/components/button";
import { ThemeContext } from "@popup/src/common/context/ThemeProvider";
import { Rgb, twColor } from "@popup/src/common/utils/colorHelper";
import { IComponentColor } from "@popup/src/interface";
import { useContext, useMemo, useState } from "react";
import { FaGear } from "react-icons/fa6";

export default function SettingButton() {
  const { mode } = useContext(ThemeContext);
  const [hover, setHover] = useState(false);

  const handleMouseEnter = () => {
    setHover(true);
  };
  const handleMouseLeave = () => {
    setHover(false);
  };

  const mainColor = useMemo(() => {
    return mode === "dark"
      ? Rgb.fromHex(twColor.gray[800])
      : Rgb.fromHex(twColor.gray[100]);
  }, [mode]);

  const color: IComponentColor = {
    iType: "componentColor",
    default: twColor.gray[400],
    hover: twColor.webtoon.DEFAULT,
    text: mainColor.getContrastText().toHex(),
  };

  return (
    <button
      role="button"
      title="setting-button"
      aria-label="setting-button"
      className={["px-2 py-1 border-2 rounded"].join(" ")}
      style={{
        backgroundColor: hover
          ? mode === "dark"
            ? mainColor.light().toHex()
            : mainColor.dark().toHex()
          : mainColor.toHex(),
        borderColor:
          mode === "dark"
            ? mainColor.light().toHex()
            : mainColor.dark().toHex(),
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <FaGear color="inherit" />
    </button>
  );
}
