import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, type RootState } from "@incom/common/store";
import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";

export const createAppSlice = buildCreateSlice({
    creators: { asyncThunk: asyncThunkCreator },
})

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();