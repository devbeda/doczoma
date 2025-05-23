import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { moderateScale } from "react-native-size-matters";
import customColors from "@/src/constants/customColours";

const BtnComp = ({ loading, title, onPress, customStyles }: any) => {
  return (
    <>
      <TouchableOpacity
        style={[styles.button, customStyles]}
        activeOpacity={0.6}
        onPress={onPress}
      >
        {loading ? (
          <ActivityIndicator size={moderateScale(15)} />
        ) : (
          <Text style={styles.button_text}>{title}</Text>
        )}
      </TouchableOpacity>
    </>
  );
};

export default BtnComp;

const styles = StyleSheet.create({
  button: {
    width: "80%",
    height: 50,
    backgroundColor: customColors.primary_orange,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: moderateScale(9),
  },
  button_text: {
    textAlign: "center",
    fontSize: moderateScale(16),
    color: "white",
  },
});
