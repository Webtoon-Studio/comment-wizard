import { ComponentColorType, IComponentColor } from "@popup/src/interface";
import twConfig from "@root/tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

export const twColor = resolveConfig(twConfig).theme.colors;

interface IRgb extends Object {
  r: number;
  g: number;
  b: number;
  toHex: () => string;
  light: () => Rgb;
  dark: () => Rgb;
  getContrastText: () => Rgb;
}

export class Rgb implements IRgb {
  r: number;
  g: number;
  b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  toString(): string {
    return `rgb(${this.r},${this.g},${this.b})`;
  }

  toHex(): string {
    const hex = (n: number) => {
      const h = n.toString(16);
      return h.length === 1 ? "0" + h : h;
    };

    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
  }

  dark(): Rgb {
    const darkR = Math.max(0, this.r - 20);
    const darkG = Math.max(0, this.g - 20);
    const darkB = Math.max(0, this.b - 20);
    return new Rgb(darkR, darkG, darkB);
  }

  light(): Rgb {
    const lightR = Math.min(255, this.r + 20);
    const lightG = Math.min(255, this.g + 20);
    const lightB = Math.min(255, this.b + 20);
    return new Rgb(lightR, lightG, lightB);
  }

  getContrastText(): Rgb {
    const brightness = (this.r + this.b + this.g) / 255;
    return brightness > 128 ? new Rgb(0, 0, 0) : new Rgb(255, 255, 255);
  }

  isPrototypeOf(v: Object): boolean {
    return "r" in v && "g" in v && "b" in v;
  }
}

export function getComponentColor(
  colorPreset: ComponentColorType
): IComponentColor {
  if (
    typeof colorPreset === "object" &&
    "iType" in colorPreset &&
    colorPreset.iType === "componentColor"
  ) {
    return colorPreset as IComponentColor;
  }

  switch (colorPreset) {
    case "none":
      return {
        iType: "componentColor",
        default: twColor.transparent,
        dark: twColor.transparent,
        light: twColor.transparent,
        contrastText: twColor.black,
      };
    case "gray":
      return {
        iType: "componentColor",
        default: twColor.gray.DEFAULT,
        dark: twColor.gray.dark,
        light: twColor.gray.light,
        contrastText: twColor.black,
      };
    case "disabled":
      return {
        iType: "componentColor",
        default: twColor.gray.DEFAULT,
        dark: twColor.gray.dark,
        light: twColor.gray.light,
        contrastText: twColor.gray.darker,
      };
    case "default":
    default:
      return {
        iType: "componentColor",
        default: twColor.webtoon.DEFAULT,
        dark: twColor.webtoon.dark,
        light: twColor.webtoon.light,
        contrastText: twColor.gray[100],
      };
  }
}
