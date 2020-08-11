import { ReducerRegistry } from "../../features/base/redux";

const TRY_AFTER_LOGIN = "TRY_AFTER_LOGIN";
const INIT = "INIT";
const STORE_NAME = "deeplink";

// action
export const tryAfterLogin = () => {
  return {
    type: TRY_AFTER_LOGIN,
    tryAfterLogin: true,
  };
};

export const initDeeplink = () => {
  return {
    type: INIT,
    tryAfterLogin: false,
  };
};

ReducerRegistry.register(
  STORE_NAME,
  (state = { tryAfterLogin: false }, action) => {
    switch (action.type) {
      case TRY_AFTER_LOGIN:
        return {
          ...state,
          tryAfterLogin: action.tryAfterLogin,
        };
      case TRY_AFTER_LOGIN:
        return {
          ...state,
          tryAfterLogin: action.tryAfterLogin,
        };
      default:
        return state;
    }
  }
);
