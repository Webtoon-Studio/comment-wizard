import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, type RootState } from "@incom/common/store";


export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();