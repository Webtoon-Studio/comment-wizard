import { useEffect, useState } from "react";

export default function Loading() {
  const [count, setCount] = useState(0);

  const word = "LOADING...";

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCount((count + 1) % word.length);
    }, 500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [count]);

  return (
    <div className="font-medium transition space-x-1">
      {word.split("").map((chr, i) => (
        <span
          key={i}
          className={[
            "transition-all",
            count === i
              ? "text-webtoon animate-bounce scale-125"
              : "text-gray-300",
          ].join(" ")}
        >
          {chr}
        </span>
      ))}
    </div>
  );
}
