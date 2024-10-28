import { Modal, View, SafeAreaView, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { IconButton } from "../01-atoms/IconButton";

interface ImagePreviewProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  visible,
  imageUri,
  onClose,
}) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View className="flex-1 bg-black bg-opacity-95">
      <SafeAreaView className="flex-1">
        <View className="flex-row justify-between items-center px-4 h-14">
          <IconButton name="close" onPress={onClose} />
        </View>

        <View className="flex-1 justify-center items-center">
          {imageUri && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={onClose}
              className="w-full aspect-square"
            >
              <Image
                source={{ uri: imageUri }}
                className="w-full h-full"
                contentFit="contain"
              />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  </Modal>
);
