import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import customColors from "@/src/constants/customColours";
import { moderateScale, scale } from "react-native-size-matters";

const PlanCard = ({ plan, isActive, isSelected, onPress }: any) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.main_container,
        {
          borderWidth: isSelected ? 1 : 0,
        },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: isSelected ? customColors.primary_orange : "#fff",
          },
        ]}
      >
        {isActive && (
          <View style={styles.active_plan_cointainer}>
            <Text>Active Plan</Text>
          </View>
        )}
        <View style={styles.left_container}>
          <Text
            style={[
              styles.name_text,
              {
                color: isSelected
                  ? customColors.primary_white
                  : customColors.primary_black,
              },
            ]}
          >
            {plan.planName}
          </Text>
          <Text style={styles.storage_text}>{plan.storageLimit} GB</Text>
        </View>
        <View style={styles.right_container}>
          <Text style={styles.symbol_text}>₹</Text>
          <Text style={styles.cost_text}>{plan.planPrice}</Text>
          <Text
            style={[
              styles.duration_text,
              {
                color: isSelected
                  ? customColors.primary_white
                  : customColors.primary_black,
              },
            ]}
          >
            / Mon
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default PlanCard;

const styles = StyleSheet.create({
  main_container: {
    width: "100%",
    height: 100,
    borderColor: customColors.primary_orange,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  container: {
    width: "100%",
    // height: "80",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: customColors.primary_orange,
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 20,
    position: "relative",
  },
  active_plan_cointainer: {
    position: "absolute",
    top: moderateScale(-1),
    left: moderateScale(2),
    backgroundColor: customColors.royal_green,
    borderTopLeftRadius: 40,
    borderBottomRightRadius: 20,
    paddingHorizontal: moderateScale(14),
  },
  left_container: {},
  right_container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: moderateScale(2),
  },
  name_text: {
    color: customColors.primary_black,
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
  },
  storage_text: {
    fontFamily: "Montserrat-Medium",
    color: customColors.primary_light_blue,
  },
  symbol_text: {
    top: moderateScale(-11),
    fontSize: moderateScale(15),
    fontFamily: "Montserrat-Bold",
    color: customColors.money_green,
  },
  cost_text: {
    color: customColors.money_green,
    fontSize: 35,
    fontFamily: "Montserrat-Bold",
  },
  duration_text: {
    fontSize: 15,
    fontFamily: "Montserrat-Medium",
    color: customColors.primary_blue,
  },
});
