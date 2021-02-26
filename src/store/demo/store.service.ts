import {Dispatch} from "redux";
import {DemoActions} from "./types";
import * as actions from "./actions";


export function loadStore(dispatch: Dispatch<DemoActions>) {
    dispatch(actions.loadStore());
}
export function saveStore(dispatch: Dispatch<DemoActions>) {
    dispatch(actions.saveStore());
}