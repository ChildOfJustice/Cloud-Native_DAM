import { Constants, DemoActions, IDemoState } from './types';

const init: IDemoState = {
  authToken: '',
  idToken: '',
  loading: false
};

export function demoReducer(state: IDemoState = init, action: DemoActions): IDemoState {
  switch (action.type) {
    case Constants.LOAD_STORE:
      const loadedState = localStorage.getItem('store')
      if (!loadedState){
        return {...state};
      }

      const loadedStateJSON = JSON.parse(loadedState) as IDemoState
      state.idToken = loadedStateJSON.idToken
      state.authToken = loadedStateJSON.authToken
      state.loading = loadedStateJSON.loading
      return {...state};
    case Constants.SAVE_STORE:
      localStorage.removeItem('store')
      localStorage.setItem('store', JSON.stringify(state))
      return {...state};
    case Constants.SET_ID_TOKEN:
      return {...state, ...action.payload};
    case Constants.SET_AUTH_TOKEN:
      return {...state, ...action.payload};
    case Constants.SET_LOADING:
      return {...state, ...action.payload};
    default:
      return state;
  }
}