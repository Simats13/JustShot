import { FC, RefObject } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { ImageThumbnail } from "@/components/02-molecules/ImageThumbnail";
import * as MediaLibrary from "expo-media-library";

interface GalleryProps {
  flatListRef: RefObject<FlatList<MediaLibrary.Asset>>;
  images: MediaLibrary.Asset[];
  selectedId: string | null;
  onSelectImage: (asset: MediaLibrary.Asset) => void;
  onOpenPicker: () => void;
  isLoading: boolean;
  hasMoreImages: boolean;
  handleScroll: any;
}

export const Gallery: FC<GalleryProps> = ({
  images,
  selectedId,
  onSelectImage,
  onOpenPicker,
  isLoading,
  hasMoreImages,
  handleScroll,
  flatListRef,
}) => {
  const { width } = Dimensions.get("window");

  const renderFooter = () => {
    if (isLoading) {
      return (
        <View className="py-4">
          <ActivityIndicator color="white" />
        </View>
      );
    }

    if (hasMoreImages) {
      return (
        <TouchableOpacity
          onPress={onOpenPicker}
          className="w-full py-4 bg-gray-800 mb-24"
        >
          <Text className="text-white text-center">Voir plus de photos</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <FlatList
      ref={flatListRef}
      data={images}
      renderItem={({ item }) => (
        <ImageThumbnail
          uri={item.uri}
          onPress={() => {
            onSelectImage(item);
            flatListRef.current?.scrollToOffset({ offset: 0 });
          }}
          isSelected={item.id === selectedId}
          size={width / 3 - 8}
        />
      )}
      keyExtractor={(item) => item.id}
      numColumns={3}
      onScroll={handleScroll}
      onEndReachedThreshold={0.5}
      scrollEventThrottle={16}
      className="flex-grow"
      ListFooterComponent={renderFooter}
    />
  );
};
