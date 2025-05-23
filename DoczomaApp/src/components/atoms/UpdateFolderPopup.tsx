import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const UpdateFolderPopup = ({
  visible,
  onClose,
  onUpdate,
  folder,
}: {
  visible: boolean;
  onClose: () => void;
  onUpdate: (folderId: string, newName: string) => void;
  folder: any;
}) => {
  const [folderName, setFolderName] = useState(folder?.name || "");

  useEffect(() => {
    if (folder) {
      setFolderName(folder.name);
    }
  }, [folder]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.popupOverlay}>
        <View style={styles.popupContainer}>
          <Text style={styles.popupTitle}>Update Folder Name</Text>
          <TextInput
            style={styles.input}
            value={folderName}
            onChangeText={setFolderName}
            placeholder="Enter new folder name"
          />
          <View style={styles.popupActions}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (folderName.trim()) {
                  onUpdate(folder._id, folderName.trim());
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

export default UpdateFolderPopup;

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

