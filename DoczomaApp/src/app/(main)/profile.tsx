import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import imagePaths from "@/src/constants/imagePaths";
import { moderateScale } from "react-native-size-matters";
import customColors from "@/src/constants/customColours";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import baseURL from "@/src/store/baseUrl";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";


// Reusable field component
const EditableField = ({
  label,
  value,
  editable,
  isEditable,
  onEditPress,
  onChangeText,
}: {
  label: string;
  value: string;
  editable?: boolean;
  isEditable?: boolean;
  onEditPress?: () => void;
  onChangeText?: (text: string) => void;
}) => (
  <View style={styles.fieldContainer}>
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditable ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.textInput}
        />
      ) : (
        <Text style={styles.fieldValue}>{value}</Text>
      )}
    </View>
    {editable && (
      <TouchableOpacity onPress={onEditPress}>
        <AntDesign name="edit" size={14} color={customColors.royal_brown} />
      </TouchableOpacity>
    )}
  </View>
);

const Profile = () => {
  const [isNameEdit, setIsNameEdit] = useState(false);
  const [isEmailEdit, setIsEmailEdit] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState(null);

  const [originalData, setOriginalData] = useState({ name: "", email: "" });

  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const res = await axios.get(`${baseURL}/user/getuser`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = res.data.user;
        setUser(userData);
        setName(userData.fullName || "");
        setEmail(userData.email || "");
        setPhone(userData.phoneNo || ""); // Optional: If phone is returned
        setPlan(userData?.choosedPlan);
        setOriginalData({
          name: userData.name || "",
          email: userData.email || "",
        });
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };

    fetchUser();
  }, []);

  const hasChanges = name !== originalData.name || email !== originalData.email;

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await axios.put(
        `${baseURL}/user/updateuser`,
        { name, email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOriginalData({ name, email });
      setIsNameEdit(false);
      setIsEmailEdit(false);
      console.log("Profile updated successfully", res.data);
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  // console.log("plan",plan);
  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      await axios.post(
        `${baseURL}/user/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Clear access token from storage
      await AsyncStorage.removeItem("accessToken");

      // Navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: "login" }], // replace "Login" with your actual login route name
      });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.topContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Entypo name="chevron-thin-left" size={24} />
        </TouchableOpacity>
        <Text style={styles.headingText}>My Profile</Text>
        <TouchableOpacity disabled={!hasChanges} onPress={handleSave}>
          <Text
            style={[
              styles.saveText,
              hasChanges && {
                color: customColors.primary_orange,
                fontWeight: "600",
              },
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Image */}
      <View style={styles.imageContainer}>
        <Image source={imagePaths.profile_pic} style={styles.profileImage} />
      </View>

      {/* Info Fields */}
      <View style={styles.infoContainer}>
        <EditableField
          label="Full Name"
          value={name}
          editable
          isEditable={isNameEdit}
          onEditPress={() => setIsNameEdit(true)}
          onChangeText={setName}
        />
        <EditableField
          label="Email"
          value={email}
          editable
          isEditable={isEmailEdit}
          onEditPress={() => setIsEmailEdit(true)}
          onChangeText={setEmail}
        />
        <EditableField label="Phone Number" value={phone} />
        <View style={styles.plan_container}>
          <View style={styles.plan_heading_container}>
            <Text style={styles.plan_heading_text}>Your Plan</Text>
          </View>
          <View style={styles.plan_buttom_container}>
            <Text style={styles.plan_text}>{plan?.planName}</Text>

            <View style={styles.plan_exp_container}>
              <Ionicons name="timer-outline" />
              <Text style={styles.exp_text}>
                :{" "}
                {new Date(user?.planExpiry).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ marginTop: 30, alignItems: "center" }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              // borderWidth:1,
              // borderColor: "#e74c3c",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 10,
              flexDirection: "row",
              justifyContent: 'center',
              alignItems: "center",
              gap: 10
            }}
          >
            <AntDesign name="logout" color={"#e74c3c"} />
            <Text style={{ color: "#e74c3c", fontWeight: "bold" }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topContainer: {
    height: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(15),
  },
  headingText: {
    fontFamily: "Montserrat-Bold",
    fontSize: moderateScale(20),
  },
  saveText: {
    fontSize: moderateScale(15),
    color: "#999",
  },
  imageContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    height: 150,
    width: 150,
    borderRadius: 100,
  },
  infoContainer: {
    paddingHorizontal: moderateScale(15),
  },
  fieldContainer: {
    height: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: customColors.royal_brown,
    borderBottomWidth: 0.5,
    paddingHorizontal: moderateScale(8),
  },
  fieldLabel: {
    fontSize: moderateScale(15),
    fontFamily: "Montserrat-Medium",
    color: "#000",
  },
  fieldValue: {
    fontSize: moderateScale(14),
    color: "#333",
  },
  textInput: {
    fontSize: moderateScale(14),
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    paddingVertical: 4,
    color: "#000",
  },

  plan_container: {
    height: 80,
    borderBottomColor: customColors.royal_brown,
    borderBottomWidth: 0.5,
    paddingHorizontal: moderateScale(8),
    alignItems: "center",
    justifyContent: "center",
  },
  plan_heading_container: {
    width: "100%",
  },
  plan_heading_text: {
    fontSize: moderateScale(15),
    fontFamily: "Montserrat-Medium",
    color: "#000",
  },
  plan_buttom_container: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  plan_text: {
    fontSize: moderateScale(14),
    color: "#333",
    fontWeight: 900,
  },
  plan_exp_container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  exp_text: {
    fontSize: moderateScale(14),
    color: "#333",
  },
});
