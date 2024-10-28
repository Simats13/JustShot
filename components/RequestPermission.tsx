import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FC } from "react";
import { PermissionResponse } from "@/hooks/usePermissions";

interface RequestPermissionProps {
  onRequest: () => Promise<PermissionResponse>;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const RequestPermission: FC<RequestPermissionProps> = ({
  onRequest,
  message = "Nous avons besoin de la permission pour accéder à la caméra pour que vous puissiez prendre des photos.",
  icon = "camera",
}) => {
  const handleRequest = async () => {
    try {
      await onRequest();
    } catch (error) {
      console.error("Erreur lors de la demande de permission:", error);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-black px-6">
      <View className="items-center mb-6">
        <View className="w-16 h-16 bg-gray-800 rounded-full items-center justify-center mb-4">
          <Ionicons name={icon} size={32} color="#9CA3AF" />
        </View>
      </View>

      <Text className="text-white text-center mb-6 text-base leading-6">
        {message}
      </Text>

      <TouchableOpacity
        className="bg-blue-500 px-6 py-3 rounded-full"
        onPress={handleRequest}
      >
        <Text className="text-white text-base font-medium">
          Autoriser l'accès
        </Text>
      </TouchableOpacity>

      <Text className="text-gray-400 text-sm mt-4 text-center px-4">
        Vous pouvez modifier ce paramètre plus tard dans les réglages de votre
        appareil
      </Text>
    </View>
  );
};
