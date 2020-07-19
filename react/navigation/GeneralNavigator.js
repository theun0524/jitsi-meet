import React, { useEffect, useState } from "react";
import LoginScreen from "../screens/LoginScreen/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen/RegisterScreen";
import PasswordResetScreen from "../screens/PasswordResetScreen/PasswordResetScreen";
import { useSelector } from "react-redux";

const GeneralNavigator = ({ appProps }) => {
  const currScreen = useSelector((store) => store.screen.currScreen);

  useEffect(() => {
    console.log(currScreen);
  }, [currScreen]);

  return currScreen === "Register" ? (
    <RegisterScreen />
  ) : currScreen === "Login" ? (
    <LoginScreen />
  ) : currScreen === "PasswordReset" ? (
    <PasswordResetScreen />
  ) : (
    <LoginScreen />
  );
};

export default GeneralNavigator;
