import { useRef, useState, useCallback } from "react";
import { CameraType, CameraView } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

interface UseCameraProps {
  onCapture: (uri: string) => void;
  onAssetCreated?: (asset: MediaLibrary.Asset) => void;
}

export const useCamera = ({ onCapture, onAssetCreated }: UseCameraProps) => {
  const [type, setType] = useState<CameraType>("back");
  const [isRecording, setIsRecording] = useState(false);
  const [flash, setFlash] = useState<"off" | "on" | "auto">("off");
  const cameraRef = useRef<CameraView>(null);

  const toggleCameraType = useCallback(() => {
    setType((current) => (current === "back" ? "front" : "back"));
  }, []);

  const toggleFlash = useCallback(() => {
    setFlash((current) => {
      switch (current) {
        case "off":
          return "on";
        case "on":
          return "auto";
        case "auto":
          return "off";
      }
    });
  }, []);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || isRecording) {
      console.log("Camera not ready or recording in progress");
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
      });

      if (photo && photo.uri) {
        // Create asset first
        const asset = await MediaLibrary.createAssetAsync(photo.uri);

        // Notify about the new uri
        onCapture(photo.uri);

        // Notify about the new asset if callback provided
        if (onAssetCreated) {
          onAssetCreated(asset);
        }

        return {
          uri: photo.uri,
          asset,
        };
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      throw new Error("Failed to take picture");
    }
  }, [isRecording, onCapture, onAssetCreated]);

  return {
    state: {
      type,
      flash,
      isRecording,
      cameraRef,
    },
    actions: {
      toggleCameraType,
      toggleFlash,
      takePicture,
    },
  };
};
