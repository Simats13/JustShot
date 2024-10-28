import { View, Text, TouchableOpacity } from "react-native";
import { IconButton } from "../01-atoms/IconButton";
import { Button } from "../01-atoms/Button";
import { FC } from "react";

interface HeaderProps {
  title: string;
  onBack: () => void;
  onNext: () => void;
  isEditing?: boolean;
}

export const Header: FC<HeaderProps> = ({
  title,
  onBack,
  onNext,
  isEditing = false,
}) => (
  <View className="flex-row justify-between items-center px-4 h-14 border-b border-gray-800">
    {isEditing ? (
      <TouchableOpacity onPress={onBack}>
        <Text className="text-white text-base">Retour</Text>
      </TouchableOpacity>
    ) : (
      <IconButton name="close" onPress={onBack} />
    )}
    <Text className="text-white text-lg font-bold">{title}</Text>
    {isEditing ? (
      <Button onPress={onNext} title="Partager" />
    ) : (
      <Button onPress={onNext} title="Suivant" variant="secondary" />
    )}
  </View>
);
