import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X, Check, RefreshCcw } from 'lucide-react-native';

export default function AttendanceFaceCaptureModal({ visible, onClose, onCapture, isDark }) {
  const [loading, setLoading] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);

  const requestPermissionAndOpenCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.front,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
        setPhotoBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      console.log('Error capturing face:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
    setPhotoBase64(null);
    requestPermissionAndOpenCamera();
  };

  const handleSubmit = () => {
    if (photoBase64) {
      onCapture(photoBase64);
    }
  };

  const handleClose = () => {
    setPhotoUri(null);
    setPhotoBase64(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/60 justify-center items-center px-4">
        <View className={`w-full max-w-sm rounded-3xl p-6 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center mb-6">
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Selfie Verification
            </Text>
            <TouchableOpacity onPress={handleClose} className="p-2">
              <X size={24} color={isDark ? '#94a3b8' : '#64748b'} />
            </TouchableOpacity>
          </View>

          {!photoUri ? (
            <View className="items-center justify-center py-10">
              <TouchableOpacity
                onPress={requestPermissionAndOpenCamera}
                disabled={loading}
                className="w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-4 border-2 border-blue-200 dark:border-blue-800"
              >
                {loading ? (
                  <ActivityIndicator size="large" color="#3b82f6" />
                ) : (
                  <Camera size={48} color="#3b82f6" />
                )}
              </TouchableOpacity>
              <Text className={`text-center font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Tap to capture a selfie
              </Text>
              <Text className={`text-center text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Please ensure your face is clearly visible
              </Text>
            </View>
          ) : (
            <View className="items-center">
              <View className="w-48 h-48 rounded-full overflow-hidden mb-6 border-4 border-slate-200 dark:border-slate-700">
                <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} />
              </View>

              <View className="flex-row gap-4 w-full">
                <TouchableOpacity
                  onPress={handleRetake}
                  className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 items-center justify-center flex-row gap-2"
                >
                  <RefreshCcw size={18} color={isDark ? '#cbd5e1' : '#475569'} />
                  <Text className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Retake
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  className="flex-1 py-3.5 rounded-2xl bg-blue-600 items-center justify-center flex-row gap-2"
                >
                  <Check size={18} color="#fff" />
                  <Text className="text-white font-bold">Use Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
