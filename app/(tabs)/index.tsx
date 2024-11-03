import JustShotPhoto from "@/components/JustShotPhoto";
import { useScrollToTop } from "@react-navigation/native";
import React, { useRef, useCallback } from "react";
import { FlashList } from "@shopify/flash-list";

import {
  View,
  Text,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePostStore } from "@/hooks/usePosts";

export default function Home() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const flatListRef = useRef(null);
  const posts = usePostStore((state) => state.posts);

  const headerHeight = 60;
  const headerOpacity = useRef(new Animated.Value(1)).current;

  // Estimate the height of the bottom navigation bar
  const bottomNavHeight = 50; // Adjust this value based on your actual navbar height
  const { width } = Dimensions.get("window");

  const ITEM_SIZE = width / 3 - 8;

  useScrollToTop(flatListRef);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const diff = currentScrollY - lastScrollY.current;

      if (currentScrollY <= 0) {
        // At the top of the list
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else if (diff > 0) {
        // Scrolling down
        Animated.timing(headerOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else if (diff < 0) {
        // Scrolling up
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }

      lastScrollY.current = currentScrollY;
      scrollY.setValue(currentScrollY);
    },
    [headerOpacity, scrollY]
  );

  const renderHeader = () => (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: headerHeight + insets.top,
        backgroundColor: "white",
        opacity: headerOpacity,
        zIndex: 1000,
        paddingTop: insets.top,
        justifyContent: "center",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Accueil</Text>
    </Animated.View>
  );

  return (
    <View style={{ flex: 1 }}>
      {renderHeader()}
      <FlashList
        ref={flatListRef}
        data={posts}
        renderItem={({ item }) => <JustShotPhoto justphotoposts={item} />}
        keyExtractor={(item) => item.id.toString()}
        onScroll={handleScroll}
        estimatedItemSize={ITEM_SIZE}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: headerHeight + insets.top,
          paddingBottom: bottomNavHeight + insets.bottom + 20,
        }}
      />
    </View>
  );
}
