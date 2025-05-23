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
import Signup from "@/src/components/molecules/Signup";
import axios from "axios";
import baseURL from "../../store/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const Login = () => {
  const [visible, setVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [phoneNo, setPhoneNo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const topHeight = useRef(new Animated.Value(1)).current;
  const bottomTranslateY = useRef(new Animated.Value(100)).current;
  const phoneLabelAnim = useRef(new Animated.Value(0)).current;
  const passwordLabelAnim = useRef(new Animated.Value(0)).current;

  const handleLogin = async () => {
    if (phoneInput.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    if (!password) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    const formattedPhone = `+91${phoneInput}`;

    try {
      setLoading(true);
      const res = await axios.post(`${baseURL}/user/login`, {
        phoneNo: formattedPhone,
        password,
      });
      console.log(res);
      console.log("Access Token", res.data.accessToken);
      

      if (res.status === 200) {
        await AsyncStorage.setItem("accessToken", res.data.accessToken);
        router.replace("/(main)");
      }
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchToSignup = () => {
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

  const handlePhoneFocus = () => {
    setIsFocused(true);
    Animated.timing(phoneLabelAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handlePhoneBlur = () => {
    setIsFocused(false);
    if (phoneInput === "") {
      Animated.timing(phoneLabelAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
    Animated.timing(passwordLabelAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
    if (password === "") {
      Animated.timing(passwordLabelAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const phoneLabelStyle = {
    position: "absolute",
    left: 12,
    top: phoneLabelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [12, -10],
    }),
    fontSize: phoneLabelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: customColors.primary_black,
    backgroundColor: customColors.primary_white,
    paddingHorizontal: 4,
  };

  const passwordLabelStyle = {
    position: "absolute",
    left: 12,
    top: passwordLabelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [12, -10],
    }),
    fontSize: passwordLabelAnim.interpolate({
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
            {visible && !isSignup && (
              <View style={styles.login_container}>
                <Text style={styles.title}>Login</Text>

                <View style={styles.input_container}>
                  <View style={styles.input_box}>
                    <Animated.Text style={phoneLabelStyle}>Phone</Animated.Text>
                    <TextInput
                      keyboardType="numeric"
                      style={styles.text_input}
                      onFocus={handlePhoneFocus}
                      onBlur={handlePhoneBlur}
                      value={phoneInput}
                      maxLength={10}
                      onChangeText={(text) => {
                        setPhoneInput(text);
                        if (text !== "" && !isFocused) {
                          Animated.timing(phoneLabelAnim, {
                            toValue: 1,
                            duration: 200,
                            useNativeDriver: false,
                          }).start();
                        } else if (text === "" && !isFocused) {
                          Animated.timing(phoneLabelAnim, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: false,
                          }).start();
                        }
                      }}
                    />
                  </View>

                  <View style={styles.input_box}>
                    <Animated.Text style={passwordLabelStyle}>
                      Password
                    </Animated.Text>
                    <TextInput
                      style={styles.text_input}
                      secureTextEntry
                      onFocus={handlePasswordFocus}
                      onBlur={handlePasswordBlur}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (text !== "" && !passwordFocused) {
                          Animated.timing(passwordLabelAnim, {
                            toValue: 1,
                            duration: 200,
                            useNativeDriver: false,
                          }).start();
                        } else if (text === "" && !passwordFocused) {
                          Animated.timing(passwordLabelAnim, {
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
                      <Text>Don't have an account? </Text>
                      <TouchableOpacity onPress={switchToSignup}>
                        <Text style={styles.highlight_text}>Sign up</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <BtnComp
                    loading={loading}
                    title={"Login"}
                    customStyles={{ marginTop: 20 }}
                    onPress={handleLogin}
                  />
                </View>

                <View
                  style={{ justifyContent: "flex-end", alignItems: "baseline" }}
                >
                  <Text style={{ fontSize: 10 }}>Designed By</Text>
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
                <Signup onBack={() => setIsSignup(false)} />
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
  },
  input_container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 20,
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
