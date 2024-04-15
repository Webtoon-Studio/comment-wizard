import { ComponentColorType } from "@popup/src/interface";

export function getColorClass(color: ComponentColorType) {
  switch (color) {
    case "disabled":
      return "bg-gray-light text-gray-dark border-gray-light";
    case "none":
      return "bg-inherit text-inherit border-inherit";
    case "gray":
      return "bg-gray-light text-black border-gray-light";
    case "default":
    default:
      return "bg-webtoon text-white border-webtoon";
  }
}

export function getHoverColorClass(color: ComponentColorType) {
  switch (color) {
    case "disabled":
    case "none":
      return "";
    case "gray":
      return "hover:bg-gray";
    case "default":
    default:
      return "hover:bg-webtoon-dark";
  }
}
