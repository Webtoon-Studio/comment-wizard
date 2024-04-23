export interface ISetting {
  iType: "setting";
  key: string;
  desc: string;
  value: boolean;
  toolTip?: string;
}

export interface IComponentColor {
  iType: "componentColor";
  default: string;
  hover: string;
  text: string;
}

export type ComponentSizeType = "small" | "medium" | "large";
export type ComponentColorType =
  | "default"
  | "disabled"
  | "gray"
  | "none"
  | IComponentColor;
