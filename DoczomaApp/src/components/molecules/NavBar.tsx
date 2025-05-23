import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import customColors from "@/src/constants/customColours";
import imagePaths from "@/src/constants/imagePaths";
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";

const NavBar = ({
  user,
  open,
  toggleOpen,
}: {
  user: any;
  open: boolean;
  toggleOpen: () => void;
}) => {
  const expandAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Calculate storage percentage
  const calculateStoragePercentage = () => {
    if (!user || !user.choosedPlan || !user.storageOccupide) return 0;

    // Convert storageOccupide from bytes to GB
    const occupiedGB = user.storageOccupide / (1024 * 1024 * 1024);
    const storageLimitGB = user.choosedPlan.storageLimit;
    const percentage = (occupiedGB / storageLimitGB) * 100;

    // Cap at 100% if somehow over limit
    return Math.min(percentage, 100);
  };

  const formatStorage = (bytes: number): string => {
    const MB = bytes / (1024 * 1024);
    const GB = bytes / (1024 * 1024 * 1024);
    if (GB >= 1) {
      return `${GB.toFixed(2)} GB`;
    } else {
      return `${MB.toFixed(2)} MB`;
    }
  };

  const navigate_to_profile = () => {
    router.navigate("/(main)/profile");
  };
  const navigate_to_plan = () => {
    router.navigate("/(main)/plan");
  };

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: open ? 1 : 0,
      duration: 400,
      useNativeDriver: false,
    }).start();

    if (open) {
      const storagePercentage = calculateStoragePercentage();
      Animated.timing(progressAnim, {
        toValue: storagePercentage,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [open]);

  const heightInterpolate = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 70],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  console.log(user);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleOpen}
      activeOpacity={1}
    >
      <View style={styles.top_container}>
        <View style={styles.text_container}>
          <Text style={styles.welcome_text}>Welcome to </Text>
          <Text style={styles.name_text}>{user?.fullName}</Text>
          {user?.choosedPlan?.planName === "Free" && (
            <TouchableOpacity style={styles.upgrade_container}>
              <MaterialIcons
                name="star-rate"
                color={customColors.royal_green}
                style={styles.stars}
              />
              <Text style={styles.upgrade_text}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>
        <Image style={styles.profile_pic} source={imagePaths.profile_pic} />
      </View>

      {open && (
        <View style={styles.middle_container}>
          <Animated.View
            style={[styles.animated_container, { height: heightInterpolate }]}
          >
            <View style={styles.middle_text_container}>
              <Text style={styles.storage_title}>Your Storage</Text>
              <TouchableOpacity
                style={styles.upgrade_middle_container}
                onPress={navigate_to_plan}
              >
                <Text style={styles.upgrade_middle_text}>Upgrade</Text>
                <Feather name="chevrons-up" color={customColors.royal_green} />
              </TouchableOpacity>
            </View>
            <View style={styles.progress_track}>
              <Animated.View
                style={[styles.progress_fill, { width: progressWidth }]}
              />
            </View>
            <View style={styles.storage_details_container}>
              <View>
                <Text style={styles.storage_text}>Used: <Text style={styles.user_storage_text}>{formatStorage(user.storageOccupide)}</Text></Text>
              </View>
              <View>
                <Text style={styles.storage_text}>Total: <Text style={styles.plan_storage_text}>{user?.choosedPlan?.storageLimit?.toFixed(2)} GB</Text></Text>
              </View>
            </View>
          </Animated.View>
          <View style={styles.buton_main_container}>
            <TouchableOpacity
              style={styles.edit_button_container}
              onPress={navigate_to_profile}
            >
              <MaterialCommunityIcons
                name="account-edit-outline"
                size={16}
                color={customColors.primary_orange}
              />
              <Text style={styles.edit_text}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NavBar;

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: customColors.primary_black,
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(12),
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    width: "100%",
  },
  top_container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: verticalScale(10),
    alignItems: "center",
  },
  text_container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  welcome_text: {
    fontSize: moderateScale(17),
    color: customColors.primary_white,
    fontFamily: "Montserrat-Medium",
  },
  name_text: {
    color: customColors.primary_orange,
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Montserrat-Bold",
  },
  upgrade_container: {
    borderWidth: 0.5,
    borderColor: customColors.royal_green,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 5,
    position: "absolute",
    top: -2,
    right: -45,
    elevation: 5,
    // width:50
  },
  stars: {
    position: "absolute",
    top: -7.5,
  },
  upgrade_text: {
    color: customColors.royal_green,
    fontSize: 6,
    fontFamily: "Montserrat-Regular",
  },
  profile_pic: {
    width: 60,
    height: 60,
    borderRadius: 100,
  },
  middle_container: {
    width: "100%",
  },
  animated_container: {
    overflow: "hidden",
    width: "100%",
    borderBottomWidth: 2,
    borderTopWidth: 2,
    borderTopColor: customColors.royal_brown,
    borderBottomColor: customColors.royal_brown,
    justifyContent: "center",
  },
  middle_text_container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  upgrade_middle_container: {
    borderWidth: 0.5,
    borderColor: customColors.royal_green,
    paddingHorizontal: moderateScale(7),
    paddingVertical: moderateScale(1),
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  upgrade_middle_text: {
    color: customColors.royal_green,
    fontSize: 11,
    fontFamily: "Montserrat-Regular",
  },
  storage_title: {
    color: customColors.primary_white,
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
  },
  progress_track: {
    width: "100%",
    height: 10,
    backgroundColor: "#444",
    borderRadius: 10,
    overflow: "hidden",
    
  },
  progress_fill: {
    height: "100%",
    backgroundColor: customColors.primary_orange,
    borderRadius: 10,
  },
  storage_details_container:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storage_left_container:{
    alignItems: "center",
    justifyContent:"center"
  },
  storage_right_container:{
    alignItems: "center",
    justifyContent:"center"
  },
  user_storage_text:{
    color:customColors.primary_orange,
    fontSize: 10,
    fontFamily: "Montserrat-Bold",
  },
  plan_storage_text:{
    color: customColors.royal_brown,
    fontWeight: "bold",
    fontSize: 10,
    fontFamily: "Montserrat-Bold",
  },
  storage_text:{
    color: customColors.primary_white,
    fontSize: 10,
    fontFamily: "Montserrat-Regular",
  },
  buton_main_container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(10),
  },
  edit_button_container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: moderateScale(7),
    paddingVertical: scale(1),
    borderWidth: 0.5,
    borderColor: customColors.primary_orange,
    borderRadius: moderateScale(20),
    flexDirection: "row",
  },
  edit_text: {
    color: customColors.primary_orange,
    textAlign: "center",
    fontFamily: "Montserrat-Regular",
  },
});
