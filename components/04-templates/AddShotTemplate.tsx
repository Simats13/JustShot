import React from "react";
import {
  View,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { Header } from "@/components/02-molecules/Header";
import { ThemeAlert } from "@/components/02-molecules/ThemeAlert";
import { ImagePreview } from "@/components/03-organisms/ImagePreview";
import { IconButton } from "@/components/01-atoms/IconButton";
import { Ionicons } from "@expo/vector-icons";
import { Camera } from "../03-organisms/Camera";
import { CameraView } from "expo-camera";
import { ImageData, ImageEditor } from "expo-crop-image";
import { ImageThumbnail } from "@/components/02-molecules/ImageThumbnail";

const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = 60;
const IMAGE_HEIGHT = width;

interface AddShotTemplateProps {
  imageUri: string | null;
  caption: string;
  onCaptionChange: (text: string) => void;
  onBack: () => void;
  onNext: () => void;
  theme: string;
  previewVisible: boolean;
  onPreviewClose: () => void;
  onImagePress: () => void;
  gallery: React.ReactNode;
  onOpenCamera: () => void;
  isGalleryOpen?: boolean;
  scrollY?: Animated.Value;
  showThemeAlert?: boolean;
  showThemePopup?: () => void;
  cameraRef: React.RefObject<CameraView>;
  flash: "off" | "on" | "auto";
  isCameraVisible: boolean;
  setIsCameraVisible: (value: boolean) => void;
  takePicture: () => void;
  toggleCameraType: () => void;
  toggleFlash: () => void;
  handleEditComplete: (ImageData: ImageData) => void;
  isEditingText?: boolean;
}

export const AddShotTemplate: React.FC<AddShotTemplateProps> = ({
  imageUri,
  caption,
  onCaptionChange,
  onBack,
  onNext,
  theme,
  previewVisible,
  onPreviewClose,
  onImagePress,
  gallery,
  onOpenCamera,
  isGalleryOpen = false,
  scrollY = new Animated.Value(0),
  showThemeAlert = true,
  showThemePopup = () => {},
  cameraRef,
  flash,
  isCameraVisible,
  setIsCameraVisible,
  takePicture,
  toggleCameraType,
  toggleFlash,
  handleEditComplete,
  isEditingText = false,
}) => {
  const imageOpacity = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const imageScale = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT],
    outputRange: [1, 0.8],
    extrapolate: "clamp",
  });

  const galleryTranslateY = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT],
    outputRange: [IMAGE_HEIGHT + HEADER_HEIGHT, HEADER_HEIGHT],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="flex-col z-10">
        <Header
          title="Nouvelle publication"
          onBack={onBack}
          onNext={onNext}
          isEditing={isEditingText}
        />

        {/* Theme Alert */}
        {!isEditingText && showThemeAlert && <ThemeAlert theme={theme} />}
      </View>

      {isEditingText ? (
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
      ) : (
        <>
          {/* Selected Image */}
          <Animated.View
            style={{
              opacity: imageOpacity,
              transform: [{ scale: imageScale }],
              height: IMAGE_HEIGHT - 50,
            }}
            className="mx-4 mt-4 rounded-lg overflow-hidden border border-gray-700"
          >
            {imageUri ? (
              <>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={onImagePress}
                  className="w-full h-full"
                >
                  <Image source={{ uri: imageUri }} className="w-full h-full" />
                </TouchableOpacity>

                <TouchableOpacity
                  className="absolute bottom-4 right-4 bg-black bg-opacity-50 rounded-full p-2"
                  onPress={onOpenCamera}
                >
                  <Ionicons name="camera" size={24} color="white" />
                </TouchableOpacity>
              </>
            ) : (
              <View className="w-full h-full bg-gray-800 justify-center items-center">
                <IconButton
                  name="camera"
                  size={32}
                  onPress={onOpenCamera}
                  className="bg-gray-700 p-4 rounded-full"
                />
              </View>
            )}
          </Animated.View>

          {/* Gallery */}
          <Animated.View
            style={{
              transform: [{ translateY: galleryTranslateY }],
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: height - HEADER_HEIGHT,
            }}
            className="bg-black"
          >
            <View className="py-2 px-4 flex-row justify-between items-center border-b border-gray-800">
              <View className="flex-row items-center">
                <Text className="text-white text-lg font-semibold">
                  Récentes
                </Text>
                {isGalleryOpen && (
                  <TouchableOpacity
                    onPress={showThemePopup}
                    className="ml-3 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20"
                  >
                    <Text className="text-yellow-500">📸 Thème</Text>
                  </TouchableOpacity>
                )}
              </View>
              <IconButton
                onPress={() => {}}
                name={isGalleryOpen ? "chevron-down" : "chevron-up"}
                size={24}
                color="white"
              />
            </View>

            {gallery}
          </Animated.View>
        </>
      )}

      <Camera
        visible={isCameraVisible}
        cameraRef={cameraRef}
        flash={flash}
        onClose={() => setIsCameraVisible(false)}
        onTakePicture={takePicture}
        onFlipCamera={toggleCameraType}
        onFlashToggle={toggleFlash}
      />

      <ImageEditor
        editorOptions={{
          controlBar: {
            cancelButton: {
              color: "white",
              text: "Annuler",
              iconName: "x",
            },
            cropButton: {
              color: "white",
              text: "Recadrer",
              iconName: "crop",
            },
            backButton: {
              color: "white",
              text: "Retour",
              iconName: "arrow-left",
            },
            saveButton: {
              color: "white",
              text: "Terminer",
              iconName: "save",
            },
          },
        }}
        isVisible={previewVisible}
        imageUri={imageUri}
        fixedAspectRatio={1}
        minimumCropDimensions={{
          width: 50,
          height: 50,
        }}
        onEditingCancel={onPreviewClose}
        onEditingComplete={handleEditComplete}
      />
    </SafeAreaView>
  );
};
