import React, { useEffect } from "react";
import LoginScreen from "../screens/LoginScreen/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen/RegisterScreen";
import PasswordResetScreen from "../screens/PasswordResetScreen/PasswordResetScreen";
import { useSelector, useDispatch } from "react-redux";
import AsyncStorage from "@react-native-community/async-storage";
import { JWT_TOKEN } from "../config";
import JwtDecode from "jwt-decode";
import { setScreen } from "../redux/screen/screen";
import { NativeModules, Platform } from "react-native";

const SUCCESS_CODE = "success";
const NO_INSTALL_CODE = "no_install";

const GeneralNavigator = ({ Home }) => {
  const dispatch = useDispatch();
  const currScreen = useSelector((store) => store.screen.currScreen);
  useEffect(() => {
    console.log(currScreen);
  }, [currScreen]);

  const checkAuthorizedUser = async () => {
    if (Platform.OS === "android") {
      NativeModules.SSOModule.getIsAuthenticated(
        (status, message) => {
          if (status === SUCCESS_CODE) {
            console.log(message);
            dispatch(setScreen("Home"));
          }
        },
        (err) => {
          console.log("error", err);
        }
      );
    }

    const token = await AsyncStorage.getItem(JWT_TOKEN);
    if (token) {
      const { context } = JwtDecode(token);
      if (context.user) {
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
  ) : (
    <LoginScreen />
  );
};

export default GeneralNavigator;
