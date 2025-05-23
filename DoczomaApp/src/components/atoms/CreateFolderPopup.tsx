import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import customColors from "@/src/constants/customColours";
import { moderateScale } from "react-native-size-matters";

const CreateFolderPopup = ({ visible, onClose, onCreate }: any) => {
  const [folderName, setFolderName] = useState("");

  const handleCreate = () => {
    if (!folderName.trim()) return;
    onCreate(folderName);
    setFolderName("");
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.popup}>
              <Text style={styles.title}>Create New Folder</Text>
              <TextInput
                placeholder="Folder name"
                value={folderName}
                onChangeText={setFolderName}
                style={styles.input}
              />
              <View style={styles.buttons}>
                <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCreate} style={styles.createButton}>
                  <Text style={styles.createText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CreateFolderPopup;


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
  input: {
    borderWidth: 1,
    borderColor: customColors.primary_orange,
    borderRadius: 8,
    padding: 10,
    marginBottom: moderateScale(20),
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    padding: 10,
  },
  cancelText: {
    color: customColors.primary_black,
  },
  createButton: {
    backgroundColor: customColors.primary_orange,
    padding: 10,
    borderRadius: 8,
  },
  createText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
