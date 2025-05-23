// FolderCard.tsx
import React, { useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import imagePaths from "@/src/constants/imagePaths";
import customColors from "@/src/constants/customColours";
import { Ionicons } from "@expo/vector-icons";
import ModalLib from "react-native-modal";

const FolderCard = ({
  folder,
  grid,
  row,
  onPress,
  onDelete,
  onUpdate,
}: {
  folder: any;
  grid: boolean;
  row: boolean;
  onPress: (id: string) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (folder: any) => void;
}) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const handleLongPress = () => {
    setModalVisible(true);
  };

  const handleDelete = () => {
    setModalVisible(false);
    onDelete?.(folder._id);
  };

  const handleUpdate = () => {
  setModalVisible(false);
  onUpdate?.(folder); // Pass entire folder object
};

  return (
    <>
      <TouchableOpacity
        style={[styles.container, grid && !row && styles.gridItem]}
        onPress={() => onPress(folder._id)}
        onLongPress={handleLongPress}
      >
        <View
          style={
            grid && !row
              ? styles.gridFolderContainer
              : styles.rowFolderContainer
          }
        >
          <Image
            source={imagePaths.folder_icon}
            style={grid && !row ? styles.gridFolderImg : styles.rowFolderImg}
            resizeMode="contain"
          />
          <View>
            <Text
            style={styles.folderText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {folder.name}
          </Text>
          <Text style={styles.folderDateText}>{new Date(folder.createdAt).toISOString().split('T')[0]}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <ModalLib
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Pressable onPress={handleDelete} style={styles.optionButton}>
            <Ionicons name="trash-outline" size={20} color="red" />
            <Text style={styles.optionText}>Delete</Text>
          </Pressable>
          <Pressable onPress={handleUpdate} style={styles.optionButton}>
            <Ionicons name="create-outline" size={20} color="#007AFF" />
            <Text style={styles.optionText}>Update</Text>
          </Pressable>
        </View>
      </ModalLib>
    </>
  );
};

export default FolderCard;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  gridItem: {
    width: "48%",
  },
  rowFolderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 8,
  },
  rowFolderImg: {
    width: 50,
    height: 50,
  },
  gridFolderContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
  },
  gridFolderImg: {
    width: 70,
    height: 70,
    marginBottom: 6,
  },
  folderText: {
    fontSize: 14,
    color: customColors.primary_black,
    textAlign: "center",
    maxWidth: 100,
    fontFamily: "Montserrat-Medium",
  },
  folderDateText: {
    fontSize: 11,
    color: customColors.primary_black,
    textAlign: "left",
    maxWidth: 100,
    fontFamily: "Montserrat-Medium",
  },
  deleteIcon: {
    position: "absolute",
    top: 4,
    right: 4,
    padding: 4,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    paddingVertical: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#333",
  },
});
