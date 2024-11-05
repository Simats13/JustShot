import JustShotPhoto from "@/components/JustShotPhoto";
import { useScrollToTop } from "@react-navigation/native";
import React, { useRef, useCallback, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import {
  View,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePosts } from "@/hooks/usePosts";

export default function Home() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  const bottomNavHeight = 50;
  const { width } = Dimensions.get("window");
  const ITEM_SIZE = width / 3 - 8;

  useScrollToTop(flatListRef);

  const { data: posts, isLoading, refetch: fetchPosts } = usePosts();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPosts();
    } catch (error) {
      console.error("Error refreshing posts:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPosts]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
        paddingTop: insets.top,
        paddingBottom: insets.bottom + bottomNavHeight + 20,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlashList
          ref={flatListRef}
          data={posts}
          renderItem={({ item }) => <JustShotPhoto justphotoposts={item} />}
          keyExtractor={(item) => item.id.toString()}
          estimatedItemSize={ITEM_SIZE}
          removeClippedSubviews={true}
          scrollEventThrottle={16}
          drawDistance={ITEM_SIZE * 2}
          overrideItemLayout={(layout, item) => {
            layout.size = ITEM_SIZE;
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}
