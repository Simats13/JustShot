import {
  View,
  TextInput,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { ImageThumbnail } from "../02-molecules/ImageThumbnail";
import { ThemeAlert } from "../02-molecules/ThemeAlert";
import { FC } from "react";

interface CaptionInputProps {
  imageUri: string | null;
  text: string;
  onTextChange: (text: string) => void;
  onImagePress: () => void;
  theme: string;
  maxLength?: number;
}

export const CaptionInput: FC<CaptionInputProps> = ({
  imageUri,
  text,
  onTextChange,
  onImagePress,
  theme,
  maxLength = 2200,
}) => (
  <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    className="flex-1"
  >
    <ScrollView className="flex-1">
      <View className="flex-row p-4">
        {imageUri && (
          <ImageThumbnail
            uri={imageUri}
            onPress={onImagePress}
            showExpandIcon
            size={80}
          />
        )}
        <View className="flex-1 ml-4">
          <TextInput
            className="text-white text-base"
            placeholder="Écrivez une légende..."
            placeholderTextColor="#666"
            multiline
            value={text}
            onChangeText={onTextChange}
            maxLength={maxLength}
            autoFocus
          />
        </View>
      </View>

      <Text className="text-gray-500 text-right px-4">
        {text.length}/{maxLength}
      </Text>

      <ThemeAlert theme={theme} />
    </ScrollView>
  </KeyboardAvoidingView>
);
