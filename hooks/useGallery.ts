import { useState, useCallback, useRef, useEffect, RefObject } from "react";
import { Animated, FlatList } from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import { Platform, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";

interface UseGalleryProps {
  onSelectImage: (uri: string) => void;
  scrollY?: Animated.Value;
}

interface GalleryState {
  recentImages: MediaLibrary.Asset[];
  selectedAssetId: string | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: MediaLibrary.PermissionStatus | null;
  isGalleryOpen: boolean;
}

interface GalleryActions {
  loadRecentImages: () => Promise<void>;
  handleSelectImage: (asset: MediaLibrary.Asset) => Promise<void>;
  openImagePicker: () => Promise<void>;
  retryLoadImages: () => Promise<void>;
  closeGallery: () => void;
  openGallery: () => void;
}

export const useGallery = ({
  onSelectImage,
  scrollY = new Animated.Value(0),
}: UseGalleryProps): {
  state: GalleryState;
  actions: GalleryActions;
  refs: {
    flatListRef: RefObject<FlashList<MediaLibrary.Asset>>;
  };
} => {
  // State
  const [state, setState] = useState<GalleryState>({
    recentImages: [],
    selectedAssetId: null,
    isLoading: false,
    error: null,
    permissionStatus: null,
    isGalleryOpen: false,
  });

  // Refs
  const flatListRef = useRef<FlashList<MediaLibrary.Asset>>(null);

  // Permission handling
  const checkAndRequestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      setState((prev) => ({ ...prev, permissionStatus: status }));

      if (status !== "granted") {
        const { status: newStatus } =
          await MediaLibrary.requestPermissionsAsync();
        setState((prev) => ({ ...prev, permissionStatus: newStatus }));

        if (newStatus !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please grant access to your photo library to use this feature.",
            [{ text: "OK", onPress: () => console.log("Permission denied") }]
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Permission error:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to get permissions",
        isLoading: false,
      }));
      return false;
    }
  };

  const closeGallery = useCallback(() => {
    Animated.spring(scrollY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start(() => {
      setState((prev) => ({ ...prev, isGalleryOpen: false }));
    });
  }, [scrollY]);

  const openGallery = useCallback(() => {
    Animated.spring(scrollY, {
      toValue: 1000,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start(() => {
      setState((prev) => ({ ...prev, isGalleryOpen: true }));
    });
  }, [scrollY]);

  // Load all images
  const loadRecentImages = useCallback(async () => {
    if (state.isLoading) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const hasPermission = await checkAndRequestPermissions();
      if (!hasPermission) return;

      // Get all assets without specifying an album
      const initialQuery = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [["creationTime", false]],
      });

      if (initialQuery.totalCount === 0) {
        setState((prev) => ({
          ...prev,
          recentImages: [],
          isLoading: false,
        }));
        return;
      }

      // Load all assets in a single request
      const response = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [["creationTime", false]],
        first: initialQuery.totalCount,
      });

      setState((prev) => ({
        ...prev,
        recentImages: response.assets,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Error loading images:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to load images",
        isLoading: false,
      }));
    }
  }, [state.isLoading]);

  // Select image
  const handleSelectImage = useCallback(
    async (asset: MediaLibrary.Asset) => {
      try {
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
        const uri =
          Platform.OS === "android"
            ? asset.uri
            : assetInfo.localUri || assetInfo.uri;

        onSelectImage(uri);
      } catch (error) {
        console.error("Error selecting image:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to select image",
        }));
      }
    },
    [onSelectImage, closeGallery]
  );

  // Image picker
  const openImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        onSelectImage(asset.uri);
        flatListRef.current?.scrollToOffset({ offset: 0 });
        closeGallery();
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to open image picker",
      }));
    }
  };

  // Retry loading images
  const retryLoadImages = async () => {
    setState((prev) => ({ ...prev, error: null }));
    await loadRecentImages();
  };

  // Initial load
  useEffect(() => {
    loadRecentImages();
  }, []);

  return {
    state: {
      recentImages: state.recentImages,
      selectedAssetId: state.selectedAssetId,
      isLoading: state.isLoading,
      error: state.error,
      permissionStatus: state.permissionStatus,
      isGalleryOpen: state.isGalleryOpen,
    },
    actions: {
      loadRecentImages,
      handleSelectImage,
      openImagePicker,
      retryLoadImages,
      closeGallery,
      openGallery,
    },
    refs: {
      flatListRef,
    },
  };
};
