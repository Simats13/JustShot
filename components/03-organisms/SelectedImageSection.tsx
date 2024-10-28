// organisms/SelectedImageSection.tsx
import React from "react";
import { View, TouchableOpacity, Animated, Dimensions } from "react-native";
import { ImageDisplay } from "../01-atoms/ImageDisplay";
import { IconButton } from "../01-atoms/IconButton";

interface SelectedImageSectionProps {
  selectedImage: string | null;
  onImagePress: () => void;
  onCameraPress: () => void;
  imageOpacity: Animated.AnimatedInterpolation<string | number>;
  imageScale: Animated.AnimatedInterpolation<string | number>;
}

const { width } = Dimensions.get("window");

export const SelectedImageSection = ({
  selectedImage,
  onImagePress,
  onCameraPress,
  imageOpacity,
  imageScale,
}: SelectedImageSectionProps) => (
  <Animated.View
    style={{
      opacity: imageOpacity,
      transform: [{ scale: imageScale }],
      height: width - 50,
    }}
    className="mx-4 mt-4 rounded-lg overflow-hidden border border-gray-700"
  >
    {selectedImage ? (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onImagePress}
        className="w-full h-full"
      >
        <ImageDisplay uri={selectedImage} />
      </TouchableOpacity>
    ) : (
      <View className="w-full h-full bg-gray-800" />
    )}
    <IconButton
      name="camera"
      size={24}
      onPress={onCameraPress}
      className="absolute bottom-4 right-4 bg-black bg-opacity-50 rounded-full p-2"
    />
  </Animated.View>
);
