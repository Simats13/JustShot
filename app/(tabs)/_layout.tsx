import { Tabs } from "expo-router";
import React from "react";
import { TabBar } from "@/components/navigation/TabBar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
        }}
      />
      <Tabs.Screen
        name="addShot"
        options={{
          title: "Add Shot",
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
        }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
