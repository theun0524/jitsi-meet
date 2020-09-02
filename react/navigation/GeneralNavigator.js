import React, { useEffect } from "react";
import { useSelector, useDispatch, useStore } from "react-redux";
import AccountSettingScreen from "../screens/AccountSettingScreen/AccountSettingScreen";
import LoginScreen from "../screens/LoginScreen/LoginScreen";
import PasswordResetScreen from "../screens/PasswordResetScreen/PasswordResetScreen";
// import RegisterScreen from "../screens/RegisterScreen/RegisterScreen";

const SUCCESS_CODE = "success";
const NO_INSTALL_CODE = "no_install";

const GeneralNavigator = ({ Home }) => {
  const dispatch = useDispatch();
  const store = useStore();
  const currScreen = useSelector((store) => store.screen.currScreen);
  useEffect(() => {
    console.log(currScreen);
  }, [currScreen]);

  return currScreen === "Home" ? (
    Home
  ) : currScreen === "Register" ? (
    // <RegisterScreen />
    <></>
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
