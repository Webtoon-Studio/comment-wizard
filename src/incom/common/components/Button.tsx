import type { ComponentProps } from "react";

interface ButtonProps extends ComponentProps<"button"> {
	variant?: "bordered" | "light";
}

export default function Button(props: ButtonProps) {
	const { 
		variant = "bordered",

		className, 
		children, 
		...others 
	} = props;
	return (
		<button
			className={[
				className,
				"flex items-center shrink-0 text-[#b2b2b2] rounded-[2px] cursor-pointer text-[14px] h-[33px] leading-[21px] px-[9.5px]",
				variant === "bordered" ? "border-[0.5px] border-solid border-[#d3d3d3]" : "",
				variant === "light" ? "" : "",
			].join(" ")}
			{...others}
		>
			{children}
		</button>
	);
}
