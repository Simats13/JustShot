// src/pages/AddShot/AddShot.tsx
import { FC, useState, useRef } from "react";
import { Animated } from "react-native";
import { AddShotTemplate } from "@/components/04-templates/AddShotTemplate";
import { AddShotTextTemplate } from "@/components/04-templates/AddShotTextTemplate";
import { RequestPermission } from "@/components/RequestPermission";
import { useGallery } from "@/hooks/useGallery";
import { useCamera } from "@/hooks/useCamera";
import { Gallery } from "@/components/03-organisms/Gallery";
import { Camera } from "@/components/03-organisms/Camera";
import { usePermissions } from "@/hooks/usePermissions";
import { useAddShot } from "@/hooks/useAddShot";

const DAILY_THEME = "La nature en ville";

export const AddShotPage = () => {
  const { cameraPermission, requestPermission } = usePermissions();

  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [showThemeAlert, setShowThemeAlert] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const scrollY = useRef(new Animated.Value(0)).current;

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

  const {
    state: { recentImages, selectedAssetId, isLoading, hasMoreImages },
    actions: { handleSelectImage, openImagePicker },
  } = useGallery({
    onSelectImage: setSelectedImage,
  });

  const {
    state: { type, flash, isRecording, cameraRef },
    actions: { toggleCameraType, toggleFlash, takePicture },
  } = useCamera({
    onCapture: (uri) => {
      setSelectedImage(uri);
      setIsCameraVisible(false);
    },
  });

  console.log("AddShotPage");
  console.log("selectedImage", selectedImage);
  console.log("recentImages", recentImages);

  const handleBack = () => {
    if (isEditingText) {
      setIsEditingText(false);
    } else {
      baseHandleBack();
    }
  };

  const handleNext = () => {
    if (!isEditingText && selectedImage) {
      setIsEditingText(true);
    } else {
      baseHandleNext();
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const { y } = event.nativeEvent.contentOffset;
        setIsGalleryOpen(y > 100);
        setShowThemeAlert(y <= 100);
      },
    }
  );

  if (!cameraPermission?.granted) {
    return <RequestPermission onRequest={requestPermission} />;
  }

  return (
    <>
      {isEditingText ? (
        <AddShotTextTemplate
          imageUri={selectedImage}
          caption={postText}
          onCaptionChange={setPostText}
          onBack={handleBack}
          onNext={handleNext}
          theme={DAILY_THEME}
          previewVisible={isImagePreviewVisible}
          onPreviewClose={() => handleImagePreview(false)}
          onImagePress={() => handleImagePreview(true)}
        />
      ) : (
        <AddShotTemplate
          imageUri={selectedImage}
          caption={postText}
          onCaptionChange={setPostText}
          onBack={handleBack}
          onNext={handleNext}
          theme={DAILY_THEME}
          previewVisible={isImagePreviewVisible}
          onPreviewClose={() => handleImagePreview(false)}
          onImagePress={() => handleImagePreview(true)}
          gallery={
            <Gallery
              images={recentImages}
              selectedId={selectedAssetId}
              onSelectImage={handleSelectImage}
              onOpenPicker={openImagePicker}
              isLoading={isLoading}
              hasMoreImages={hasMoreImages}
              handleScroll={handleScroll}
            />
          }
          onOpenCamera={() => setIsCameraVisible(true)}
          isGalleryOpen={isGalleryOpen}
          scrollY={scrollY}
          showThemeAlert={showThemeAlert}
          showThemePopup={() => setShowThemeAlert(true)}
        />
      )}

      {isCameraVisible && (
        <Camera
          cameraRef={cameraRef}
          flash={flash}
          onClose={() => setIsCameraVisible(false)}
          onTakePicture={takePicture}
          onFlipCamera={toggleCameraType}
          onFlashToggle={toggleFlash}
        />
      )}
    </>
  );
};

export default AddShotPage;
