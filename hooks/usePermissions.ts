export interface PermissionStatus {
  status: "granted" | "denied" | "undetermined";
  granted: boolean;
  canAskAgain?: boolean;
}

export interface PermissionResponse {
  status: "granted" | "denied" | "undetermined";
  granted: boolean;
  canAskAgain: boolean;
}

import { useState, useEffect, useCallback } from "react";
import { Alert, Linking } from "react-native";
import { useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";

export const usePermissions = () => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
    useState(false);

  const checkAndRequestMediaLibrary = useCallback(async () => {
    const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();

    if (status === "granted") {
      setHasMediaLibraryPermission(true);
      return true;
    }

    if (canAskAgain) {
      const { status: newStatus } =
        await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(newStatus === "granted");
      return newStatus === "granted";
    }

    Alert.alert(
      "Permission requise",
      "L'accès à la galerie est nécessaire pour sauvegarder vos photos. Veuillez l'activer dans les paramètres.",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Ouvrir les paramètres",
          onPress: () => Linking.openSettings(),
        },
      ]
    );

    return false;
  }, []);

  const requestPermission =
    useCallback(async (): Promise<PermissionResponse> => {
      try {
        // Request camera permission
        const cameraResult = await requestCameraPermission();

        if (!cameraResult.granted) {
          return {
            status: "denied",
            granted: false,
            canAskAgain: true,
          };
        }

        // Request media library permission
        const hasLibraryPermission = await checkAndRequestMediaLibrary();

        if (!hasLibraryPermission) {
          return {
            status: "denied",
            granted: false,
            canAskAgain: true,
          };
        }

        return {
          status: "granted",
          granted: true,
          canAskAgain: true,
        };
      } catch (error) {
        console.error("Error requesting permissions:", error);
        return {
          status: "denied",
          granted: false,
          canAskAgain: true,
        };
      }
    }, [requestCameraPermission, checkAndRequestMediaLibrary]);

  useEffect(() => {
    checkAndRequestMediaLibrary();
  }, [checkAndRequestMediaLibrary]);

  return {
    cameraPermission,
    hasMediaLibraryPermission,
    requestPermission,
  };
};
