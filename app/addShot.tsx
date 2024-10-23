import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  Animated,
  PanResponder,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = 60;
const IMAGE_HEIGHT = width;
const IMAGES_LIMIT = 50;

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
  const [currentDate, setCurrentDate] = useState<string>("");
  const [dateIndicatorVisible, setDateIndicatorVisible] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const flatListRef = useRef<FlatList<MediaLibrary.Asset>>(null);

  useEffect(() => {
    loadRecentImages();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera permissions to make this work!");
      }
    })();
  }, []);

  const loadRecentImages = async () => {
    if (mediaLibraryPermission?.status !== "granted") {
      const permission = await requestMediaLibraryPermission();
      if (permission.status !== "granted") {
        alert(
          "Désolé, nous avons besoin de l'accès à la galerie afin que puissiez partager vos meilleurs shots"
        );
        return;
      }
    }

    const assets = await MediaLibrary.getAssetsAsync({
      first: IMAGES_LIMIT,
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: ["creationTime"],
    });

    if (assets.assets.length > 0) {
      setRecentImages(assets.assets);
      const uri = await getAssetUri(assets.assets[0]);
      setSelectedAssetId(assets.assets[0].id);
      setSelectedImage(uri);
    }
  };

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

  const closeGallery = useCallback(() => {
    Animated.spring(scrollY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start(() => setIsGalleryOpen(false));
  }, [scrollY]);

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
          const asset = await MediaLibrary.createAssetAsync(photo.uri);
          setRecentImages([asset, ...recentImages]);
        }
      } catch (error) {
        console.error("Failed to take picture:", error);
      }
    }
  };

  const handleSelectImage = useCallback(
    async (asset: MediaLibrary.Asset) => {
      const uri = await getAssetUri(asset);
      setSelectedImage(uri);
      setSelectedAssetId(asset.id);
      closeGallery();
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    },
    [closeGallery]
  );

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
      
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedImage(asset.uri);
      const savedAsset = await MediaLibrary.createAssetAsync(asset.uri);
      setSelectedAssetId(savedAsset.id);
      setRecentImages([savedAsset, ...recentImages]);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleNext = () => {
    // Implement next step functionality
  };

  const formatDate = useCallback((date: Date) => {
    const days = [
      "dimanche",
      "lundi",
      "mardi",
      "mercredi",
      "jeudi",
      "vendredi",
      "samedi",
    ];
    const months = [
      "janv.",
      "févr.",
      "mars",
      "avr.",
      "mai",
      "juin",
      "juil.",
      "août",
      "sept.",
      "oct.",
      "nov.",
      "déc.",
    ];

    const now = new Date();
    const sixDaysAgo = new Date(now);
    sixDaysAgo.setDate(now.getDate() - 6);
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    if (date > sixDaysAgo) {
      return days[date.getDay()];
    } else if (date > oneYearAgo) {
      return `${day} ${month}`;
    } else {
      return `${day} ${month} ${year}`;
    }
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const { y } = event.nativeEvent.contentOffset;
        const index = Math.floor(y / (width / 3));
        if (index >= 0 && index < recentImages.length) {
          const date = new Date(recentImages[index].creationTime);
          const newDate = formatDate(date);
          if (newDate !== currentDate) {
            setCurrentDate(newDate);
          }
        }
        setDateIndicatorVisible(y > 0);
      },
    }
  );

  const openPhotoLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      alert(
        "Désolé, nous avons besoin de l'accès à la galerie pour pouvoir partager vos meilleurs shots"
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setSelectedImage(selectedAsset.uri);
        closeGallery();
      }
    } catch (error) {
      console.error("Error opening photo library:", error);
    }
  };

  const renderImageItem = useCallback(
    ({ item }: { item: MediaLibrary.Asset }) => {
      const isSelected = item.id === selectedAssetId;
      return (
        <TouchableOpacity
          onPress={() => handleSelectImage(item)}
          className="w-1/3 aspect-square p-1 relative"
        >
          <Image
            source={{
              uri: item.uri || "https://via.placeholder.com/150?text=No+Image",
            }}
            className="w-full h-full rounded-sm"
          />
          {isSelected && (
            <View className="absolute inset-0 flex items-center justify-center">
              <View className="absolute inset-0 bg-black bg-opacity-20" />
              <View className="w-6 h-6 bg-blue-500 rounded-sm flex items-center justify-center">
                <Ionicons name="checkmark" size={18} color="white" />
              </View>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [handleSelectImage, selectedAssetId]
  );

  if (!cameraPermission?.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-center mb-4">
          Nous avons besoin de la permission pour accéder à la caméra pour que
          vous puissiez prendre des photos.
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-md"
          onPress={requestCameraPermission}
        >
          <Text className="text-white text-center">Demander la permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-4 h-11 z-10">
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

      {/* Selected Image */}
      <Animated.View
        style={{
          opacity: imageOpacity,
          transform: [{ scale: imageScale }],
          height: IMAGE_HEIGHT,
        }}
        className="mx-4 rounded-lg overflow-hidden border border-gray-700"
      >
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
      >
        <View className="bg-black py-2 px-4 flex-row justify-between items-center">
          <Text className="text-white text-lg font-semibold">Récentes</Text>
          <Ionicons
            name={isGalleryOpen ? "chevron-down" : "chevron-up"}
            size={24}
            color="white"
          />
        </View>
        <Animated.FlatList
          ref={flatListRef}
          data={recentImages}
          renderItem={renderImageItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          className="flex-grow"
          ListFooterComponent={
            <TouchableOpacity
              onPress={openPhotoLibrary}
              className="w-full py-4 bg-gray-800 mb-20"
            >
              <Text className="text-white text-center">
                Voir plus de photos
              </Text>
            </TouchableOpacity>
          }
        />
        {dateIndicatorVisible && (
          <View className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full">
            <Text className="text-black text-xs font-semibold">
              {currentDate}
            </Text>
          </View>
        )}
      </Animated.View>

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
