import { View, TouchableOpacity } from "react-native";
import { Asset } from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";
import { ImageDisplay } from "../01-atoms/ImageDisplay";

interface GalleryItemProps {
  item: Asset;
  isSelected: boolean;
  onSelect: (asset: Asset) => void;
}

export const GalleryItem = ({
  item,
  isSelected,
  onSelect,
}: GalleryItemProps) => (
  <TouchableOpacity
    onPress={() => onSelect(item)}
    className="w-1/3 aspect-square p-1 relative"
  >
    <ImageDisplay uri={item.uri} />
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
