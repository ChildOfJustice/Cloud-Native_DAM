import {Dispatch} from "redux";
import {DemoActions} from "./types";
import * as actions from "./actions";


export function setAuthToken(dispatch: Dispatch<DemoActions>, token: string) {
    dispatch(actions.setAuthToken(token));
}
export function setIdToken(dispatch: Dispatch<DemoActions>, token: string) {
    dispatch(actions.setIdToken(token));
}

