import { ReducerRegistry } from "../../features/base/redux";

const STORE_NAME = "user";
const SET_USER = "set_user";

// action
export const setUserInfo = ({ email, username, name }) => {
  return {
    type: SET_USER,
    userInfo: {
      email,
      username,
      name,
    },
  };
};

ReducerRegistry.register(
  STORE_NAME,
  (state = { userInfo: undefined }, action) => {
    switch (action.type) {
      case SET_USER:
        return {
          ...state,
          userInfo: action.userInfo,
        };
      default:
        return state;
    }
  }
);
