import React from "react";
import { Image, Text, View, TouchableOpacity } from "react-native";
import { JustPhotoType } from "../types/JustPhotoTypes";
import { Entypo } from "@expo/vector-icons";

type JustPhotoProps = {
  justphotoposts: JustPhotoType;
};

type IconButtonProps = {
  name: React.ComponentProps<typeof Entypo>["name"];
  size: number;
  color: string;
  count?: number;
  onPress?: () => void;
};

const IconButton: React.FC<IconButtonProps> = ({
  name,
  size,
  color,
  count,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress} className="flex-row items-center">
    <Entypo name={name} size={size} color={color} />
    {count !== undefined && <Text className="ml-1 text-gray-500">{count}</Text>}
  </TouchableOpacity>
);

const FloatingButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity  onPress={onPress} className="bg-blue-500 p-2 rounded-full">
    <Entypo name="plus" size={24} color="white" />
  </TouchableOpacity>
);

const JustShotPhoto: React.FC<JustPhotoProps> = ({ justphotoposts }) => {
  return (
    <View className="flex-1 p-2 bg-white">
      <View className="flex-row">
        <Image
          source={{ uri: justphotoposts.user.image }}
          className="w-12 h-12 rounded-full"
        />
        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-wrap flex-1">
              <Text className="font-bold">{justphotoposts.user.name}</Text>
              <Text className="ml-1 text-gray-500">
                @{justphotoposts.user.username}
              </Text>
              <Text className="ml-1 text-gray-500">·</Text>
              <Text className="ml-1 text-gray-500">
                {(() => {
                  const createdAt = new Date(justphotoposts.createdAt);
                  const now = new Date();
                  const diffTime = Math.abs(
                    now.getTime() - createdAt.getTime()
                  );
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                  if (diffDays > 7) {
                    return createdAt.toLocaleDateString();
                  } else if (diffDays >= 1) {
                    return `${diffDays} j`;
                  } else {
                    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                    return `${diffHours} h`;
                  }
                })()}
              </Text>
            </View>
            <Entypo name="dots-three-horizontal" size={15} color="black" />
          </View>
          <Text className="mt-2 leading-5">{justphotoposts.content}</Text>
          {justphotoposts.image && (
            <Image
              source={{ uri: justphotoposts.image }}
              className="w-full h-52 rounded-lg mt-2"
            />
          )}
          <View className="flex-row justify-between mt-2">
            <IconButton
              name="chat"
              size={20}
              color="gray"
              count={justphotoposts.numberOfComments}
            />
            <IconButton
              name="retweet"
              size={20}
              color="gray"
              count={justphotoposts.numberOfRetweets}
            />
            <IconButton
              name="heart"
              size={20}
              color="gray"
              count={justphotoposts.numberOfLikes}
            />
            <IconButton name="share" size={20} color="gray" />
          </View>
        </View>
      </View>
    </View>
  );
};

export default JustShotPhoto;
