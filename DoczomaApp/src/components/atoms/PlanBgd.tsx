import { StyleSheet, View } from "react-native";
import React from "react";
import { BlurView } from "expo-blur";
import customColors from "@/src/constants/customColours";

const PlanBgd = () => {
  return (
    <>
      <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.container}>
        <View style={styles.circule1} />
        <View style={styles.circule2} />
        <View style={styles.circule3} />
        <View style={styles.circule4} />
        <View style={styles.circule5} />
      </View>
    </>
  );
};

export default PlanBgd;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  circule1: {
    width: 150,
    height: 150,
    backgroundColor: customColors.primary_orange + "88", // semi-transparent
    borderRadius: 100,
    top: 60,
    left: 30,
    position: "absolute",
  },
  circule2: {
    width: 80,
    height: 80,
    borderColor: customColors.primary_orange,
    borderWidth: 2,
    borderRadius: 100,
    top: 60,
    left: 30,
    position: "absolute",
  },
  circule3: {
    width: 100,
    height: 100,
    backgroundColor: customColors.primary_orange + "66",
    borderRadius: 100,
    top: 300,
    left: 80,
    position: "absolute",
  },
  circule4: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderColor: customColors.primary_orange,
    borderRadius: 100,
    top: 300,
    left: 120,
    position: "absolute",
  },
  circule5: {
    width: 100,
    height: 100,
    backgroundColor: customColors.primary_orange + "44",
    borderRadius: 100,
    top: -500,
    left: 370,
    position: "absolute",
  },
});
