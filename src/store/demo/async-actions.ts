import { Dispatch } from 'redux';
import * as actions from './actions';
import { DemoActions } from './types';

function sleep(timeout: number) {
    return new Promise<void>((resolve) => setTimeout(() => resolve(), timeout));
}

export async function addItemAsync(dispatch: Dispatch<DemoActions>, item: string) {
    dispatch(actions.setLoading(true));

    await sleep(1000);

    dispatch(actions.setAuthToken(item));
    dispatch(actions.setLoading(false));
}