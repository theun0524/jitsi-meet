import React, { useState, useEffect } from "react";
import { View, Image, Text, KeyboardAvoidingView } from "react-native";
import { DARK_GRAY, MAIN_BLUE } from "../../consts/colors";
import AutoLoginCheckBox from "../../components/AutoLoginCheckBox/AutoLoginCheckBox";
import Form from "../../components/Form/Form";
import PostechLoginButton from "../../components/PostechLoginButton/PostechLoginButton";
import TextDivider from "../../components/TextDivider/TextDivider";
import SubmitButton from "../../components/SubmitButton/SubmitButton";
import InputLabel from "../../components/InputLabel/InputLabel";
import { postech_logo } from "../../assets";
import { screenState } from "../../modules/navigator";
import AsyncStorage from "@react-native-community/async-storage";
import { useSetRecoilState } from "recoil";
import * as validators from "../../utils/validator";
import api from "../../api";
import { JWT_TOKEN } from "../../config";
import { useTranslation } from "react-i18next";

const STATUS_BAR_HEIGHT = 40; // TODO : add react-native-status-bar-height library
// import {getStatusBarHeight} from 'react-native-status-bar-height';
// const iosStatusBarHeight = getStatusBarHeight();

const LoginScreen = () => {
  const { t, i18n } = useTranslation();
  const setScreen = useSetRecoilState(screenState);
  const navigate = (to) => {
    setScreen(to);
  };
  useEffect(() => {
    console.log(i18n);
  });
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameValid, setUsernameValid] = useState(null);
  const [passwordValid, setPasswordValid] = useState(null);
  const [usernameErrorMsg, setUsernameErrorMsg] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");

  const onPressPostechLoginButton = () => {};
  const onPressLoginSubmitButton = () => {
    setLoading(true);
    const form = { username, password, remember };
    api
      .login(form)
      .then(async (resp) => {
        const token = resp.data;
        await AsyncStorage.setItem(JWT_TOKEN, token);
        setLoading(false);
        navigate("Home");
      })
      .catch((err) => {
        const reason = err.response.headers["www-authenticate"];
        if (reason === "user_not_found") {
          setUsernameValid(false);
          setUsernameErrorMsg(t("error.usernameInvalid"));
        } else if (reason === "password_not_match") {
          setPasswordValid(false);
          setPasswordErrorMsg(t("error.passwordNotMatch"));
        }
        setLoading(false);
      });
  };

  const checkVaildUsername = (value) => {
    const error = validators.username(value);
    if (error) {
      setUsernameErrorMsg(t(error));
      return false;
    } else if (value === "") {
      setUsernameErrorMsg(t("error.usernameRequired"));
      return false;
    } else if (value && value.length < 5) {
      setUsernameErrorMsg(t("error.usernameTooShort"));
      return false;
    }
    return true;
  };

  const checkValidPassword = (value) => {
    if (value.length >= 8) {
      return true;
    } else if (value === "") {
      setPasswordErrorMsg(t("error.passwordRequired"));
      return false;
    }
    setPasswordErrorMsg(t("error.passwordTooShort"));
    return false;
  };

  const onChangeUsername = ({ nativeEvent: { text } }) => {
    setUsername(text);
    const validity = checkVaildUsername(text);
    setUsernameValid(validity);
  };

  const onChangePassword = ({ nativeEvent: { text } }) => {
    setPassword(text);
    const validity = checkValidPassword(text);
    setPasswordValid(validity);
  };

  const onChangeRememberCheckBox = () => {
    setRemember(!remember);
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      enabled
      style={{ ...styles.container }}
    >
      <Image
        source={postech_logo}
        style={{ width: 200, alignSelf: "center", paddingBottom: 160 }}
        resizeMode="contain"
      />
      <View>
        <InputLabel name={t("register.username")} necessary={true} />
        <Form
          placeholder={t("register.usernameExample")}
          value={username}
          onChange={onChangeUsername}
          valid={usernameValid}
          errorMessage={usernameErrorMsg}
        />
        <InputLabel name={t("register.password")} necessary={true} />
        <Form
          type="password"
          value={password}
          onChange={onChangePassword}
          valid={passwordValid}
          errorMessage={passwordErrorMsg}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingTop: 5,
            paddingBottom: 28,
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <AutoLoginCheckBox
              checked={remember}
              onChange={onChangeRememberCheckBox}
            />
            <Text>{t("login.remember")}</Text>
          </View>
          <Text
            style={{ color: MAIN_BLUE }}
            onPress={() => navigate("PasswordReset")}
          >
            {t("login.forgotPassword")}
          </Text>
        </View>
        <SubmitButton
          invalid={!(passwordValid && usernameValid)}
          name={t("login.title")}
          onPress={onPressLoginSubmitButton}
          loading={loading}
        />
        <Text
          style={{
            alignSelf: "center",
            paddingVertical: 20,
            color: DARK_GRAY,
          }}
          onPress={() => {
            navigate("Register");
          }}
        >
          {t("login.registerRequired")}
        </Text>
        <TextDivider text="or login with" />
        <PostechLoginButton onPress={onPressPostechLoginButton} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: STATUS_BAR_HEIGHT,
    paddingHorizontal: 24,
  },
};

export default LoginScreen;
