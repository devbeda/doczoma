import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import NavBar from "@/src/components/molecules/NavBar";
import customColors from "@/src/constants/customColours";
import UploadBtn from "@/src/components/atoms/UploadBtn";
import { moderateScale } from "react-native-size-matters";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import FolderCard from "@/src/components/atoms/FolderCard";
import CreateFolderPopup from "@/src/components/atoms/CreateFolderPopup";
import UploadFilePopup from "@/src/components/atoms/uploadFilePopup";
import UpdateFolderPopup from "@/src/components/atoms/UpdateFolderPopup";
import axios from "axios";
import baseURL from "@/src/store/baseUrl";
import DocIcon from "@/src/components/atoms/DocIcon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FileViewer from "react-native-file-viewer";
import RNFS from "react-native-fs";
import * as FileSystem from "expo-file-system";
import UpdateFilePopup from "@/src/components/atoms/UpdateFilePopup";
import * as IntentLauncher from "expo-intent-launcher";
import { shareAsync } from "expo-sharing";
import * as Linking from "expo-linking";
import * as Sharing from 'expo-sharing';
import * as Mime from "react-native-mime-types"; 

const Dashboard = () => {
  const [isGrid, setIsGrid] = useState(false);
  const [isRow, setIsRow] = useState(true);
  const [isCreateFolderVisible, setIsCreateFolderVisible] = useState(false);
  const [isUploadVisible, setIsUploadVisible] = useState(false);
  const [openNavBar, setOpenNavBar] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [rootFolders, setRootFolders] = useState([]);
  const [rootFiles, setRootFiles] = useState([]);
  const [folderStack, setFolderStack] = useState<any[]>([]);
  const hasFetchedUser = useRef(false);
  const [isUpdateFolderVisible, setIsUpdateFolderVisible] = useState(false);
  const [folderToUpdate, setFolderToUpdate] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isUpdateFileVisible, setIsUpdateFileVisible] = useState(false);
  const [fileToUpdate, setFileToUpdate] = useState<any>(null);



  const toggleNavBar = () => setOpenNavBar((prev) => !prev);

  const fetchUser = async (force = false) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;

      const res = await axios.get(`${baseURL}/user/getuser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("userr", res);
      

      const fetchedUser = res.data.user;
      setUser(fetchedUser);
      setRootFolders(fetchedUser.rootFolders || []);
      setRootFiles(fetchedUser.rootFiles || []);
      console.log("fetched user", fetchedUser);
      

      // If we're in a subfolder, update that folder's contents
      if (folderStack.length > 0) {
        const lastFolderId = folderStack[folderStack.length - 1]._id;
        const folderRes = await axios.get(
          `${baseURL}/file/getfoldersbyid/${lastFolderId}`
        );
        setFolderStack((prev) => {
          const newStack = [...prev];
          newStack[newStack.length - 1] = folderRes.data.folder;
          return newStack;
        });
      }
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  };

  const fetchFolderById = async (folderId: string) => {
    try {
      const res = await axios.get(`${baseURL}/file/getfoldersbyid/${folderId}`);
      const folder = res.data.folder;
      setFolderStack((prev) => [...prev, folder]);
    } catch (err) {
      console.error("Error fetching folder by ID", err);
    }
  };

  useEffect(() => {
    fetchUser(); // only initial fetch
  }, [refreshTrigger]);

  const handleOutsidePress = () => {
    if (openNavBar) setOpenNavBar(false);
  };

  const handelfolder = () => {
    setIsGrid((prev) => !prev);
    setIsRow((prev) => !prev);
  };

const handleFileOpen = async (file: any) => {
  const { fileUrl, name } = file;

  try {
    const fileUri = `${FileSystem.cacheDirectory}${name}`;
    const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);
    const mimeType = getMimeType(fileUrl);

    if (Platform.OS === "android") {
      // ✅ Convert to content:// URI
      const contentUri = await FileSystem.getContentUriAsync(uri);

      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: contentUri,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        type: mimeType,
      });
    } else {
      await Sharing.shareAsync(uri, {
        UTI: mimeType,
        dialogTitle: `Open ${name}`,
      });
    }
  } catch (error) {
    console.error("File open error:", error);
    Alert.alert(
      "Error",
      "Could not open file. Make sure a supported app is installed to open this file."
    );
  }
};

  const downloadFileOnly = async (url: string, name: string) => {
  try {
    const downloadDir = FileSystem.documentDirectory + "Downloads/";
    await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
    
    // Use SAF for Android 10+
    if (Platform.OS === 'android' && Platform.Version >= 29) {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const uri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          name,
          getMimeType(url)
        );
        
        const response = await FileSystem.createDownloadResumable(
          url,
          uri
        ).downloadAsync();
        
        Alert.alert("Success", `File saved to Downloads`);
      }
    } else {
      // Legacy method
      const fileUri = downloadDir + name;
      await FileSystem.downloadAsync(url, fileUri);
      Alert.alert("Success", `File saved to ${fileUri}`);
    }
  } catch (error) {
    console.error("Download error:", error);
    Alert.alert("Error", "Failed to download file");
  }
};

  const getMimeType = (url: string) => {
  const ext = url.split(".").pop() || "";
  return Mime.lookup(ext) || "application/octet-stream";
};

  const getUTI = (url: string) => {
    const extension = url.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "com.adobe.pdf";
      case "jpg":
      case "jpeg":
        return "public.jpeg";
      case "png":
        return "public.png";
      case "doc":
        return "com.microsoft.word.doc";
      case "docx":
        return "org.openxmlformats.wordprocessingml.document";
      case "xls":
        return "com.microsoft.excel.xls";
      case "xlsx":
        return "org.openxmlformats.spreadsheetml.sheet";
      case "ppt":
        return "com.microsoft.powerpoint.ppt";
      case "pptx":
        return "org.openxmlformats.presentationml.presentation";
      case "txt":
        return "public.plain-text";
      default:
        return "public.data";
    }
  };

  const handleFolderCreate = async (name: string) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Error", "User is not authenticated.");
        return;
      }

      const parentFolder =
        folderStack.length > 0 ? folderStack[folderStack.length - 1]._id : null;

      const response = await axios.post(
        `${baseURL}/file/createfolder`,
        {
          name,
          parentFolder: parentFolder || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newFolder = response.data.folder;

      if (parentFolder) {
        // Inside subfolder → update last item in folderStack
        setFolderStack((prev) => {
          const updatedStack = [...prev];
          const last = updatedStack.pop();
          if (last) {
            last.childFolders = [...(last.childFolders || []), newFolder];
            updatedStack.push(last);
          }
          return updatedStack;
        });
      } else {
        // Root level → update rootFolders
        setRootFolders((prev) => [...prev, newFolder]);
      }

      Alert.alert("Success", "Folder created successfully.");
    } catch (error) {
      console.error("Error creating folder:", error);
      Alert.alert("Error", "Failed to create folder.");
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Error", "User is not authenticated.");
        return;
      }

      // Optimistic UI update - remove the folder immediately
      const isInSubfolder = folderStack.length > 0;
      if (isInSubfolder) {
        setFolderStack((prev) => {
          const updatedStack = [...prev];
          const last = updatedStack.pop();
          if (last) {
            const newLast = {
              ...last,
              childFolders: (last.childFolders || []).filter(
                (folder) => folder._id !== folderId
              ),
            };
            updatedStack.push(newLast);
          }
          return updatedStack;
        });
      } else {
        setRootFolders((prev) =>
          prev.filter((folder) => folder._id !== folderId)
        );
      }

      // Delete from backend
      const response = await axios.delete(
        `${baseURL}/file/deletefolder/${folderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if deletion was successful (2xx status)
      if (response.status >= 200 && response.status < 300) {
        // Force refresh to ensure all data is up-to-date
        await fetchUser(true);
        Alert.alert("Success", "Folder deleted successfully.");
      } else {
        // If server responds with non-2xx status, revert UI
        await fetchUser(true);
        Alert.alert("Error", "Failed to delete folder.");
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      // On any error, refresh from server to ensure consistency
      await fetchUser(true);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to delete folder."
      );
    }
  };

  const handleUpdateFolder = async (folderId: string, newName: string) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Error", "User is not authenticated.");
        return;
      }

      // Optimistic UI update - update the folder name immediately
      const isInSubfolder = folderStack.length > 0;
      if (isInSubfolder) {
        setFolderStack((prev) => {
          const updatedStack = [...prev];
          const last = updatedStack.pop();
          if (last) {
            const newLast = {
              ...last,
              childFolders: (last.childFolders || []).map((folder) =>
                folder._id === folderId ? { ...folder, name: newName } : folder
              ),
            };
            updatedStack.push(newLast);
          }
          return updatedStack;
        });
      } else {
        setRootFolders((prev) =>
          prev.map((folder) =>
            folder._id === folderId ? { ...folder, name: newName } : folder
          )
        );
      }

      // Then make the API call
      const response = await axios.patch(
        `${baseURL}/file/updatefolderbyid/${folderId}`,
        { name: newName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if update was successful (2xx status)
      if (response.status >= 200 && response.status < 300) {
        // Force refresh to ensure all data is up-to-date
        await fetchUser(true);
        Alert.alert("Success", "Folder renamed successfully");
      } else {
        // If server responds with non-2xx status, revert UI
        await fetchUser(true);
        Alert.alert("Error", "Failed to rename folder");
      }
    } catch (error) {
      console.error("Error updating folder:", error);
      // On any error, refresh from server to ensure consistency
      await fetchUser(true);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to rename folder"
      );
    }
  };

  const handleFileSelected = async (file: { uri: string; name?: string; mimeType?: string }) => {
  console.log("File Selected:", file);
  fetchUser(true);
  
  try {
    if (Platform.OS === 'android') {
      // For Android, we need to use a FileProvider
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      
      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        const newUri = `${FileSystem.cacheDirectory}${file.name || 'file'}`;
        await FileSystem.writeAsStringAsync(newUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: newUri,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
          type: file.mimeType || '*/*',
        });
      }
    } else {
      // For iOS, we can use Sharing
      await Sharing.shareAsync(file.uri);
    }
  } catch (error) {
    console.error("Error opening file:", error);
    Alert.alert("Error", "Could not open file. Make sure you have an appropriate app installed.");
  }
};

  const handleFileDelete = async (fileId: string) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Error", "User is not authenticated.");
        return;
      }

      await axios.delete(`${baseURL}/file/deletefile/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Success", "File deleted successfully");
      fetchUser(true); // Refresh the file list
    } catch (error) {
      console.error("Error deleting file:", error);
      Alert.alert("Error", "Failed to delete file");
    }
  };

  const handleFileUpdate = async (fileId: string, newName: string) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Error", "User is not authenticated.");
        return;
      }

      await axios.patch(
        `${baseURL}/file/updatefilebyid/${fileId}`,
        { name: newName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Success", "File renamed successfully");
      fetchUser(true); // Refresh the file list
    } catch (error) {
      console.error("Error updating file:", error);
      Alert.alert("Error", "Failed to rename file");
    }
  };

  const currentFolders =
    folderStack.length > 0
      ? folderStack[folderStack.length - 1]?.childFolders || []
      : rootFolders;

  const currentFiles =
    folderStack.length > 0
      ? folderStack[folderStack.length - 1]?.childFiles || []
      : rootFiles;

  return (
    <>
      <StatusBar
        backgroundColor={customColors.primary_black}
        barStyle="dark-content"
      />
      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={{ flex: 1 }}>
            <NavBar user={user} open={openNavBar} toggleOpen={toggleNavBar} />

            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.heading_container}>
                <View></View>
                <View style={styles.headingText}>
                  <Text style={styles.contentText}>My Disk</Text>
                </View>
                <View style={styles.icons_container}>
                  <TouchableOpacity onPress={handelfolder}>
                    <Ionicons
                      name="grid-sharp"
                      size={15}
                      color={
                        isGrid && !isRow
                          ? customColors.primary_orange
                          : customColors.royal_brown
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handelfolder}>
                    <AntDesign
                      name="bars"
                      size={19}
                      color={
                        isRow && !isGrid
                          ? customColors.primary_orange
                          : customColors.royal_brown
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {folderStack.length > 0 && (
                <TouchableOpacity
                  onPress={() => setFolderStack((prev) => prev.slice(0, -1))}
                  style={{ paddingVertical: 10 }}
                >
                  <Text style={{ color: customColors.primary_orange }}>
                    ← Back
                  </Text>
                </TouchableOpacity>
              )}

              <View
                style={[
                  styles.folder_container,
                  isGrid && !isRow && styles.grid_folder_container,
                ]}
              >
                {currentFolders.map((folder: any, index: number) => (
                  <FolderCard
                    key={index}
                    folder={folder}
                    grid={isGrid}
                    row={isRow}
                    onPress={(id) => fetchFolderById(id)}
                    onDelete={handleDeleteFolder}
                    onUpdate={(folder) => {
                      setFolderToUpdate(folder);
                      setIsUpdateFolderVisible(true);
                    }}
                  />
                ))}

                {currentFiles.map((file: any, index: number) => (
                  <DocIcon
                    key={index}
                    file={file}
                    grid={isGrid}
                    row={isRow}
                    onPress={() => handleFileOpen(file)}
                    onDelete={handleFileDelete}
                    onUpdate={(file) => {
                      setFileToUpdate(file);
                      setIsUpdateFileVisible(true);
                    }}
                  />
                ))}

                {currentFolders.length === 0 && currentFiles.length === 0 && (
                  <Text style={{ textAlign: "center", marginTop: 20 }}>
                    No files or folders found.
                  </Text>
                )}
              </View>
            </ScrollView>

            <View style={styles.upload_button_container}>
              <UploadBtn
                onCreateFolder={() => setIsCreateFolderVisible(true)}
                onUploadFile={() => setIsUploadVisible(true)}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>

      <CreateFolderPopup
        visible={isCreateFolderVisible}
        onClose={() => setIsCreateFolderVisible(false)}
        onCreate={handleFolderCreate}
      />
      <UpdateFolderPopup
        visible={isUpdateFolderVisible}
        onClose={() => {
          setIsUpdateFolderVisible(false);
          setFolderToUpdate(null);
        }}
        onUpdate={handleUpdateFolder}
        folder={folderToUpdate}
      />
      <UploadFilePopup
        visible={isUploadVisible}
        onClose={() => setIsUploadVisible(false)}
        parentFolder={
          folderStack.length > 0
            ? folderStack[folderStack.length - 1]._id
            : null
        }
        onSuccess={() => {
          setRefreshTrigger((prev) => prev + 1); // Force refresh
          // setIsUploading(false);
        }}
      />
      <UpdateFilePopup
        visible={isUpdateFileVisible}
        onClose={() => {
          setIsUpdateFileVisible(false);
          setFileToUpdate(null);
        }}
        onUpdate={handleFileUpdate}
        file={fileToUpdate}
      />
    </>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customColors.primary_white,
  },
  scrollContainer: {
    width: "100%",
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  heading_container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(20),
    borderBottomWidth: 2,
    borderBottomColor: customColors.royal_brown,
  },
  headingText: {},
  contentText: {
    fontSize: 20,
    lineHeight: 24,
    color: customColors.primary_black,
    textAlign: "center",
    // fontWeight: "700",
    fontFamily: "Montserrat-Bold",
  },
  icons_container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  folder_container: {
    gap: 8,
    paddingVertical: 10,
  },
  grid_folder_container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  upload_button_container: {
    position: "absolute",
    bottom: 80,
    left: 280,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 10,
  },
});
