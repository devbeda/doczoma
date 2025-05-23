import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Animated,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import customColors from "@/src/constants/customColours";
import BtnComp from "../atoms/BtnComp";
import { moderateScale } from "react-native-size-matters";
import Otp from "./Otp";
import axios from "axios";
import baseURL from "@/src/store/baseUrl";

const Signup = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [phoneNo, setPhoneNo] = useState("");

  const labelAnim = useRef(new Animated.Value(0)).current;

  const handleContinue = async () => {
    if (inputValue.length !== 10) {
      return alert("Enter a valid phone number");
    }

    const formattedPhone = `+91${inputValue}`;
    try {
      const res = await axios.post(`${baseURL}/user/sendotp`, {
        phoneNo: formattedPhone,
      });
      if (res.status === 200) {
        setPhoneNo(formattedPhone);
        setIsOtpSent(true);
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Error sending OTP");
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(labelAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (inputValue === "") {
      Animated.timing(labelAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelStyle = {
    position: "absolute",
    left: 12,
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [12, -10],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: customColors.primary_black,
    backgroundColor: customColors.primary_white,
    paddingHorizontal: 4,
  };
  return (
    <View style={styles.input_container}>
      {!isOtpSent ? (
        <View style={styles.signup_container}>
          <Text style={styles.title}>SignUp</Text>
          <View style={styles.input_box}>
            <Animated.Text style={labelStyle}>Phone</Animated.Text>
            <TextInput
              keyboardType="numeric"
              style={styles.text_input}
              onFocus={handleFocus}
              onBlur={handleBlur}
              value={inputValue}
              maxLength={10}
              onChangeText={(text) => {
                setInputValue(text);
                if (text !== "" && !isFocused) {
                  Animated.timing(labelAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: false,
                  }).start();
                } else if (text === "" && !isFocused) {
                  Animated.timing(labelAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                  }).start();
                }
              }}
            />
          </View>
          <BtnComp
            title={"Continue"}
            customStyles={{ marginTop: 20 }}
            onPress={handleContinue}
          />
        </View>
      ) : (
        <View style={styles.otp_container}>
          <Otp phoneNo={phoneNo} flow="signup" />
        </View>
      )}
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: customColors.primary_black,
  },
  input_container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: "100%",
  },
  signup_container: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  input_box: {
    width: "80%",
    height: 50,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: customColors.primary_black,
    justifyContent: "center",
    paddingHorizontal: 12,
    position: "relative",
  },
  text_input: {
    fontSize: 16,
    paddingTop: 16,
  },
  otp_container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});
