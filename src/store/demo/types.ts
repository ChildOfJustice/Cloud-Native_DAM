import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export type DemoActions = ActionType<typeof actions>;

export interface IDemoState {
    //list: string[]
    authToken: string
    idToken: string
    loading: boolean
}

export enum Constants {
    SET_AUTH_TOKEN = 'SET_AUTH_TOKEN',
    SET_ID_TOKEN = 'SET_ID_TOKEN',
    SET_LOADING = 'SET_LOADING',
    LOAD_STORE = 'LOAD_STORE',
    SAVE_STORE = 'SAVE_STORE',
}
