import React, { useState } from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import customColors from "@/src/constants/customColours";
import imagePaths from "@/src/constants/imagePaths";

const onboardingData = [
  {
    text: "Securely store your files in the cloud",
    image: imagePaths.folder_png,
  },
  {
    text: "Access your documents anytime, anywhere",
    image: imagePaths.access_png,
  },
];

const Auth = () => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < onboardingData.length - 1) {
      setStep(step + 1);
    } else {
      router.push("/login"); // change to your login route
    }
  };

  return (
    <LinearGradient
      colors={[customColors.primary_black,customColors.primary_black, "#0c0667"]} // Gradient colors
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.body_container}>
          <Image
            source={onboardingData[step].image}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.body_text}>{onboardingData[step].text}</Text>
        </View>

        <TouchableOpacity
          style={styles.footer_container}
          activeOpacity={0.7}
          onPress={handleNext}
        >
          <AntDesign name="swapright" style={styles.right_icon} />
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Auth;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: scale(50),
  },
  body_container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    gap:20
  },
  image: {
    height: 250,
  },
  body_text: {
    fontSize: 24,
    fontWeight: 600,
    color: customColors.primary_white,
    textAlign: "center",
    fontFamily: 'Montserrat-Regular'
  },
  footer_container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: customColors.primary_orange,
    height: 70,
    width: 70,
    borderRadius: 50,
    marginBottom: 20,
    
    shadowColor: customColors.primary_orange,
  shadowOffset: {
    width: 0,
    height: 0,
  },
  shadowOpacity: 0.3,
  shadowRadius: 0,

  // For Android
  elevation: 8,
  },
  right_icon: {
    fontSize: 40,
    color: customColors.primary_black,
  },
});
