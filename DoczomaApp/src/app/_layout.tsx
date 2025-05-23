import React, { useEffect, useState } from "react";
import { Slot, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Provider } from "react-redux";
import store from "../store/store";

SplashScreen.preventAutoHideAsync();

function AppLayout() {
  const router = useRouter();
  const [appReady, setAppReady] = useState(false);
  const [fontsLoaded] = useFonts({
    "NotoSerif-Medium": require("../assets/fonts/NotoSerif-Medium.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    console.log(token);
    
    if (token) {
      router.replace("/(main)");
    } else {
      router.replace("/(auth)");
    }
  };

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      setAppReady(true);
      checkLoginStatus(); // move navigation here
    }
  }, [fontsLoaded]);

  if (!appReady) return null;

  return <Slot />;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppLayout />
    </Provider>
  );
}
