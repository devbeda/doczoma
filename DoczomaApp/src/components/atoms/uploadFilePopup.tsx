import customColors from "@/src/constants/customColours";
import baseURL from "@/src/store/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { moderateScale } from "react-native-size-matters";

const UploadFilePopup = ({
  visible,
  onClose,
  parentFolder,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  parentFolder?: string;
  onSuccess: () => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [customName, setCustomName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handlePickFromDevice = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Could not pick the file.");
    }
  };

  const handleCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (permission.status !== "granted") {
      Alert.alert("Permission Denied", "Camera access is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsEditing: true,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedFile({
        uri: asset.uri,
        name: `photo_${Date.now()}.jpg`,
        type: "image/jpeg",
        size: asset.fileSize || 0,
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert("Error", "No file selected");
      return;
    }

    setIsUploading(true);

    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) throw new Error("User not authenticated");

      const formData = new FormData();
      formData.append(
        "name",
        customName || selectedFile.name || `file_${Date.now()}`
      );

      if (parentFolder) {
        formData.append("parentFolder", parentFolder);
      }

      formData.append("file", {
        uri: selectedFile.uri,
        name: selectedFile.name || `file_${Date.now()}`,
        type: selectedFile.mimeType || "*/*",
      } as any);

      const response = await axios.post(
        `${baseURL}/file/uploadfile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", "File uploaded successfully", [
          {
            text: "OK",
            onPress: () => {
              onSuccess(); // This will trigger the refresh
              handleCancel();
            },
          },
        ]);
      } else {
        throw new Error("Failed to upload file");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to upload file"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setCustomName("");
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.popup}>
              <Text style={styles.title}>Upload Your File</Text>

              {!selectedFile ? (
                <View style={styles.options}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handlePickFromDevice}
                  >
                    <Text style={styles.buttonText}>From Your Device</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleCamera}
                  >
                    <Text style={styles.buttonText}>Using Camera</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <Text style={{ marginBottom: 10, fontWeight: "500" }}>
                    File: {selectedFile.name || "Unnamed"}
                  </Text>
                  <TextInput
                    placeholder="Enter custom file name"
                    value={customName}
                    onChangeText={setCustomName}
                    style={styles.input}
                  />
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleUpload}
                  >
                    {isUploading ? (
                      <ActivityIndicator />
                    ) : (
                      <Text style={styles.buttonText}>Upload</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#aaa" }]}
                    onPress={handleCancel}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default UploadFilePopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    width: "80%",
    backgroundColor: customColors.primary_white,
    borderRadius: 10,
    padding: moderateScale(20),
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: moderateScale(10),
    textAlign: "center",
  },
  options: {
    gap: moderateScale(10),
  },
  button: {
    backgroundColor: customColors.primary_orange,
    borderRadius: 8,
    padding: 12,
    marginTop: moderateScale(10),
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: moderateScale(10),
  },
});
