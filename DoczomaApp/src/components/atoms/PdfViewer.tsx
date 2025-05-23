// PdfViewer.tsx
import React from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const PdfViewer = ({ visible, onClose, url }: { visible: boolean; onClose: () => void; url: string }) => {
  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
      <WebView source={{ uri: url }} style={styles.webview} />
    </Modal>
  );
};

export default PdfViewer;

const styles = StyleSheet.create({
  header: {
    height: 50,
    backgroundColor: '#333',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  closeBtn: {
    padding: 5,
  },
  closeText: {
    color: 'white',
    fontSize: 16,
  },
  webview: {
    flex: 1,
  },
});
