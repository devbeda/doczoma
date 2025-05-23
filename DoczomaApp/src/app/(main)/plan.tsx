import {
  Alert,
  Animated,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { moderateScale } from "react-native-size-matters";
import customColors from "@/src/constants/customColours";
import PlanCard from "@/src/components/atoms/PlanCard";
import BtnComp from "@/src/components/atoms/BtnComp";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import axios from "axios";
import baseURL from "@/src/store/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Razorpay from "react-native-razorpay";


const plan = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const footerAnim = useRef(new Animated.Value(100)).current;
  const [plans, setPlans] = useState([]);
  const [userPlan, setUserPlan] = useState();
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get(`${baseURL}/admin/getplan`);
        setPlans(response.data.plans);
      } catch (error) {
        console.error("Failed to fetching plans", error);
      }
    };

    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const res = await axios.get(`${baseURL}/user/getuser`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserPlan(res.data.user.choosedPlan._id);
      } catch (error) {
        console.error("Failed to fetching user", error);
      }
    };

    fetchPlans();
    fetchUser();
  }, []);

  useEffect(() => {
    Animated.timing(footerAnim, {
      toValue: selectedIndex !== null ? 50 : 300, // Show footer when plan is selected
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [selectedIndex]);

  const handlePlanSelect = (index: number) => {
    setSelectedIndex(index);
    setSelectedPlan(plans[index]);
  };

  const initiatePayment = async () => {
  if (!selectedPlan) return;

  setLoading(true);
  try {
    const token = await AsyncStorage.getItem("accessToken");

    // 1. Get user details for prefill
    const userRes = await axios.get(`${baseURL}/user/getuser`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = userRes.data.user;

    // 2. Create payment order
    const orderResponse = await axios.post(
      `${baseURL}/user/create-order`,
      {
        amount: selectedPlan.planPrice,
        planId: selectedPlan._id,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const order = orderResponse.data.order;

    // 3. Razorpay checkout options
    const options = {
      description: `Payment for ${selectedPlan.planName}`,
      image: "https://your-logo-url.png", // Replace with your actual logo URL
      currency: "INR",
      key: "rzp_test_abc123xyz456",
 // Set in your .env
      amount: order.amount.toString(),
      name: "Your App Name",
      order_id: order.id,
      prefill: {
        email: user.email || "user@example.com",
        contact: user.phone || "9999999999",
        name: user.name || "User Name",
      },
      theme: { color: customColors.primary_orange },
    };

    // 4. Open Razorpay checkout
    const paymentResponse = await Razorpay.open(options);

    // 5. Verify payment
    if (paymentResponse.razorpay_payment_id) {
      const verification = await axios.post(
        `${baseURL}/user/verify-payment`,
        {
          razorpay_order_id: order.id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (verification.data.success) {
        Alert.alert("Success", "Payment successful!");
        // Optional: update plan status or navigate
      } else {
        Alert.alert("Error", "Payment verification failed.");
      }
    }
  } catch (error) {
    if (error?.code === "ECANCELED") {
      Alert.alert("Info", "Payment cancelled by user.");
    } else {
      console.error("Payment error:", error);
      Alert.alert("Error", "Payment failed. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Pressable
        onPress={() => setSelectedIndex(null)}
        style={styles.main_container}
      >
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.back_button}
            onPress={() => navigation.goBack()}
          >
            <Entypo name="chevron-thin-left" size={24} />
          </TouchableOpacity>
          <View style={styles.heading_container}>
            <Text style={styles.heading_text}>Our Plans</Text>
            <Text style={styles.plan_description}>
              Select a plan to continue and start enjoying the benefits today.
            </Text>
          </View>

          <View style={styles.plans}>
            {plans.map((plan, index) => (
              <PlanCard
                key={index}
                plan={plan}
                isSelected={selectedIndex === index}
                isActive={userPlan === plan._id}
                onPress={() => handlePlanSelect(index)}
              />
            ))}
          </View>
        </View>

        <Animated.View
          style={[
            styles.footer_main_container,
            { transform: [{ translateY: footerAnim }] },
          ]}
        >
          <View style={styles.footer_container}>
            <BtnComp
              title={loading ? "Processing..." : "Continue"}
              onPress={initiatePayment}
              disabled={loading || selectedIndex === null}
            />
            <View style={styles.terms_text_container}>
              <Text style={styles.terms_text}>Terms & Conditions</Text>
              <Text style={styles.terms_text}>Privacy Policy</Text>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </SafeAreaView>
  );
};

export default plan;

const styles = StyleSheet.create({
  main_container: {
    flex: 1,
    width: "100%",
    backgroundColor: customColors.primary_white,
  },
  back_button: {
    width: "100%",
    alignItems: "flex-start",
    // backgroundColor: "red"
    paddingHorizontal: moderateScale(20),
  },
  container: {
    // flex: 1,
    height: "75%",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: moderateScale(19),
    backgroundColor: customColors.primary_white,
  },
  heading_container: {
    width: "75%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: moderateScale(15),
    // backgroundColor: "red"
  },
  heading_text: {
    fontSize: moderateScale(20),
    fontFamily: "Montserrat-Bold",
    borderBottomColor: customColors.primary_black,
    borderBottomWidth: 2,
    color: customColors.primary_black,
  },
  plan_description: {
    textAlign: "center",
    fontSize: moderateScale(15),
    paddingVertical: moderateScale(10),
    fontFamily: "Montserrat-Medium",
    color: customColors.primary_light_blue,
    marginBottom: moderateScale(10),
  },
  plans: {
    width: "100%",
    paddingHorizontal: moderateScale(15),
    gap: moderateScale(10),
  },

  footer_main_container: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: customColors.primary_white,
  },

  footer_container: {
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: moderateScale(10),
    // backgroundColor: "red",
    marginBottom: moderateScale(8),
    borderRadius: moderateScale(30),
    gap: moderateScale(10),
    paddingVertical: moderateScale(8),
    borderWidth: 1,
    borderColor: customColors.primary_light_blue,
    // backgroundColor: customColors.primary_light_blue
  },
  terms_text_container: {
    flexDirection: "row",
    gap: moderateScale(20),
  },
  terms_text: {
    fontSize: moderateScale(8),
    fontFamily: "NotoSerif-Medium",
  },
  policy_text: {},
});
