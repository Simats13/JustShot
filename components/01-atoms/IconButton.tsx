import { FC } from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface IconButtonProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  onPress: () => void;
  className?: string;
}

export const IconButton: FC<IconButtonProps> = ({
  name,
  size = 24,
  color = "white",
  onPress,
  className = "",
}) => (
  <TouchableOpacity onPress={onPress} className={className}>
    <Ionicons name={name} size={size} color={color} />
  </TouchableOpacity>
);
