import {
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { moderateScale } from "react-native-size-matters";
import imagePaths from "@/src/constants/imagePaths";
import customColors from "@/src/constants/customColours";
import BtnComp from "@/src/components/atoms/BtnComp";
import Otp from "@/src/components/molecules/Otp";
import Signup from "@/src/components/molecules/Signup";
import axios from "axios";
import baseURL from "../../store/baseUrl";

const Login = () => {
  const [visible, setVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [phoneNo, setPhoneNo] = useState("");
  const [loading, setLoading] = useState(false);

  const topHeight = useRef(new Animated.Value(1)).current;
  const bottomTranslateY = useRef(new Animated.Value(100)).current;
  const labelAnim = useRef(new Animated.Value(0)).current;

  const handleContinue = async () => {
    if (inputValue.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    const formattedPhone = `+91${inputValue}`;
    // setPhoneNo(formattedPhone);

    try {
      setLoading(true);
      const res = await axios.post(`${baseURL}/user/sendotp`, {
        phoneNo: formattedPhone,
      });

      if (res.status === 200) {
        setPhoneNo(formattedPhone);
        setIsOtpSent(true);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error sending OTP:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Something went wrong"
      );
    }
  };

  const switchToSignup = () => {
    setIsOtpSent(false);
    setIsSignup(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
      Animated.parallel([
        Animated.timing(topHeight, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(bottomTranslateY, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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

  const topContainerStyle = {
    flex: topHeight,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView style={styles.main_container}>
          <Animated.View style={topContainerStyle}>
            <Image source={imagePaths.app_logo} />
          </Animated.View>

          <Animated.View
            style={[
              styles.bottom_container,
              {
                transform: [{ translateY: bottomTranslateY }],
                opacity: visible ? 1 : 0,
              },
            ]}
          >
            {visible && !isSignup && !isOtpSent && (
              <View style={styles.login_container}>
                <View>
                  <Text style={styles.title}>Login</Text>
                </View>
                <View style={styles.input_container}>
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
                  <View style={{ alignItems: "flex-end", width: "80%" }}>
                    <View style={styles.no_account}>
                      <Text>Don’t </Text>
                      <TouchableOpacity onPress={switchToSignup}>
                        <Text style={styles.highlight_text}>
                          have an account
                        </Text>
                      </TouchableOpacity>
                      <Text>?</Text>
                    </View>
                  </View>
                  <BtnComp
                    loading={loading}
                    title={"Continue"}
                    customStyles={{ marginTop: 11 }}
                    onPress={handleContinue}
                  />
                </View>
                <View
                  style={{
                    justifyContent: "flex-end",
                    alignItems: "baseline",
                    
                  }}
                >
                  <Text style={{fontSize:10

                    
                  }}>Designed By</Text>

                  <Image
                    style={{ width: 100, marginLeft: 10 }}
                    height={20}
                    source={imagePaths.companyLogo}
                    resizeMode="contain"
                  />
                </View>
              </View>
            )}

            {isSignup && (
              <View style={styles.login_container}>
                <Signup />
              </View>
            )}

            {isOtpSent && (
              <View style={styles.login_container}>
                <Otp phoneNo={phoneNo} flow="login" />
              </View>
            )}
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default Login;

const styles = StyleSheet.create({
  main_container: {
    flex: 1,
    justifyContent: "flex-start",

    alignItems: "center",
    backgroundColor: customColors.primary_black,
  },
  bottom_container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: customColors.primary_white,
    width: "100%",
    borderTopLeftRadius: 100,
    paddingHorizontal: moderateScale(20),
  },
  login_container: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: moderateScale(30),
    gap: moderateScale(20),
    // backgroundColor: "red"
  },
  input_container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: customColors.primary_black,
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
