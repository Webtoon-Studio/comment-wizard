import { IEpicom } from "@root/src/incom/interfaces";
import { useState } from "react";

export default function PostList() {
  const [posts, setPosts] = useState<IEpicom[] | null>(null);

  return (
    <div>
      <ul></ul>
    </div>
  );
}
