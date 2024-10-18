import React, { useRef, useEffect } from "react";
import { TouchableOpacity, Text, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

const getIconName = (routeName: string): FeatherIconName => {
  switch (routeName) {
    case "index":
      return "home";
    case "profile":
      return "user";
    case "explore":
      return "search";
    case "notifications":
      return "bell";
    default:
      return "circle";
  }
};

interface TabBarButtonProps {
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  routeName: string;
  label: string;
  primaryColor: string;
}

const TabBarButton: React.FC<TabBarButtonProps> = ({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  label,
  primaryColor,
}) => {
  const clickAnim = useRef(new Animated.Value(1)).current;
  const focusAnim = useRef(new Animated.Value(isFocused ? 1.1 : 1)).current;

  useEffect(() => {
    Animated.spring(focusAnim, {
      toValue: isFocused ? 1.1 : 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  }, [isFocused]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(clickAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(clickAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const scaleValue = Animated.multiply(clickAnim, focusAnim);

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={onLongPress}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleValue }],
          alignItems: "center",
        }}
      >
        <Feather
          name={getIconName(routeName)}
          size={24}
          color={isFocused ? primaryColor : "gray"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default TabBarButton;
