import { useState, useRef, useCallback } from "react";
import { Alert, Animated } from "react-native";
import { AddShotTemplate } from "@/components/04-templates/AddShotTemplate";
import { AddShotTextTemplate } from "@/components/04-templates/AddShotTextTemplate";
import { RequestPermission } from "@/components/RequestPermission";
import { useGallery } from "@/hooks/useGallery";
import { useCamera } from "@/hooks/useCamera";
import { Gallery } from "@/components/03-organisms/Gallery";
import { usePermissions } from "@/hooks/usePermissions";
import { useAddShot } from "@/hooks/useAddShot";

const DAILY_THEME = "La nature en ville";

export const AddShot = () => {
  // Animation
  const scrollY = useRef(new Animated.Value(0)).current;

  // State
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [showThemeAlert, setShowThemeAlert] = useState(true);

  // Permissions
  const { cameraPermission, requestPermission } = usePermissions();

  // AddShot main state
  const {
    state: { selectedImage, postText, isImagePreviewVisible },
    actions: {
      setSelectedImage,
      setPostText,
      handleBack: baseHandleBack,
      handleNext: baseHandleNext,
      handleImagePreview,
    },
  } = useAddShot();

  // Gallery management
  const {
    state: {
      recentImages,
      selectedAssetId,
      isLoading,
      isGalleryOpen,
    },
    actions: { handleSelectImage, openImagePicker, closeGallery, openGallery },
    refs: { flatListRef },
  } = useGallery({
    onSelectImage: setSelectedImage,
    scrollY,
  });

  // Camera management
  const {
    state: { type, flash, cameraRef },
    actions: { toggleCameraType, toggleFlash, takePicture },
  } = useCamera({
    onCapture: (uri) => {
      setSelectedImage(uri);
      setIsCameraVisible(false);
    },
  });

  // Handlers
  const handleBack = useCallback(() => {
    if (isEditingText) {
      setIsEditingText(false);
    } else {
      baseHandleBack();
    }
  }, [isEditingText, baseHandleBack]);

  const handleNext = useCallback(() => {
    if (!isEditingText && selectedImage) {
      setIsEditingText(true);
    } else {
      baseHandleNext();
    }
  }, [isEditingText, selectedImage, baseHandleNext]);

  const showThemePopup = useCallback(() => {
    Alert.alert(
      "Thème du jour",
      DAILY_THEME,
      [{ text: "OK", onPress: () => {} }],
      { cancelable: false }
    );
  }, []);

  const handleScroll = useCallback(
    Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
      useNativeDriver: false,
      listener: (event: any) => {
        const { y } = event.nativeEvent.contentOffset;
        setShowThemeAlert(y <= 100);
      },
    }),
    []
  );

  // Permission check
  if (!cameraPermission?.granted) {
    return <RequestPermission onRequest={requestPermission} />;
  }

  return (
    <AddShotTemplate
      imageUri={selectedImage}
      caption={postText}
      onCaptionChange={setPostText}
      onBack={handleBack}
      onNext={handleNext}
      theme={DAILY_THEME}
      openGallery={openGallery}
      closeGallery={closeGallery}
      previewVisible={isImagePreviewVisible}
      onPreviewClose={() => handleImagePreview(false)}
      onImagePress={() => handleImagePreview(true)}
      handleEditComplete={(Image) => {
        setSelectedImage(Image.uri);
        handleImagePreview(false);
      }}
      gallery={
        <Gallery
          flatListRef={flatListRef}
          images={recentImages}
          selectedId={selectedAssetId}
          onSelectImage={handleSelectImage}
          onOpenPicker={openImagePicker}
          isLoading={isLoading}
          handleScroll={handleScroll}
        />
      }
      onOpenCamera={() => setIsCameraVisible(true)}
      isGalleryOpen={isGalleryOpen}
      scrollY={scrollY}
      showThemeAlert={showThemeAlert}
      showThemePopup={showThemePopup}
      cameraRef={cameraRef}
      flash={flash}
      isCameraVisible={isCameraVisible}
      setIsCameraVisible={setIsCameraVisible}
      takePicture={takePicture}
      toggleCameraType={toggleCameraType}
      toggleFlash={toggleFlash}
      isEditingText={isEditingText}
    />
  );
};

export default AddShot;
