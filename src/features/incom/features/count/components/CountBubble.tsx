import { shorthandNumber } from "@shared/utils/stringHelper";
import { ComponentProps, MouseEvent, useMemo, useState } from "react";

interface CountBubbleProps extends ComponentProps<"div"> {
    count: number | string | null;
}

export default function CountBubble(props: CountBubbleProps) {
    const {
        count,

        onMouseEnter,
        onMouseLeave
    } = props;
    const [hover, setHover] = useState(false);

    const handleMouseEnter = function(evt: MouseEvent<HTMLDivElement>) {
        setHover(true);

        onMouseEnter?.(evt);
    }

    const handleMouseLeave = function(evt: MouseEvent<HTMLDivElement>) {
        setHover(false);

        onMouseLeave?.(evt);
    }

    const displayedCount = useMemo(() => {
        if (count === null) return "..";
        if (typeof count === 'string') return count;
        return count.toString();
    }, [count]);

    return count !== 0 ? (
        <div 
            className="flex items-center px-2 py-1 rounded-full text-xs bg-red-400 text-white"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {displayedCount}
        </div>
    ) : null;
}