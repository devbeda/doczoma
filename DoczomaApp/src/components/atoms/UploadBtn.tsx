import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Foundation, MaterialIcons, Entypo } from "@expo/vector-icons";
import customColors from "@/src/constants/customColours";

const UploadBtn = ({ onCreateFolder, onUploadFile }: any) => {
  const [isUpload, setIsUpload] = useState(false);
  const folderAnim = useRef(new Animated.Value(0)).current;
  const uploadAnim = useRef(new Animated.Value(0)).current;

  const toggleOpen = () => {
    setIsUpload(!isUpload);
  };

  const handleOutsidePress = () => {
    if (isUpload) {
      setIsUpload(false);
    }
  };

  useEffect(() => {
    if (isUpload) {
      Animated.stagger(150, [
        Animated.timing(uploadAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(folderAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(uploadAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(folderAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isUpload]);

  return (
    <View style={styles.container}>
      {isUpload && (
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      )}
      
      <View style={styles.upload_container}>
        <Animated.View
          style={[
            styles.create_folder_container,
            {
              opacity: folderAnim,
              transform: [
                {
                  translateY: folderAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={onCreateFolder}>
            <MaterialIcons
              name="create-new-folder"
              size={18}
              color={customColors.primary_white}
            />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.cloud_upload_container,
            {
              opacity: uploadAnim,
              transform: [
                {
                  translateY: uploadAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={onUploadFile}>
            <Entypo
              name="upload"
              size={18}
              color={customColors.primary_white}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <TouchableOpacity 
        style={styles.buton_container} 
        onPress={toggleOpen}
        activeOpacity={0.7}
      >
        <Foundation
          name="upload-cloud"
          size={30}
          color={customColors.primary_orange}
        />
      </TouchableOpacity>
    </View>
  );
};

export default UploadBtn;

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    gap: 10,
    position: 'relative',
  },
  buton_container: {
    width: 75,
    height: 75,
    borderColor: customColors.primary_orange,
    borderWidth: 2,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: customColors.primary_white,
    zIndex: 10,
  },
  upload_container: {
    gap: 8,
    marginBottom: 10,
    position: 'absolute',
    bottom: 85,
    right: 0,
    zIndex: 9,
  },
  create_folder_container: {
    width: 55,
    height: 55,
    borderColor: customColors.primary_orange,
    borderWidth: 2,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: customColors.primary_orange,
  },
  cloud_upload_container: {
    width: 55,
    height: 55,
    borderColor: customColors.primary_orange,
    borderWidth: 2,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: customColors.primary_orange,
  },
});