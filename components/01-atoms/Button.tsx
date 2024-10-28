import { FC } from "react";
import { TouchableOpacity, Text } from "react-native";

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary";
  className?: string;
}

export const Button: FC<ButtonProps> = ({
  onPress,
  title,
  variant = "primary",
  className = "",
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-4 py-2 rounded-full ${
      variant === "primary" ? "bg-blue-500" : ""
    } ${className}`}
  >
    <Text
      className={`text-base ${
        variant === "primary" ? "text-white font-medium" : "text-blue-500"
      }`}
    >
      {title}
    </Text>
  </TouchableOpacity>
);
