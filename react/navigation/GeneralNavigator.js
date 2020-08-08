import React, { useEffect } from "react";
import LoginScreen from "../screens/LoginScreen/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen/RegisterScreen";
import PasswordResetScreen from "../screens/PasswordResetScreen/PasswordResetScreen";
import { useSelector, useDispatch } from "react-redux";
import { JWT_TOKEN } from "../config";
import JwtDecode from "jwt-decode";
import { setScreen } from "../redux/screen/screen";
import { setUserInfo } from "../redux/user/user";
import AccountSettingScreen from "../screens/AccountSettingScreen/AccountSettingScreen";
import { jitsiLocalStorage } from "@jitsi/js-utils";

const GeneralNavigator = ({ Home }) => {
  const dispatch = useDispatch();
  const currScreen = useSelector((store) => store.screen.currScreen);
  useEffect(() => {
    console.log(currScreen);
  }, [currScreen]);

  const checkAuthorizedUser = async () => {
    const token = await jitsiLocalStorage.getItem(JWT_TOKEN);
    if (token) {
      const { context } = JwtDecode(token);
      if (context.user) {
        dispatch(setUserInfo(context.user));
        dispatch(setScreen("Home"));
      } else {
        dispatch(setScreen("Login"));
      }
    } else {
      dispatch(setScreen("Login"));
    }
  };
  useEffect(() => {
    checkAuthorizedUser();
  }, []);

  return currScreen === "Home" ? (
    Home
  ) : currScreen === "Register" ? (
    <RegisterScreen />
  ) : currScreen === "Login" ? (
    <LoginScreen />
  ) : currScreen === "PasswordReset" ? (
    <PasswordResetScreen />
  ) : currScreen === "AccountSetting" ? (
    <AccountSettingScreen />
  ) : (
    <LoginScreen />
  );
};

export default GeneralNavigator;
