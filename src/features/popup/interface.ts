export type SettingItemType = {
	_type: "settingItem",
	key: string,
	desc: string,
	value: boolean,
	toolTip?: string
}

export type SettingType = {
	_type: "setting",
	key: string,
	text: string,
	value: SettingItemType[],
	toolTip?: string,
}

export interface IComponentColor {
	_type: "componentColor";
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
