import CommentList from "@incom/features/Comments/components/CommentList";
import { useRef } from "react";

export const IS_PROD = (() => {
	try {
		return import.meta.env.PROD;
	} catch {
		return true;
	}
})();


export default function Main() {
	const ref = useRef<HTMLDivElement>(null);

	return (
		<div ref={ref} className="relative">
			{/* <div className="absolute left-0 top-[-4rem] w-[300px] h-[3rem] px-4 py-2 border-2 rounded-full bg-[#8c8c8c] text-white font-medium">
        <div className="h-full flex items-center">
          <span>Filter</span>

        </div>
      </div> */}
			<div className="">
				<CommentList />
			</div>
		</div>
	);
}
