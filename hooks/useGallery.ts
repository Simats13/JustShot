import { useState, useCallback, useRef, useEffect, RefObject } from "react";
import { Animated, FlatList } from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import { Platform, Alert } from "react-native";

interface UseGalleryProps {
  onSelectImage: (uri: string) => void;
  imagesPerPage?: number;
  scrollY?: Animated.Value;
}

interface GalleryState {
  recentImages: MediaLibrary.Asset[];
  selectedAssetId: string | null;
  isLoading: boolean;
  hasMoreImages: boolean;
  error: string | null;
  permissionStatus: MediaLibrary.PermissionStatus | null;
  isGalleryOpen: boolean;
}

interface GalleryActions {
  loadRecentImages: (nextPage?: number) => Promise<void>;
  handleSelectImage: (asset: MediaLibrary.Asset) => Promise<void>;
  openImagePicker: () => Promise<void>;
  retryLoadImages: () => Promise<void>;
  closeGallery: () => void;
}

export const useGallery = ({
  onSelectImage,
  imagesPerPage = 30,
  scrollY = new Animated.Value(0),
}: UseGalleryProps): {
  state: GalleryState;
  actions: GalleryActions;
  refs: {
    flatListRef: RefObject<FlatList<MediaLibrary.Asset>>;
  };
} => {
  // State
  const [state, setState] = useState<GalleryState>({
    recentImages: [],
    selectedAssetId: null,
    isLoading: false,
    hasMoreImages: true,
    error: null,
    permissionStatus: null,
    isGalleryOpen: false,
  });

  // Refs
  const endCursorRef = useRef<string | undefined>(undefined);
  const pageRef = useRef<number>(1);
  const flatListRef = useRef<FlatList<MediaLibrary.Asset>>(null);

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

  // Load images
  const loadRecentImages = useCallback(
    async (nextPage = 1) => {
      if (state.isLoading || (!state.hasMoreImages && nextPage !== 1)) {
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const hasPermission = await checkAndRequestPermissions();
        if (!hasPermission) return;

        const albums = await MediaLibrary.getAlbumsAsync();
        const cameraRoll = albums.find(
          (album) =>
            album.title === "Camera Roll" ||
            album.title === "Recent" ||
            album.title === "All Photos"
        );

        const options: MediaLibrary.AssetsOptions = {
          first: imagesPerPage,
          mediaType: MediaLibrary.MediaType.photo,
          sortBy: [["creationTime", false]],
          after: nextPage === 1 ? undefined : endCursorRef.current,
          album: cameraRoll,
        };

        const response = await MediaLibrary.getAssetsAsync(options);
        const newAssets = response.assets;

        setState((prev) => ({
          ...prev,
          recentImages:
            nextPage === 1 ? newAssets : [...prev.recentImages, ...newAssets],
          hasMoreImages: response.hasNextPage,
          isLoading: false,
          error: null,
        }));

        if (nextPage === 1 && newAssets.length > 0) {
          const firstAsset = newAssets[0];
          handleSelectImage(firstAsset);
        }

        endCursorRef.current = response.endCursor;
        pageRef.current = nextPage;
      } catch (error) {
        console.error("Error loading images:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to load images",
          isLoading: false,
        }));
      }
    },
    [state.isLoading, state.hasMoreImages, imagesPerPage]
  );

  // Select image
  const handleSelectImage = useCallback(
    async (asset: MediaLibrary.Asset) => {
      try {
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
        const uri =
          Platform.OS === "android"
            ? asset.uri
            : assetInfo.localUri || assetInfo.uri;

        setState((prev) => ({ ...prev, selectedAssetId: asset.id }));
        onSelectImage(uri);
        closeGallery();
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
        await loadRecentImages(1);
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
    await loadRecentImages(1);
  };

  // Initial load
  useEffect(() => {
    loadRecentImages(1);
  }, []);

  return {
    state: {
      recentImages: state.recentImages,
      selectedAssetId: state.selectedAssetId,
      isLoading: state.isLoading,
      hasMoreImages: state.hasMoreImages,
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
    },
    refs: {
      flatListRef,
    },
  };
};
