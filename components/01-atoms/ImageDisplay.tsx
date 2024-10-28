import { Image } from "expo-image";

interface ImageDisplayProps {
  uri: string;
  className?: string;
}

export const ImageDisplay = ({ uri, className = "" }: ImageDisplayProps) => (
  <Image source={{ uri }} className={`w-full h-full ${className}`} />
);
