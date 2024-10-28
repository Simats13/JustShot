import { FC } from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface ThemeAlertProps {
  theme: string;
  onPress?: () => void;
  variant?: "full" | "compact";
}

export const ThemeAlert: FC<ThemeAlertProps> = ({
  theme,
  onPress,
  variant = "full",
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`${
      variant === "compact"
        ? "px-3 py-1 rounded-full"
        : "mx-4 mt-2 p-3 rounded-lg"
    } bg-yellow-500/10 border border-yellow-500/20`}
  >
    <View className="flex-row items-center">
      <Text className="text-yellow-500 mr-2">📸</Text>
      <Text className="text-yellow-500 font-medium">
        {variant === "compact" ? "Thème" : `Thème du jour : ${theme}`}
      </Text>
    </View>
  </TouchableOpacity>
);
