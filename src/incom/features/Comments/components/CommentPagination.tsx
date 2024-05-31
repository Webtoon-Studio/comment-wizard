interface CommentPaginationProps {
	count: number;
	page: number;
	perPage: number;
	onPageChange: (newPage: number) => void;
}

export default function CommentPagination(props: CommentPaginationProps) {
	const { count, page, perPage, onPageChange } = props;

	if (perPage === 0) {
		return null;
	}

	const max = Math.ceil(count / perPage);
	
	return (
		<div className="h-16 flex items-center gap-2 select-none">
			<div
				className="cursor-pointer h-8 aspect-square flex justify-center items-center"
				onClick={() => onPageChange(0)}
			>
				{"<<"}
			</div>
			{Array.from(Array(max)).map((_, i) => (
				<div
					key={i}
					className={[
						"cursor-pointer h-8 aspect-square rounded-full bg-gray-100 text-sm flex justify-center items-center",
						"hover:text-webtoon",
						i === page ? "font-bold text-webtoon" : "text-black",
						i < max - 9 && page >= 5 && i <= page - 5 ? "hidden" : "",
						i >= 9 && i > page + 4 ? "hidden" : "",
					].join(" ")}
					onClick={() => onPageChange(i)}
				>
					{i + 1}
				</div>
			))}
			<div
				className="cursor-pointer h-8 aspect-square flex justify-center items-center"
				onClick={() => onPageChange(max - 1)}
			>
				{">>"}
			</div>
		</div>
	);
}