import React, { useState } from "react";
import { View, Text } from "react-native";
import { useSetRecoilState } from "recoil";
import { screenState } from "../../modules/navigator";
import InputLabel from "../../components/InputLabel/InputLabel";
import SubmitButton from "../../components/SubmitButton/SubmitButton";
import Form from "../../components/Form/Form";
import { DARK_GRAY, LIGHT_GRAY } from "../../consts/colors";
import { useTranslation } from "react-i18next";

const STATUS_BAR_HEIGHT = 40; // TODO : add react-native-status-bar-height library
// import {getStatusBarHeight} from 'react-native-status-bar-height';
// const iosStatusBarHeight = getStatusBarHeight();

const PasswordResetScreen = () => {
  const { t, i18n } = useTranslation("vmeeting", { i18n });
  const setScreen = useSetRecoilState(screenState);
  const navigate = (to) => {
    setScreen(to);
  };
  const [email, setEmail] = useState("");
  const onChangeEmail = ({ nativeEvent: { text } }) => {
    setEmail(text);
  };
  const onPressClearButton = () => {
    setEmail("");
  };
  const onPressPasswordResetButton = () => {
    // const {email} = values;
    // setPasswordResetting(true);
    // api
    //   .passwordReset({email})
    //   .then((resp) => {
    //     const result = resp.data;
    //     if (result.success) {
    //       notification.success({
    //         message: t('passwordReset.success'),
    //         description: t('passwordReset.message'),
    //         duration: 0,
    //       });
    //       setVisible(false);
    //       setPasswordResetting(false);
    //     } else {
    //       notification.error({
    //         message: t('passwordReset.fail'),
    //         description:
    //           result.error === 'not_found'
    //             ? t('passwordReset.errorNotFound')
    //             : t('passwordReset.errorNotSent'),
    //       });
    //       setPasswordResetting(false);
    //     }
    //   })
    //   .catch((error) => {
    //     console.error(error.message);
    //     notification.error({
    //       message: t('passwordReset.fail'),
    //       description: error.message,
    //     });
    //     setPasswordResetting(false);
    //   });
  };
  return (
    <View style={{ ...styles.container }}>
      <Text style={{ ...styles.title }}>{t("passwordResetConfirm.title")}</Text>
      <Text style={{ paddingBottom: 40, color: DARK_GRAY, lineHeight: 20 }}>
        {t("passwordReset.description")}
      </Text>
      <InputLabel name={t("register.email")} necessary={true} />
      <Form
        value={email}
        onChange={onChangeEmail}
        onPressClearButton={onPressClearButton}
      />
      <Text style={{ paddingBottom: 20, color: LIGHT_GRAY }}>
        {t("passwordReset.emailHelp")}
      </Text>
      <SubmitButton
        name={t("passwordResetConfirm.title")}
        onPress={onPressPasswordResetButton}
      />
      <Text
        onPress={() => navigate("Login")}
        style={{ ...styles.navigateText }}
      >
        {t("passwordReset.backToLogin")}
      </Text>
    </View>
  );
};
const styles = {
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: STATUS_BAR_HEIGHT,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    paddingBottom: 24,
  },
  navigateText: {
    alignSelf: "center",
    paddingVertical: 20,
    color: DARK_GRAY,
  },
};
export default PasswordResetScreen;