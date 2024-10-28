import React from "react";
import {
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  View,
  Text,
  TextInput,
} from "react-native";
import { Header } from "@/components/02-molecules/Header";
import { ImageThumbnail } from "@/components/02-molecules/ImageThumbnail";
import { ThemeAlert } from "@/components/02-molecules/ThemeAlert";
import { ImagePreview } from "@/components/03-organisms/ImagePreview";

interface AddShotTextTemplateProps {
  imageUri: string | null;
  caption: string;
  onCaptionChange: (text: string) => void;
  onBack: () => void;
  onNext: () => void;
  theme: string;
  previewVisible: boolean;
  onPreviewClose: () => void;
  onImagePress: () => void;
}

export const AddShotTextTemplate: React.FC<AddShotTextTemplateProps> = ({
  imageUri,
  caption,
  onCaptionChange,
  onBack,
  onNext,
  theme,
  previewVisible,
  onPreviewClose,
  onImagePress,
}) => {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      <Header
        title="Nouvelle publication"
        onBack={onBack}
        onNext={onNext}
        isEditing={true}
      />

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
                value={caption}
                onChangeText={onCaptionChange}
                autoFocus
              />
            </View>
          </View>

          <Text className="text-gray-500 text-right px-4">
            {caption.length}/2200
          </Text>

          <ThemeAlert theme={theme} />
        </ScrollView>
      </KeyboardAvoidingView>

      <ImagePreview
        visible={previewVisible}
        imageUri={imageUri}
        onClose={onPreviewClose}
      />
    </SafeAreaView>
  );
};
