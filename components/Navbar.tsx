import React from "react";
import { Animated } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NAVBAR_HEIGHT = 50;

interface NavbarProps {
  opacity: Animated.AnimatedInterpolation<string | number>;
}

export const Navbar: React.FC<NavbarProps> = ({ opacity }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <Animated.View 
      className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 flex-row items-center px-4 z-10"
      style={{
        height: NAVBAR_HEIGHT + insets.top,
        paddingTop: insets.top,
        opacity,
      }}
    >
      <Text className="text-lg font-bold">Home</Text>
    </Animated.View>
  );
};