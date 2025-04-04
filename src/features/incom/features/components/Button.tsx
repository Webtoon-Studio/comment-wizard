import type { ComponentRoundedType, ComponentSizeType } from "@shared/interface/componentInterface";
import { forwardRef, useMemo, type ComponentProps, type HTMLAttributes } from "react";

interface ButtonProps extends ComponentProps<"button"> {
	variant?: "text" | "contained" | "outlined";
	size?: ComponentSizeType;
	rounded?: ComponentRoundedType;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
	const { 
		type = "button",
		variant = "text",
		size = "md",
		rounded = "md",

		disabled,
		className, 
		children,
		onClick,
		...others 
	} = props;

	const hoverClassName = useMemo(() => {
		switch (variant) {
			case "text":
				return "";
			case "contained":
				return "";
			case "outlined":
				return "";
		}
	}, [variant]);

	const variantClassName = useMemo(() => {
		switch (variant) {
			case "text":
				return "";
			case "contained":
				return "";
			case "outlined":
				return "border-[0.5px] border-solid border-[#d3d3d3]";
		}
	}, [variant])
	
	const sizeClassName = useMemo(() => {
		switch (size) {
			case "sm":
				return "text-[12px] h-[18px] leading-[16px] px-[6px]";
			case "md":
				return "text-[14px] h-[33px] leading-[21px] px-[9.5px]";
			case "lg":
				return "text-[18px] h-[40px] leading-[28px] px-[14px]";
		}
	}, [size]);

	const roundedClassName = useMemo(() => {
		return `rounded-${rounded}`;
	}, [rounded]);

	return (
		<button
			ref={ref}
			type={type}
			className={[
				disabled ? "text-gray-500" : "",
				className,
				"flex items-center shrink-0 cursor-pointer ",
				hoverClassName,
				variantClassName,
				sizeClassName,
				roundedClassName,
			].join(" ")}
			onClick={disabled ? undefined : onClick}
			{...others}
		>
			{children}
		</button>
	);
});

export default Button;
