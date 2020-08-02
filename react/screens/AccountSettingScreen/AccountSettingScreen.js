import React, { useState } from "react";
import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setScreen } from "../../redux/screen/screen";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { LIGHT_GRAY, DARK_GRAY } from "../../consts/colors";
import BackButton from "../../features/base/react/components/native/BackButton";
import AccountSettingForm from "../../components/AccountSettingForm/AccountSettingForm";
import api from "../../api";
import * as validators from "../../utils/validator";
import AsyncStorage from "@react-native-community/async-storage";
import { JWT_TOKEN } from "../../config";
import JwtDecode from "jwt-decode";
import { setUserInfo } from "../../redux/user/user";

const iosStatusBarHeight = getStatusBarHeight();

const AccountSettingScreen = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector((store) => store.user.userInfo);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [fullNameStatus, setFullNameStatus] = useState("");

  const onBlurFullName = ({ nativeEvent: { text } }) => {
    setFullNameError(undefined);
    if (text !== userInfo.name) {
      if (!text || text.length < 2) {
        setFullNameError("name_too_short");
      } else {
        setFullNameStatus("saving");
        const form = { name: text };
        api.updateAccount(form).then(async (resp) => {
          const { error } = resp.data;
          if (error) {
            setFullNameError("문제가 발생했습니다");
            // 이 부분 에러에 따라서 에러 메세지 구문 나누기
          } else {
            const token = resp.data;
            await AsyncStorage.setItem(JWT_TOKEN, token);
            const { context } = JwtDecode(token);
            dispatch(setUserInfo(context.user));
            setFullNameError("");
            setFullNameStatus("saved");
            setTimeout(() => setFullNameStatus(""), 6000);
          }
        });
      }
    }
  };

  const onBlurEmail = ({ nativeEvent: { text } }) => {
    setEmailError(undefined);
    if (text !== userInfo.email) {
      if (!text || validators.email(text)) {
        setEmailError("invalid_params");
      } else {
        setEmailStatus("saving");
        const form = { email: text };
        api.updateAccount(form).then(async (resp) => {
          const { error } = resp.data;
          if (error) {
            setEmailError("문제가 발생했습니다");
            // 이 부분 에러에 따라서 에러 메세지 구문 나누기
          } else {
            const token = resp.data;
            await AsyncStorage.setItem(JWT_TOKEN, token);
            const { context } = JwtDecode(token);

            dispatch(setUserInfo(context.user));
            setEmailError("");
            setEmailStatus("saved");
            setTimeout(() => setEmailStatus(""), 6000);
          }
        });
      }
    }
  };

  const onResetPassword = () => {
    setLoading(true);
    api
      .passwordReset()
      .then(() => {
        console.log("reset password is sent.");
        setLoading(false);
      })
      .catch((error) => {
        console.error("onResetPassword is failed:", error.response);
        setLoading(false);
      });
  };

  return (
    <>
      <View style={{ ...styles.header }}>
        <BackButton
          style={{ color: "white" }}
          onPress={() => {
            dispatch(setScreen("Home"));
          }}
        />
        <Text style={{ color: "white", fontSize: 18 }}>Account Settings</Text>
        <View style={{ height: 32, width: 32, marginLeft: 12 }} />
      </View>
      <View style={{ ...styles.container }}>
        <AccountSettingForm
          editable={false}
          label={"Username"}
          value={userInfo.username}
          description={"The name that identifies you on this site."}
        />
        <AccountSettingForm
          onBlur={onBlurFullName}
          status={fullNameStatus}
          label={"Full Name"}
          defaultValue={userInfo.name}
          error={fullNameError}
          description={"The full name that is used for ID verification."}
        />
        <AccountSettingForm
          onBlur={onBlurEmail}
          status={emailStatus}
          label={"E-mail"}
          defaultValue={userInfo.email}
          error={emailError}
          description={"You receive messages from this site at this address."}
        />
        <View>
          <Text
            style={{
              fontSize: 18,
              paddingTop: 20,
              paddingBottom: 8,
              fontWeight: "300",
            }}
          >
            Password
          </Text>
          <TouchableOpacity
            onPress={onResetPassword}
            style={{
              width: 200,
              height: 40,
              borderColor: LIGHT_GRAY,
              borderWidth: 1,
              borderRadius: 5,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text
                style={{
                  color: DARK_GRAY,
                  fontWeight: "300",
                  fontSize: 16,
                }}
              >
                Password Reset
              </Text>
            )}
          </TouchableOpacity>
          <Text
            style={{
              color: DARK_GRAY,
              paddingTop: 8,
              paddingBottom: 5,
              fontSize: 14,
            }}
          >
            Check your email account for instructions to reset your password.
          </Text>
        </View>
      </View>
    </>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 10,
    paddingHorizontal: 24,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#44A5FF",
    color: "white",
    height: iosStatusBarHeight + 55,
    width: "100%",
    paddingHorizontal: 10,
    paddingTop: iosStatusBarHeight,
  },
};

export default AccountSettingScreen;
