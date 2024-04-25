import { IS_DEV } from "@root/src/popup";
import {
	type Context,
	type ProviderProps,
	createContext,
	useEffect,
	useState,
} from "react";

const STORAGE_THEME_NAME = "cs_theme_mode";

const defaultThemeMode: ThemeMode = window.matchMedia(
	"(prefers-color-scheme: dark)",
).matches
	? "dark"
	: "light";

async function loadTheme(): Promise<ThemeMode> {
	if (!IS_DEV && chrome.storage) {
		return chrome.storage.sync.get(STORAGE_THEME_NAME).then((items) => {
			if (STORAGE_THEME_NAME in items) {
				return items[STORAGE_THEME_NAME] as ThemeMode;
			}
			return defaultThemeMode;
		});
	} else {
		const stored = localStorage.getItem(STORAGE_THEME_NAME);
		if (stored) {
			const json = JSON.parse(stored);
			if (typeof json === "string") {
				return json as ThemeMode;
			}
		}
		return defaultThemeMode;
	}
}

type ThemeMode = "light" | "dark";

export interface Theme {
	mode: ThemeMode | null;
	toggle: () => void;
}

export const ThemeContext: Context<Theme> = createContext<Theme>({
	mode: null,
	toggle: () => {},
});

export default function ThemeProvider(
	props: Omit<ProviderProps<Theme | null>, "value">,
) {
	const { children } = props;
	const [mode, setMode] = useState<ThemeMode | null>(null);

	useEffect(() => {
		loadTheme().then((value) => setMode(value));
	}, []);

	useEffect(() => {
		if (mode === "dark") {
			document.body.classList.add("dark");
		} else {
			document.body.classList.remove("dark");
		}
	}, [mode]);

	const toggle = () => {
		if (mode === "dark") {
			setMode("light");
		} else {
			setMode("dark");
		}
	};

	return (
		<ThemeContext.Provider value={{ mode, toggle } as const}>
			{children}
		</ThemeContext.Provider>
	);
}
