import React, { useEffect, useState } from "react";
import LoginScreen from "../screens/LoginScreen/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen/RegisterScreen";
import PasswordResetScreen from "../screens/PasswordResetScreen/PasswordResetScreen";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-community/async-storage";
import { JWT_TOKEN } from "../config";
import JwtDecode from "jwt-decode";

const GeneralNavigator = ({ appProps, Home }) => {
  const currScreen = useSelector((store) => store.screen.currScreen);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    console.log(currScreen);
  }, [currScreen]);

  const checkAuthorizedUser = async () => {
    const token = await AsyncStorage.getItem(JWT_TOKEN);
    if (token) {
      const { context } = JwtDecode(token);
      if (context.user) {
        setIsAuthenticated(true);
      }
    }
  };
  useEffect(() => {
    checkAuthorizedUser();
  });

  return isAuthenticated && currScreen === "Home" ? (
    Home
  ) : currScreen === "Register" ? (
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
