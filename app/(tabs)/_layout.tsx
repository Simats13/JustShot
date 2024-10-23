import { Tabs } from "expo-router";
import React from "react";
import { TabBar } from "@/components/navigation/TabBar";
import { usePathname } from "expo-router";

export default function RootLayout() {
  const pathname = usePathname();

  return (
    <Tabs
      tabBar={(props) =>
        pathname === "/addShot" ? null : <TabBar {...props} />
      }
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
