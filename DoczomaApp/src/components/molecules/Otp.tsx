import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import customColors from "@/src/constants/customColours";
import BtnComp from "../atoms/BtnComp";
import { moderateScale } from "react-native-size-matters";
import baseURL from "@/src/store/baseUrl";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Otp = ({ phoneNo, flow }: any) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const router = useRouter();
  const [resendTimer, setResendTimer] = useState(120);

  const handleChange = (text, index) => {
    if (text.length > 1) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = text;
    setOtp(updatedOtp);

    if (text !== "" && index < inputs.current.length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      return Alert.alert("Invalid", "Enter complete 6-digit OTP");
    }

    try {
      setLoading(true);
      const url = `${baseURL}/user/${flow === "signup" ? "signup" : "login"}`;
      const response = await axios.post(url, {
        phoneNo,
        otp: code,
      });

      if (response.status === 200 || response.status === 201) {
        const accessToken = response.data.accessToken;
        await AsyncStorage.setItem("accessToken", accessToken);
        Alert.alert("Success", response.data.message);
        router.replace("/(main)");
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("OTP verification failed", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Something went wrong"
      );
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendTimer(120); // reset timer
      const url = `${baseURL}/user/send-otp`;
      const response = await axios.post(url, {
        phoneNo,
      });
      if (response.status === 200 || response.status === 201) {
        Alert.alert("OTP Sent", "A new OTP has been sent to your number.");
      }
    } catch (err) {
      console.error("Resend OTP failed", err);
      Alert.alert("Error", "Failed to resend OTP. Try again later.");
    }
  };

  useEffect(() => {
    if (resendTimer === 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, width: "100%" }}
    >
      <View style={styles.container}>
        <View style={styles.input_containers}>
          <Text style={styles.title}>OTP Verification</Text>
          <View style={styles.box_containers}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                keyboardType="numeric"
                maxLength={1}
                style={styles.input_box}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>
        </View>

        <View style={styles.text_container}>
          <View style={styles.no_account}>
            {resendTimer > 0 ? (
              <Text style={{ color: "gray" }}>
                Resend OTP in {Math.floor(resendTimer / 60)}:
                {(resendTimer % 60).toString().padStart(2, "0")}
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp}>
                <Text style={styles.highlight_text}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <BtnComp loading={loading} title={"Verify"} onPress={handleVerify} />
      </View>
    </KeyboardAvoidingView>
  );
};

export default Otp;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  input_containers: {
    gap: 7,
    height: 90,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: customColors.primary_black,
    textAlign: "center",
  },
  box_containers: {
    flexDirection: "row",
    gap: 10,
  },
  input_box: {
    width: 45,
    height: 45,
    borderColor: customColors.primary_black,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 20,
    textAlign: "center",
  },
  text_container: {
    width: "70%",
    height: 20,
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 4,
  },
  no_account: {
    fontSize: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  highlight_text: {
    fontWeight: "bold",
    color: customColors.primary_orange,
  },
});
