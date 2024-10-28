import { FlatList, Dimensions } from "react-native";
import * as MediaLibrary from "expo-media-library";
import { FC } from "react";
import { ImageThumbnail } from "../02-molecules/ImageThumbnail";

const { width } = Dimensions.get("window");

interface ImageGridProps {
  images: MediaLibrary.Asset[];
  selectedId: string | null;
  onSelectImage: (asset: MediaLibrary.Asset) => void;
  onEndReached?: () => void;
}

export const ImageGrid: FC<ImageGridProps> = ({
  images,
  selectedId,
  onSelectImage,
  onEndReached,
}) => (
  <FlatList
    data={images}
    renderItem={({ item }) => (
      <ImageThumbnail
        uri={item.uri}
        onPress={() => onSelectImage(item)}
        isSelected={item.id === selectedId}
        size={width / 3 - 8}
      />
    )}
    keyExtractor={(item) => item.id}
    numColumns={3}
    onEndReached={onEndReached}
    onEndReachedThreshold={0.5}
    className="flex-grow"
  />
);

// src/organisms/ImageGrid/index.ts
export * from "./ImageGrid";
