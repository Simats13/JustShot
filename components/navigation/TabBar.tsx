import React from "react";
import { View, TouchableOpacity } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import TabBarButton from "./TabBarButton";
import { Router, useRouter } from "expo-router";

const PRIMARY_COLOR = "#FF4757";

interface TabButtonProps {
  route: any;
  index: number;
  state: any;
  descriptors: any;
  navigation: any;
  baseIndex?: number;
}

const useTabButtonProps = ({
  route,
  index,
  state,
  descriptors,
  navigation,
  baseIndex = 0,
}: TabButtonProps) => {
  const actualIndex = baseIndex + index;
  const { options } = descriptors[route.key];

  const label =
    options.tabBarLabel !== undefined
      ? options.tabBarLabel
      : options.title !== undefined
      ? options.title
      : route.name;

  const isFocused = state.index === actualIndex;

  const onPress = () => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  const onLongPress = () => {
    navigation.emit({
      type: "tabLongPress",
      target: route.key,
    });
  };

  return {
    key: route.key,
    onPress,
    onLongPress,
    isFocused,
    routeName: route.name,
    label,
  };
};

const AddButton = ({ router }: { router: Router }) => (
  <View className="flex-1 items-center justify-center z-20 mb-10">
    <TouchableOpacity
      onPress={() => router.push("/addShot")}
      className="w-14 h-14 bg-red-500 rounded-full items-center justify-center shadow-lg absolute -top-5"
    >
      <Feather name="plus" size={28} color="white" />
    </TouchableOpacity>
  </View>
);

const TabSection = ({
  routes,
  state,
  descriptors,
  navigation,
  baseIndex = 0,
}: {
  routes: any[];
  state: any;
  descriptors: any;
  navigation: any;
  baseIndex?: number;
}) => (
  <>
    {routes.map((route, index) => {
      const props = useTabButtonProps({
        route,
        index,
        state,
        descriptors,
        navigation,
        baseIndex,
      });

      return <TabBarButton {...props} primaryColor={PRIMARY_COLOR} />;
    })}
  </>
);

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const midPoint = Math.floor(state.routes.length / 2);
  const leftRoutes = state.routes.slice(0, midPoint);
  const rightRoutes = state.routes.slice(midPoint);

  return (
    <View className="absolute bottom-6 left-4 right-4">
      <View className="flex-row bg-white rounded-3xl shadow-lg shadow-black/25 h-16 items-center justify-between px-2 relative">
        <TabSection
          routes={leftRoutes}
          state={state}
          descriptors={descriptors}
          navigation={navigation}
        />

        <AddButton router={router} />

        <TabSection
          routes={rightRoutes}
          state={state}
          descriptors={descriptors}
          navigation={navigation}
          baseIndex={midPoint}
        />
      </View>
    </View>
  );
}
