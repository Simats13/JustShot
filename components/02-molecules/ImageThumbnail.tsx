import { FC } from "react";
import { View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

interface ImageThumbnailProps {
  uri: string;
  onPress?: () => void;
  size?: number;
  showExpandIcon?: boolean;
  isSelected?: boolean;
}

export const ImageThumbnail: FC<ImageThumbnailProps> = ({
  uri,
  onPress,
  size = 80,
  showExpandIcon = false,
  isSelected = false,
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="relative"
    style={{ width: size, height: size }}
  >
    <Image source={{ uri }} className="w-full h-full rounded-lg" />
    {showExpandIcon && (
      <View className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1">
        <Ionicons name="expand" size={16} color="white" />
      </View>
    )}
    {isSelected && (
      <View className="absolute inset-0 flex items-center justify-center">
        <View className="absolute inset-0 bg-black bg-opacity-20" />
        <View className="w-6 h-6 bg-blue-500 rounded-sm flex items-center justify-center">
          <Ionicons name="checkmark" size={18} color="white" />
        </View>
      </View>
    )}
  </TouchableOpacity>
);
