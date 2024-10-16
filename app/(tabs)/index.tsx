import React, { useRef, useState, useCallback } from "react";
import {
  View,
  FlatList,
  Alert,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useScrollToTop } from "@react-navigation/native";
import JustShotPhoto from "@/components/JustShotPhoto";
import tweets from "@/app/config/tweets";
import { FloatingButton } from "@/components/FloatingButton";

const SCROLL_DISTANCE = 100;

export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastOffsetY = useRef(0);

  useScrollToTop(flatListRef);

  const handleScroll = Animated.event<NativeScrollEvent>(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentOffsetY = event.nativeEvent.contentOffset.y;
        if (currentOffsetY > lastOffsetY.current) {
          setIsScrollingDown(true);
        } else if (currentOffsetY < lastOffsetY.current) {
          setIsScrollingDown(false);
        }
        lastOffsetY.current = currentOffsetY;
      },
    }
  );

  const handleFloatingButtonPress = useCallback(() => {
    Alert.alert("New Post", "Create a new post?", [
      { text: "Cancel", style: "cancel" },
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);
  }, []);

  const animatedOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [1, 0.5],
    extrapolate: "clamp",
  });

  const buttonOpacity = Animated.add(
    Animated.multiply(isScrollingDown ? 1 : 0, animatedOpacity),
    Animated.multiply(isScrollingDown ? 0 : 1, new Animated.Value(1))
  );

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-white">
        <Animated.FlatList
          ref={flatListRef}
          data={tweets}
          renderItem={({ item }) => <JustShotPhoto justphotoposts={item} />}
          keyExtractor={(item) => item.id.toString()}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
        <FloatingButton
          onPress={handleFloatingButtonPress}
          opacity={buttonOpacity}
        />
      </View>
    </GestureHandlerRootView>
  );
}
