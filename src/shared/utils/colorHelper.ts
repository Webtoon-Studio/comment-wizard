import type { ComponentColorType, IComponentColor } from "@popup/interface";
import twConfig from "@root/tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

const twColor = resolveConfig(twConfig).theme.colors;

interface IRgb extends NonNullable<unknown> {
	r: number;
	g: number;
	b: number;
	toHex: () => string;
	light: () => Rgb;
	dark: () => Rgb;
	getContrastText: () => Rgb;
	getInverse: () => Rgb;
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

	static fromHex(hex: string): Rgb {
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);

		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? new Rgb(
					Number.parseInt(result[1], 16),
					Number.parseInt(result[2], 16),
					Number.parseInt(result[3], 16),
				)
			: new Rgb(0, 0, 0);
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

	getInverse(): Rgb {
		const iR = 255 - this.r;
		const iG = 255 - this.g;
		const iB = 255 - this.b;
		return new Rgb(iR, iG, iB);
	}

	isPrototypeOf(v: Object): boolean {
		return "r" in v && "g" in v && "b" in v;
	}
}

export function getComponentColor(
	colorPreset: ComponentColorType,
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
				hover: twColor.transparent,
				text: twColor.black,
			};
		case "gray":
			return {
				iType: "componentColor",
				default: twColor.gray.DEFAULT,
				hover: twColor.gray.dark,
				text: twColor.black,
			};
		case "disabled":
			return {
				iType: "componentColor",
				default: twColor.gray.DEFAULT,
				hover: twColor.gray.dark,
				text: twColor.gray.darker,
			};
		case "default":
		default:
			return {
				iType: "componentColor",
				default: twColor.webtoon.DEFAULT,
				hover: twColor.webtoon.dark,
				text: twColor.gray[100],
			};
	}
}

export function convertHexToRgb(hex: string): Rgb | null {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? new Rgb(
				Number.parseInt(result[1], 16),
				Number.parseInt(result[2], 16),
				Number.parseInt(result[3], 16),
			)
		: null;
}

export function getInverseColorHex(hex: string): string {
	const rgb = convertHexToRgb(hex);
	return rgb ? rgb.getInverse().toHex() : "#000";
}

export { twColor };
