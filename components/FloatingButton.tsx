import React from "react";
import { Animated } from "react-native";
import { IconButton } from "react-native-paper";

interface FloatingButtonProps {
  onPress: () => void;
  opacity?: Animated.AnimatedInterpolation<number>;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  opacity,
}) => {
  return (
    <Animated.View
      style={{ opacity }}
      className="absolute right-4 bottom-4 z-10"
    >
      <IconButton
        icon="plus"
        size={30}
        onPress={onPress}
        className="bg-blue-500 rounded-full"
        iconColor="white"
      />
    </Animated.View>
  );
};