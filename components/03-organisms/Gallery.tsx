import { FC, RefObject } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { ImageThumbnail } from "@/components/02-molecules/ImageThumbnail";
import * as MediaLibrary from "expo-media-library";

interface GalleryProps {
  flatListRef: RefObject<FlashList<MediaLibrary.Asset>>;
  images: MediaLibrary.Asset[];
  selectedId: string | null;
  onSelectImage: (asset: MediaLibrary.Asset) => void;
  onOpenPicker: () => void;
  isLoading: boolean;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onEndReached?: () => void;
}

export const Gallery: FC<GalleryProps> = ({
  images,
  selectedId,
  onSelectImage,
  onOpenPicker,
  isLoading,
  handleScroll,
  flatListRef,
  onEndReached,
}) => {
  const { width } = Dimensions.get("window");
  const ITEM_SIZE = width / 3 - 8;

  const renderFooter = () => {
    if (isLoading) {
      return (
        <View className="py-4">
          <ActivityIndicator color="white" />
        </View>
      );
    }
    return null;
  };

  const renderItem = ({ item }: { item: MediaLibrary.Asset }) => (
    <ImageThumbnail
      uri={item.uri}
      onPress={() => {
        onSelectImage(item);
        flatListRef.current?.scrollToOffset({ offset: 0 });
      }}
      isSelected={item.id === selectedId}
      size={ITEM_SIZE}
    />
  );

  return (
    <View className="flex-1">
      <FlashList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        estimatedItemSize={ITEM_SIZE}
        numColumns={3}
        onScroll={handleScroll}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        scrollEventThrottle={16}
        ListFooterComponent={renderFooter}
        keyExtractor={(item) => item.id}
        drawDistance={ITEM_SIZE * 10} // Optimize rendering distance
        overrideItemLayout={(layout, item) => {
          layout.size = ITEM_SIZE;
          layout.span = 1;
        }}
      />
    </View>
  );
};
