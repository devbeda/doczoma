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

type OtpProps = {
  phoneNo: string;
  flow?: "login" | "signup";
};

const Otp = ({ phoneNo, flow = "login" }: OtpProps) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const router = useRouter();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (timer === 0) return;

    const countdown = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    if (/^\d?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Move focus to next input if a digit entered
      if (text !== "" && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      // Move back focus if empty and not the first input
      if (text === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const resendOtp = async () => {
    if (timer > 0) return;
    try {
      setLoading(true);
      const res = await axios.post(`${baseURL}/user/sendotp`, {
        phoneNo,
      });
      if (res.status === 200) {
        setTimer(30);
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Could not resend OTP"
      );
    } finally {
      setLoading(false);
    }
  };

const submitOtp = async () => {
  const otpStr = otp.join("");
  if (otpStr.length < 4) {
    Alert.alert("Invalid OTP", "Please enter the complete 4-digit OTP");
    return;
  }

  try {
    setLoading(true);
    const res = await axios.post(`${baseURL}/user/verify-signup-otp`, {
      phoneNo: `+91${phoneNo}`,
      otp: otpStr,
      name,
    });

    const { accessToken } = res.data;

    if (res.status === 200 && accessToken) {
      await AsyncStorage.setItem("accessToken", accessToken);
      Alert.alert("Success", "Signup successful!");
      router.push("/(tabs)/dashboard");
    } else {
      Alert.alert("Error", "Access token missing in response");
    }
  } catch (error) {
    console.error("Signup verification failed:", error);
    Alert.alert(
      "Verification Failed",
      error?.response?.data?.message || "Invalid OTP"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 4-digit OTP sent to {phoneNo}
      </Text>

      <View style={styles.otp_container}>
        {otp.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={(ref) => (inputRefs.current[idx] = ref)}
            style={styles.otp_input}
            maxLength={1}
            keyboardType="number-pad"
            value={digit}
            onChangeText={(text) => handleChange(text, idx)}
            autoFocus={idx === 0}
            textAlign="center"
          />
        ))}
      </View>

      <TouchableOpacity
        disabled={timer !== 0 || loading}
        onPress={resendOtp}
        style={[
          styles.resend_button,
          { opacity: timer === 0 && !loading ? 1 : 0.5 },
        ]}
      >
        <Text style={styles.resend_text}>
          {timer === 0 ? "Resend OTP" : `Resend OTP in ${timer}s`}
        </Text>
      </TouchableOpacity>

      <BtnComp title="Submit" loading={loading} onPress={submitOtp} />
    </KeyboardAvoidingView>
  );
};

export default Otp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: moderateScale(20),
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "bold",
    marginBottom: moderateScale(10),
  },
  subtitle: {
    fontSize: moderateScale(14),
    marginBottom: moderateScale(20),
    textAlign: "center",
  },
  otp_container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: moderateScale(20),
  },
  otp_input: {
    borderWidth: 1,
    borderColor: customColors.primary_black,
    borderRadius: 8,
    width: moderateScale(50),
    height: moderateScale(50),
    fontSize: moderateScale(24),
  },
  resend_button: {
    marginBottom: moderateScale(20),
  },
  resend_text: {
    color: customColors.primary_orange,
    fontWeight: "bold",
  },
});
