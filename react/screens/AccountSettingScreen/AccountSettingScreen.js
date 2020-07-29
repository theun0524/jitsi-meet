import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setScreen } from "../../redux/screen/screen";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { LIGHT_GRAY, DARK_GRAY } from "../../consts/colors";
import BackButton from "../../features/base/react/components/native/BackButton";

const iosStatusBarHeight = getStatusBarHeight();

const AccountSettingForm = ({
  label,
  editable,
  value,
  description,
  saving,
}) => {
  return (
    <View>
      <Text
        style={{
          fontSize: 18,
          paddingTop: 15,
          paddingBottom: 8,
          fontWeight: "300",
        }}
      >
        {label}
      </Text>
      {editable === false ? (
        <Text style={{ fontSize: 22, color: DARK_GRAY }}>{value}</Text>
      ) : (
        <TextInput
          editable={editable}
          value={value}
          style={{
            borderColor: LIGHT_GRAY,
            borderWidth: 1,
            height: 32,
            paddingHorizontal: 10,
          }}
        ></TextInput>
      )}
      {saving ? (
        <View
          style={{
            paddingTop: 8,
            paddingBottom: 20,
            fontSize: 14,
            flexDirection: "row",
          }}
        >
          <ActivityIndicator />
          <Text style={{ marginLeft: 4, color: DARK_GRAY }}>Saving...</Text>
        </View>
      ) : (
        <Text
          style={{
            color: DARK_GRAY,
            paddingTop: 8,
            paddingBottom: 15,
            fontSize: 14,
          }}
        >
          {description}
        </Text>
      )}
    </View>
  );
};

const Line = () => {
  return (
    <View
      style={{ width: "100%", height: 1, backgroundColor: LIGHT_GRAY }}
    ></View>
  );
};

const AccountSettingScreen = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector((store) => store.user.userInfo);
  console.log(userInfo);
  const [loading, setLoading] = useState(false);

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
      <View
        style={{
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#4C9AFF",
          color: "white",
          height: iosStatusBarHeight + 55,
          width: "100%",
          paddingHorizontal: 10,
          paddingTop: iosStatusBarHeight,
        }}
      >
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
          label={"Full Name"}
          value={userInfo.fullname}
          description={"The full name that is used for ID verificatoin."}
        />
        <AccountSettingForm
          label={"E-mail"}
          value={userInfo.email}
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
            <Text
              style={{
                color: DARK_GRAY,
                fontWeight: "300",
                fontSize: 16,
              }}
            >
              Password Reset
            </Text>
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
};

export default AccountSettingScreen;
