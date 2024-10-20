import React, { useRef, useEffect } from "react";
import { TouchableOpacity, View, Animated } from "react-native";
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
    case "addShot":
      
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
      className="flex-1 justify-center items-center min-w-12 min-h-12 z-10"
    >
      <View className="flex-1 justify-center items-center">
        <Animated.View
          style={{ transform: [{ scale: scaleValue }] }}
          className="items-center"
        >
          <Feather
            name={getIconName(routeName)}
            size={24}
            color={isFocused ? primaryColor : "gray"}
          />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

export default TabBarButton;
