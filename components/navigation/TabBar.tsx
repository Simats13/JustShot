import React from "react";
import { View, TouchableOpacity } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import TabBarButton from "./TabBarButton";

const PRIMARY_COLOR = "#FF4757"; // Red color for the add button

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View className="absolute bottom-6 left-4 right-4">
      <View className="flex-row bg-white rounded-3xl shadow-lg shadow-black/25 h-16 items-center justify-between px-2 relative">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

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

          if (route.name === "addShot") {
            return (
              <View key={route.key} className="flex-1 items-center justify-center z-20 mb-10">
                <TouchableOpacity
                  onPress={onPress}
                  className="w-14 h-14 bg-red-500 rounded-full items-center justify-center shadow-lg absolute -top-5"
                >
                  <Feather name="plus" size={28} color="white" />
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TabBarButton
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              isFocused={isFocused}
              routeName={route.name}
              label={label as string}
              primaryColor={PRIMARY_COLOR}
            />
          );
        })}
      </View>
    </View>
  );
}