import React, { useEffect, useState } from "react";
import LoginScreen from "../screens/LoginScreen/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen/RegisterScreen";
import PasswordResetScreen from "../screens/PasswordResetScreen/PasswordResetScreen";
import AsyncStorage from "@react-native-community/async-storage";
import { JWT_TOKEN } from "../config";
import JwtDecode from "jwt-decode";
import { useSelector } from "react-redux";

const GeneralNavigator = ({ appProps }) => {
  const currScreen = useSelector((store) => store.screen.currScreen);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const checkAuthorizedUser = async () => {
    const token = await AsyncStorage.getItem(JWT_TOKEN);
    if (token) {
      const { context } = JwtDecode(token);
      setIsAuthenticated(context.user);
    }
  };

  useEffect(() => {
    checkAuthorizedUser();
  }, []);

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
