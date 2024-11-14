interface DotIconProps {
    className?: string;
    color?: string;
    strokeColor?: string;
}

export default function DotIcon(props: DotIconProps) {
    const {
        className = "",
        color = "currentColor",
        strokeColor
    } = props;
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48">
            <path fill={color} stroke={strokeColor || color} stroke-width="4" d="M24 33a9 9 0 1 0 0-18a9 9 0 0 0 0 18Z" />
        </svg>
    );
}
