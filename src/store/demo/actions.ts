import { action } from 'typesafe-actions';
import { Constants } from './types';

export function setAuthToken(authToken: string) {
    return action(Constants.SET_AUTH_TOKEN, {
        authToken
    });
}

export function setIdToken(idToken: string) {
    return action(Constants.SET_ID_TOKEN, {
        idToken
    });
}

export function setLoading(loading: boolean) {
    return action(Constants.SET_LOADING, {
        loading
    });
}

export function loadStore() {
    return action(Constants.LOAD_STORE, {});
}
export function saveStore() {
    return action(Constants.SAVE_STORE, {});
}
