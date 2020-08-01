import React from "react";
import { ActivityIndicator, View, Text, TextInput } from "react-native";
import { DARK_GRAY, LIGHT_GRAY } from "../../consts/colors";

const AccountSettingForm = ({
  label,
  editable,
  value,
  description,
  status,
  onBlur,
}) => {
  return (
    <View>
      <Text style={{ ...styles.label, paddingTop: 15, paddingBottom: 8 }}>
        {label}
      </Text>
      {editable === false ? (
        <Text style={{ fontSize: 22, color: DARK_GRAY }}>{value}</Text>
      ) : (
        <TextInput
          autoCorrect={false}
          autoCapitalize={false}
          editable={editable}
          value={value}
          style={{ ...styles.textInput }}
          onBlur={onBlur}
        ></TextInput>
      )}
      {status === "saving" && (
        <View
          style={{ ...styles.savingText, paddingTop: 8, paddingBottom: 20 }}
        >
          <ActivityIndicator />
          <Text style={{ marginLeft: 4, color: DARK_GRAY }}>Saving...</Text>
        </View>
      )}
      {status === "saved" && (
        <View
          style={{ ...styles.savingText, paddingTop: 8, paddingBottom: 20 }}
        >
          <ActivityIndicator />
          <Text style={{ marginLeft: 4, color: DARK_GRAY }}>Saved</Text>
        </View>
      )}
      {!status && (
        <Text
          style={{ ...styles.description, paddingTop: 8, paddingBottom: 15 }}
        >
          {description}
        </Text>
      )}
    </View>
  );
};

const styles = {
  label: {
    fontSize: 18,
    fontWeight: "300",
  },
  textInput: {
    borderColor: LIGHT_GRAY,
    borderWidth: 1,
    height: 32,
    paddingHorizontal: 10,
  },
  savingText: {
    fontSize: 14,
    flexDirection: "row",
  },
  description: {
    color: DARK_GRAY,
    fontSize: 14,
  },
};

export default AccountSettingForm;
