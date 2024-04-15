import {
  ComponentProps,
  ChangeEvent,
  ReactElement,
  useCallback,
  useMemo,
  useId,
  useContext,
} from "react";
import useControlled from "@popup/src/common/utils/useControlled";
import {
  ComponentColorType,
  ComponentSizeType,
  IComponentColor,
} from "@popup/src/interface";
import {
  getComponentColor,
  Rgb,
  twColor,
} from "@popup/src/common/utils/colorHelper";
import { ThemeContext } from "../context/ThemeProvider";

export interface SwitchProps
  extends Omit<ComponentProps<"div">, "color" | "onChange"> {
  size?: ComponentSizeType;
  color?: ComponentColorType;
  checked?: boolean;
  onChange?: (newValue: boolean) => void;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
}

export default function Switch(props: SwitchProps) {
  const {
    className,
    checked: checkedProp,
    onChange,
    size = "medium",
    color: colorProp = "default",
    startIcon,
    endIcon,
    ...others
  } = props;

  const id = useId();
  const { mode } = useContext(ThemeContext);
  const [checked, setCheckedState] = useControlled({ controlled: checkedProp });

  const color: IComponentColor = getComponentColor(colorProp);

  const containerSizeClassMap: { [key in ComponentSizeType]: string } = {
    small: "w-[36px] h-[18px]",
    medium: "w-[56px] h-[28px]",
    large: "w-[76px] h-[38px]",
  };

  const dotSizeClassMap: { [key in ComponentSizeType]: string } = {
    small: "w-[16px] h-[16px]",
    medium: "w-[26px] h-[26px]",
    large: "w-[36px] h-[36px]",
  };

  const translateClassMap: { [key in ComponentSizeType]: string } = {
    small: "translate-x-[17px]",
    medium: "translate-x-[27px]",
    large: "translate-x-[37px]",
  };

  const handleChange = function (event: ChangeEvent<HTMLInputElement>) {
    const newChecked = event.target.checked;

    setCheckedState(newChecked);

    if (onChange) {
      onChange(newChecked);
    }
  };

  const DotIcon = useCallback(() => {
    const dotIconSizeMap: { [key in ComponentSizeType]: string } = {
      small: "h-[14px]",
      medium: "h-[24px]",
      large: "h-[34px]",
    };

    return (
      <div
        className={[
          dotIconSizeMap[size],
          "*:w-full *:h-full",
          size === "small" ? "*:p-[1px]" : "*:p-1",
        ].join(" ")}
      >
        {checked ? startIcon : endIcon}
      </div>
    );
  }, [checked]);

  return (
    <div {...others} id={`switch-root-${id}`} className="flex items-center">
      <label id={`switch-label-${id}`} htmlFor={`switch-input-${id}`}>
        <div
          id={`switch-container-${id}`}
          className={[
            containerSizeClassMap[size],
            "relative flex items-center rounded-full border-[2px] overflow-clip z-20 cursor-pointer",
            className,
          ].join(" ")}
          style={{
            borderColor: checked
              ? mode === "dark"
                ? color.dark
                : color.default
              : mode === "dark"
              ? twColor.gray[400]
              : twColor.gray[200],
          }}
        >
          <div
            id={`switch-dot-${id}`}
            className={[
              dotSizeClassMap[size],
              "absolute top-0 bottom-0 bg-white rounded-full transition duration-300 z-10 overflow-clip",
              "flex justify-center items-center",
              checked ? translateClassMap[size] : "",
            ].join(" ")}
          >
            <DotIcon />
          </div>
          <div
            id={`switch-track-${id}`}
            className={["absolute inset-[-1px]"].join(" ")}
            style={{
              backgroundColor: checked
                ? mode === "dark"
                  ? color.dark
                  : color.default
                : mode === "dark"
                ? twColor.gray[500]
                : twColor.gray[200],
            }}
          />
        </div>
        <input
          id={`switch-input-${id}`}
          type="checkbox"
          title={`switch-input`}
          aria-label="switch-input"
          className="hidden"
          checked={checked}
          onChange={handleChange}
        />
      </label>
    </div>
  );
}
