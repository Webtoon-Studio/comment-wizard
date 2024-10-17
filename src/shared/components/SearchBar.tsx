import CloseIcon from "@incom/features/components/CloseIcon";
import DownArrowIcon from "@incom/features/components/DownArrowIcon";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent, type MouseEvent } from "react"

export type SearchCategory<T extends string = string> = {
    key: T,
    label: string,
    pattern?: string,
    placeholder?: string,
};

interface SearchBarProps<T extends string = string> {
    categories?: string[] | SearchCategory<T>[];
    disabled?: boolean;
    onChange?: (event: ChangeEvent<HTMLInputElement> | null, key: T | undefined, value: string) => void;
}

export default function SearchBar<T extends string = string>(props: SearchBarProps<T>) {
    const {
        categories = [],
        disabled = false,
        onChange
    } = props;
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [categoryIndex, setCategoryIndex] = useState<number>(0);
    const [value, setValue] = useState("");


    useEffect(() => {
        const handleClickOutsideDropdown: EventListener = function(event) {
            if (dropdownRef.current) {
                if (!dropdownRef.current.contains(event.target as Node)) {
                    setDropdownOpen(false);
                }
            }
        };

        document.addEventListener("click", handleClickOutsideDropdown, true);

        return () => {
            document.removeEventListener("click", handleClickOutsideDropdown, true);
        }
    }, [dropdownRef.current])

    const category = useMemo(
        () => categoryIndex < categories.length ? categories[categoryIndex] : undefined,
        [categories, categoryIndex]
    );

    const getCategoryKey = useCallback((c?: string | SearchCategory): T | undefined => {
        if (c === undefined) return undefined;
        if (typeof c === 'string') {
            return c as T;
        } else {
            return c.key as T;
        }
    }, [categoryIndex]);
    
    const getCategoryLabel = useCallback((c?: string | SearchCategory) => {
        if (c === undefined) return "";
        if (typeof c === 'string') {
            return c;
        } else {
            return c.label;
        }
    }, [categoryIndex]);

    const getCategoryPlaceholder = useCallback((c?: string | SearchCategory) => {
        if (typeof c === 'object' && Object.getOwnPropertyNames(c).includes("placeholder")) {
            return c.placeholder;
        } else {
            return undefined;
        }
    }, [categoryIndex]);
    
    const handleDropdownToggle = function(_event: MouseEvent<HTMLButtonElement>) {
        setDropdownOpen(!dropdownOpen);
    }

    const handleCategoryChange = function(index: number) {
        setCategoryIndex(index);
        setValue("");
        setDropdownOpen(false);
    }

    const handleInputChange = function(event: ChangeEvent<HTMLInputElement>) {
        let newValue = value;
        let pattern = typeof category === "object" ? category.pattern : undefined;
        if (pattern) {
            pattern = pattern.trim();
            if (!pattern.startsWith("^")) pattern = "^" + pattern;
            if (!pattern.endsWith("$")) pattern = pattern + "$";
            if (event.target.value.match(pattern)) {
                newValue = event.target.value;
            }
        } else {
            newValue = event.target.value;
        }

        if (onChange) {
            onChange(event, getCategoryKey(category), newValue);
        }
        setValue(newValue);
    }

    const handleClearClick = function(_event: MouseEvent<HTMLButtonElement>) {
        if (onChange) {
            onChange(null, getCategoryKey(category), "");
        }
        setValue("");
    }

    return (
        <div
            className="w-full h-8 flex items-center bg-gray-200 rounded-md"
        >
            {categories.length > 0 ? (
                <div 
                    ref={dropdownRef}
                    className={[
                        "relative h-full border-r-2 border-white",
                    ].join(" ")}
                >
                    <button 
                        type="button"
                        className={[
                            "w-[64px] h-full flex gap-2 justify-center items-center rounded-l-md ",
                            disabled ? "text-gray-400" : (
                                dropdownOpen ? "bg-gray-100 ring-[1px] ring-webtoon" : "hover:bg-gray-300"
                            ),
                        ].join(" ")}
                        onClick={handleDropdownToggle}
                        disabled={disabled}
                    >
                        {getCategoryLabel(category)}
                        <DownArrowIcon />
                    </button>
                    <div
                        id="dropdown"
                        className="absolute top-[100%] left-[-8px] right-[-8px] z-10 pt-2"
                        hidden={!dropdownOpen}
                    >
                        <ul
                            className="w-full py-2 bg-gray-200 border-[1px] rounded-md shadow-lg"
                        >
                            {categories.map((c, i) => (
                                <li key={i} className="pb-1 last:pb-0">
                                    <button 
                                        className={[
                                            "w-full py-1",
                                            i === categoryIndex ? "bg-gray-300" : "hover:bg-gray-300",
                                        ].join(" ")}
                                        onClick={() => handleCategoryChange(i)}    
                                    >
                                        {getCategoryLabel(c)}
                                    </button>
                                </li>
                            ))}
                        </ul>

                    </div>
                </div>
            ) : null}
            <div className="flex-auto h-full px-1 flex items-center">
                <input 
                    className="flex-auto h-full px-1 bg-inherit focus-visible:outline-none"
                    autoComplete=""
                    disabled={disabled}
                    value={value}
                    placeholder={getCategoryPlaceholder(category)}
                    onChange={handleInputChange}
                />
                <button 
                    type="button"
                    className={[
                        "p-1 flex justify-center items-center rounded-full",
                        disabled ? "text-gray-400" : (
                            "hover:bg-gray-300"
                        )
                    ].join(" ")}
                    disabled={disabled}
                    onClick={handleClearClick}
                >
                    <CloseIcon />
                </button>
            </div>
        </div>
    )
}