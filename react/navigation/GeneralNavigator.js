import React, { useEffect } from "react";
import LoginScreen from "../screens/LoginScreen/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen/RegisterScreen";
import PasswordResetScreen from "../screens/PasswordResetScreen/PasswordResetScreen";
import { useSelector, useDispatch, useStore } from "react-redux";
import AccountSettingScreen from "../screens/AccountSettingScreen/AccountSettingScreen";
import { setJWT } from "../features/base/jwt";
import { tokenLocalStorage } from "../api/AuthApi";

const GeneralNavigator = ({ Home }) => {
  const dispatch = useDispatch();
  const store = useStore();
  const currScreen = useSelector((store) => store.screen.currScreen);
  useEffect(() => {
    console.log(currScreen);
  }, [currScreen]);

  const checkTokenForAutoLogin = () => {
    const token = tokenLocalStorage.getItem(store.getState());
    if (token) {
      dispatch(setJWT(token));
    }
  };
  useEffect(() => {
    checkTokenForAutoLogin();
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
