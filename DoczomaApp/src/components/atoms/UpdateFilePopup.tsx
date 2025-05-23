import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const UpdateFilePopup = ({
  visible,
  onClose,
  onUpdate,
  file,
}: {
  visible: boolean;
  onClose: () => void;
  onUpdate: (fileId: string, newName: string) => void;
  file: any;
}) => {
  const [fileName, setFileName] = useState(file?.name || "");

  useEffect(() => {
    if (file) {
      setFileName(file.name);
    }
  }, [file]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.popupOverlay}>
        <View style={styles.popupContainer}>
          <Text style={styles.popupTitle}>Update File Name</Text>
          <TextInput
            style={styles.input}
            value={fileName}
            onChangeText={setFileName}
            placeholder="Enter new file name"
          />
          <View style={styles.popupActions}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (fileName.trim()) {
                  onUpdate(file._id, fileName.trim());
                  onClose();
                }
              }}
            >
              <Text style={styles.updateButton}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UpdateFilePopup;

const styles = StyleSheet.create({
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  popupActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    color: "red",
    fontWeight: "bold",
  },
  updateButton: {
    color: "green",
    fontWeight: "bold",
  },
});