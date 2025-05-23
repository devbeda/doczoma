import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Alert,
  Pressable
} from 'react-native';
import imagePaths from '@/src/constants/imagePaths';
import customColors from '@/src/constants/customColours';
import { Ionicons } from "@expo/vector-icons";
import ModalLib from "react-native-modal";
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { shareAsync } from 'expo-sharing';

const DocIcon = ({ 
  file, 
  grid, 
  row, 
  onPress,
  onDelete,
  onUpdate 
}: { 
  file: any; 
  grid: boolean; 
  row: boolean; 
  onPress: () => void;
  onDelete?: (id: string) => void;
  onUpdate?: (file: any) => void;
}) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const handleLongPress = () => {
    setModalVisible(true);
  };

  const handleDelete = () => {
    setModalVisible(false);
    onDelete?.(file._id);
  };

  const handleUpdate = () => {
    setModalVisible(false);
    onUpdate?.(file);
  };

  const handleDownload = async () => {
    setModalVisible(false);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to media library to download files');
        return;
      }

      const fileUri = FileSystem.documentDirectory + file.name;
      const { uri } = await FileSystem.downloadAsync(
        file.fileUrl,
        fileUri
      );

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Downloads', asset, false);
      
      Alert.alert('Success', 'File downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download file');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, grid && !row && styles.gridItem]}
        onPress={onPress}
        onLongPress={handleLongPress}
      >
        {grid && !row ? (
          <View style={styles.gridDocContainer}>
            <Image source={imagePaths.document_icon} style={styles.gridDocImg} resizeMode="contain" />
            <Text style={styles.docText} numberOfLines={1} ellipsizeMode="tail">
              {file.name}
            </Text>
            <Text style={styles.fileDateText}>
              {new Date(file.createdAt).toISOString().split('T')[0]}
            </Text>
          </View>
        ) : (
          <View style={styles.rowDocContainer}>
            <Image source={imagePaths.document_icon} style={styles.rowDocImg} resizeMode="contain" />
            <View>
              <Text style={styles.docText} numberOfLines={1} ellipsizeMode="tail">
                {file.name}
              </Text>
              <Text style={styles.fileDateText}>
                {new Date(file.createdAt).toISOString().split('T')[0]}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <ModalLib
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Pressable onPress={handleDownload} style={styles.optionButton}>
            <Ionicons name="download-outline" size={20} color="#007AFF" />
            <Text style={styles.optionText}>Download</Text>
          </Pressable>
          <Pressable onPress={handleUpdate} style={styles.optionButton}>
            <Ionicons name="create-outline" size={20} color="#007AFF" />
            <Text style={styles.optionText}>Rename</Text>
          </Pressable>
          <Pressable onPress={handleDelete} style={styles.optionButton}>
            <Ionicons name="trash-outline" size={20} color="red" />
            <Text style={[styles.optionText, { color: 'red' }]}>Delete</Text>
          </Pressable>
        </View>
      </ModalLib>
    </>
  );
};

export default DocIcon;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  gridItem: {
    width: '48%',
  },
  rowDocContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
  },
  rowDocImg: {
    width: 40,
    height: 40,
  },
  gridDocContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
  },
  gridDocImg: {
    width: 60,
    height: 60,
    marginBottom: 6,
  },
  docText: {
    fontSize: 14,
    color: customColors.primary_black,
    textAlign: 'center',
    maxWidth: 100,
    fontFamily: 'Montserrat-Medium',
  },
  fileDateText: {
    fontSize: 11,
    color: customColors.primary_black,
    textAlign: 'center',
    maxWidth: 100,
    fontFamily: 'Montserrat-Medium',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    paddingVertical: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
});