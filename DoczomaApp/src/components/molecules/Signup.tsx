import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { moderateScale } from "react-native-size-matters";
import customColors from "@/src/constants/customColours";
import BtnComp from "../atoms/BtnComp";
import axios from "axios";
import baseURL from "../../store/baseUrl";
import { router } from "expo-router";

const Signup = () => {
  const [name, setName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Timer countdown effect
  useEffect(() => {
    if (!otpSent || timer === 0) return;

    const countdown = setInterval(() => {
      setTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [otpSent, timer]);

  const handleChangeOtp = (text: string, index: number) => {
    if (/^\d?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Move to next input
      if (text && index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else if (!text && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const isValidInput = () => {
    if (!/^\d{10}$/.test(phoneNo)) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid 10-digit phone number."
      );
      return false;
    }
    
    return true;
  };

  const sendOtp = async () => {
    if (!isValidInput()) return;

    try {
      setLoading(true);
      const res = await axios.post(`${baseURL}/user/sendotp`, {
        phoneNo: `+91${phoneNo}`,
      });

      if (res.status === 200) {
        setOtpSent(true);
        setTimer(30);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (timer > 0) return;

    try {
      setLoading(true);
      const res = await axios.post(`${baseURL}/user/sendotp`, {
        phoneNo: `+91${phoneNo}`,
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

  const verifyOtp = async () => {
    const otpStr = otp.join("");
    if (otpStr.length < 6) {
      Alert.alert("Invalid OTP", "Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${baseURL}/user/verify-otp`, {
        phoneNo: `+91${phoneNo}`,
        otp: otpStr,
      });

      if (res.status === 200) {
        setIsOtpVerified(true);
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      Alert.alert(
        "Verification Failed",
        error?.response?.data?.message || "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please enter and confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${baseURL}/user/signup`, {
        phoneNo: `+91${phoneNo}`,
        password,
        fullName: name,
      });

      if (res.status === 201) {
        Alert.alert("Success", "Account created successfully!");
        router.replace("/(auth)/login");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to create account"
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
      {!otpSent ? (
        <>
          <Text style={styles.title}>Sign Up</Text>
          <TextInput
            placeholder="Phone Number"
            keyboardType="number-pad"
            maxLength={10}
            style={styles.input}
            value={phoneNo}
            onChangeText={setPhoneNo}
          />
          <BtnComp style={{width:"100%"}} title="Send OTP" loading={loading} onPress={sendOtp} />
        </>
      ) : !isOtpVerified ? (
        <>
          <Text style={styles.title}>Enter OTP</Text>
          <View style={styles.otp_container}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(ref) => (inputRefs.current[idx] = ref)}
                style={styles.otp_input}
                maxLength={1}
                keyboardType="number-pad"
                value={digit}
                onChangeText={(text) => handleChangeOtp(text, idx)}
                autoFocus={idx === 0}
                textAlign="center"
              />
            ))}
          </View>

          <TouchableOpacity
            disabled={timer > 0 || loading}
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

          <BtnComp title="Verify OTP" loading={loading} onPress={verifyOtp} />
        </>
      ) : (
        <>
          <Text style={styles.title}>Set Password</Text>
          <TextInput
            placeholder="Password"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            placeholder="Confirm Password"
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <BtnComp
            title="Complete Signup"
            loading={loading}
            onPress={handleSignup}
          />
        </>
      )}
    </KeyboardAvoidingView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width:"100%",
    padding: moderateScale(20),
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "bold",
    marginBottom: moderateScale(20),
  },
  input: {
    width: 250,
    borderWidth: 1,
    borderColor: customColors.primary_black,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: moderateScale(16),
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
