import React, { useEffect } from "react";
import LoginScreen from "../screens/LoginScreen/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen/RegisterScreen";
import PasswordResetScreen from "../screens/PasswordResetScreen/PasswordResetScreen";
import { useSelector, useDispatch } from "react-redux";
import { JWT_TOKEN } from "../config";
import { setScreen } from "../redux/screen/screen";
import AccountSettingScreen from "../screens/AccountSettingScreen/AccountSettingScreen";
import { jitsiLocalStorage } from "@jitsi/js-utils";
import { setJWT } from "../features/base/jwt";

const GeneralNavigator = ({ Home }) => {
  const dispatch = useDispatch();
  const currScreen = useSelector((store) => store.screen.currScreen);
  useEffect(() => {
    console.log(currScreen);
  }, [currScreen]);

  const checkAuthorizedUser = () => {
    const token = jitsiLocalStorage.getItem(JWT_TOKEN);
    if (token) {
      dispatch(setJWT(token));
      dispatch(setScreen("Home"));
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
