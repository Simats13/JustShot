import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
  PanResponder,
  StatusBar,
  SafeAreaView,
  Easing,
  StyleSheet,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = 60;
const IMAGE_MAX_HEIGHT = width;
const IMAGE_MIN_HEIGHT = 0;

const AddShot: React.FC = () => {
  const [type, setType] = useState<CameraType>("back");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [recentImages, setRecentImages] = useState<MediaLibrary.Asset[]>([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    MediaLibrary.usePermissions();
  const router = useRouter();

  const STATUS_BAR_HEIGHT =
    Platform.OS === "ios" ? 20 : StatusBar.currentHeight || 0;

  const scrollY = useRef(new Animated.Value(0)).current;
  const [currentScrollY, setCurrentScrollY] = useState(0);
  const [isFullyOpen, setIsFullyOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    loadRecentImages();
  }, []);

  const loadRecentImages = async () => {
    if (mediaLibraryPermission?.status !== "granted") {
      const permission = await requestMediaLibraryPermission();
      if (permission.status !== "granted") {
        alert("Sorry, we need media library permissions to make this work!");
        return;
      }
    }

    const assets = await MediaLibrary.getAssetsAsync({
      first: 20,
      mediaType: "photo",
      sortBy: ["creationTime"],
    });

    if (assets.assets.length > 0) {
      setRecentImages(assets.assets);
      const uri = await getAssetUri(assets.assets[0]);
      setSelectedImage(uri);
    }
  };

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      setCurrentScrollY(value);
    });
    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY]);

  const animateGallery = (toValue: number, callback?: () => void) => {
    Animated.timing(scrollY, {
      toValue,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.cubic),
    }).start(() => {
      setIsFullyOpen(toValue === IMAGE_MAX_HEIGHT);
      callback?.();
    });
  };

  const openGallery = () => {
    animateGallery(IMAGE_MAX_HEIGHT);
  };

  const closeGallery = () => {
    animateGallery(0);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        let newValue = currentScrollY - gestureState.dy;
        newValue = Math.max(0, Math.min(newValue, IMAGE_MAX_HEIGHT));
        scrollY.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50 && !isFullyOpen) {
          openGallery();
        } else if (gestureState.dy > 50 && isFullyOpen) {
          closeGallery();
        } else {
          animateGallery(isFullyOpen ? IMAGE_MAX_HEIGHT : 0);
        }
      },
    })
  ).current;

  const imageHeight = scrollY.interpolate({
    inputRange: [0, IMAGE_MAX_HEIGHT],
    outputRange: [IMAGE_MAX_HEIGHT, IMAGE_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  const galleryHeight = scrollY.interpolate({
    inputRange: [0, IMAGE_MAX_HEIGHT],
    outputRange: [
      height - STATUS_BAR_HEIGHT - HEADER_HEIGHT - IMAGE_MAX_HEIGHT,
      height - STATUS_BAR_HEIGHT - HEADER_HEIGHT,
    ],
    extrapolate: "clamp",
  });

  const getAssetUri = async (asset: MediaLibrary.Asset): Promise<string> => {
    if (Platform.OS === "android") return asset.uri;
    const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
    return assetInfo.localUri || assetInfo.uri;
  };

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo && photo.uri) {
          setSelectedImage(photo.uri);
          setCameraVisible(false);
          // Optionally, you can save the photo to the media library here
          const asset = await MediaLibrary.createAssetAsync(photo.uri);
          setRecentImages([asset, ...recentImages]);
        }
      } catch (error) {
        console.error("Failed to take picture:", error);
      }
    }
  };

  const handleSelectImage = async (asset: MediaLibrary.Asset) => {
    const uri = await getAssetUri(asset);
    setSelectedImage(uri);
  };

  const openCamera = () => {
    setCameraVisible(true);
  };
  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  const handleNext = () => {
    // Implement next step functionality
  };

  if (!cameraPermission?.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-center mb-4">
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-md"
          onPress={requestCameraPermission}
        >
          <Text className="text-white text-center">Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-4 h-11">
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">
          Nouvelle publication
        </Text>
        <TouchableOpacity onPress={handleNext}>
          <Text className="text-blue-500 text-base">Suivant</Text>
        </TouchableOpacity>
      </View>

      {/* Image sélectionnée */}
      <Animated.View
        style={{
          height: imageHeight,
          overflow: "hidden",
        }}
      >
        <View className="flex-1 mx-4 rounded-lg overflow-hidden border border-gray-700">
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} className="w-full h-full" />
          ) : (
            <View className="w-full h-full bg-gray-800" />
          )}
          <TouchableOpacity
            className="absolute bottom-4 right-4 bg-black bg-opacity-50 rounded-full p-2"
            onPress={openCamera}
          >
            <Ionicons name="camera" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Galerie */}
      <Animated.View style={{ height: galleryHeight }}>
        <View
          {...panResponder.panHandlers}
          className="bg-black py-2 px-4 flex-row justify-between items-center"
        >
          <Text className="text-white text-lg font-semibold">Récentes</Text>
          <Ionicons
            name={isFullyOpen ? "chevron-down" : "chevron-up"}
            size={24}
            color="white"
          />
        </View>
        <ScrollView>
          <View className="flex-row flex-wrap justify-between px-1">
            {recentImages.map((asset) => (
              <TouchableOpacity
                key={asset.id}
                onPress={() => {
                  handleSelectImage(asset);
                  closeGallery();
                }}
                className="w-1/3 aspect-square p-1"
              >
                <Image
                  source={{
                    uri:
                      asset.uri ||
                      "https://via.placeholder.com/150?text=No+Image",
                  }}
                  className="w-full h-full"
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Camera view (conditionally rendered) */}
      {cameraVisible && (
        <View className="absolute inset-0">
          <CameraView ref={cameraRef} className="flex-1">
            <View className="flex-row justify-around items-center absolute bottom-5 left-0 right-0">
              <TouchableOpacity
                onPress={() => setType(type === "back" ? "front" : "back")}
              >
                <Ionicons name="camera-reverse" size={30} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleTakePicture}>
                <View className="w-16 h-16 rounded-full bg-white border-4 border-opacity-50" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCameraVisible(false)}>
                <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AddShot;
