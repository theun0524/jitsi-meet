import { ReducerRegistry } from "../../features/base/redux";
import { getAuthServerURL } from "../../api/AuthApi";

const SAVE_AUTHENTICATED_SERVER_URL = "SAVE_AUTHENTICATED_SERVER_URL";
const STORE_NAME = "serverURL";

// action
export const setAuthenticatedServerUrl = () => {
  return (dispatch, getState) => {
    dispatch({
      type: SAVE_AUTHENTICATED_SERVER_URL,
      authenticatedServerURL: getAuthServerURL(getState()),
    });
  };
};

export const removeAuthenticatedServerUrl = () => {
  return {
    type: SAVE_AUTHENTICATED_SERVER_URL,
    authenticatedServerURL: "",
  };
};

ReducerRegistry.register(
  STORE_NAME,
  (state = { authenticatedServerURL: "" }, action) => {
    switch (action.type) {
      case SAVE_AUTHENTICATED_SERVER_URL:
        return {
          ...state,
          authenticatedServerURL: action.authenticatedServerURL,
        };
      default:
        return state;
    }
  }
);
