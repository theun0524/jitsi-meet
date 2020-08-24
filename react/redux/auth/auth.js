import { ReducerRegistry } from "../../features/base/redux";

const SAVE_AUTHENTICATED_SERVER_URL = "SAVE_AUTHENTICATED_SERVER_URL";
const STORE_NAME = "serverURL";

// action
export const setAuthenticatedServerUrl = () => {
  return (dispatch, getState) => {
    const { locationURL } = getState()["features/base/connection"];
    dispatch({
      type: SAVE_AUTHENTICATED_SERVER_URL,
      authenticatedServerURL: locationURL,
    });
  };
};

export const eraseAuthenticatedServerUrl = () => {
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
