import { FC, RefObject } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { CameraView } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

interface CameraProps {
  cameraRef: RefObject<CameraView>;
  flash: "off" | "on" | "auto";
  onClose: () => void;
  onTakePicture: () => void;
  onFlipCamera: () => void;
  onFlashToggle: () => void;
  visible: boolean;
}

export const Camera: FC<CameraProps> = ({
  cameraRef,
  flash,
  onClose,
  onTakePicture,
  onFlipCamera,
  onFlashToggle,
  visible,
}) => {
  const renderFlashIcon = () => {
    switch (flash) {
      case "on":
        return "flash";
      case "off":
        return "flash-off";
      case "auto":
        return "flash-outline";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        <StatusBar barStyle="light-content" />
        <CameraView
          ref={cameraRef}
          className="flex-1"
          style={Platform.select({
            android: { flex: 1 },
            ios: { flex: 1 },
          })}
        >
          {/* Top Controls */}
          <View className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/50 to-transparent z-10">
            <View className="flex-row justify-between items-center px-4 mt-12">
              <TouchableOpacity
                onPress={onClose}
                className="w-12 h-12 items-center justify-center"
              >
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onFlashToggle}
                className="w-12 h-12 items-center justify-center"
              >
                <Ionicons name={renderFlashIcon()} size={28} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Controls */}
          <View className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/50 to-transparent z-10">
            <View className="flex-row justify-around items-center mb-10">
              <TouchableOpacity
                onPress={onFlipCamera}
                className="w-16 h-16 items-center justify-center"
              >
                <Ionicons name="camera-reverse" size={32} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onTakePicture}
                className="w-20 h-20 rounded-full bg-white items-center justify-center"
              >
                <View className="w-18 h-18 rounded-full border-2 border-black/20" />
              </TouchableOpacity>

              <View className="w-16 h-16" />
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
};

export default Camera;
