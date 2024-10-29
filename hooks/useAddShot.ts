export interface AddShotState {
  selectedImage: string | null;
  postText: string;
  isImagePreviewVisible: boolean;
  isEditing: boolean;
}

export interface AddShotActions {
  setSelectedImage: (uri: string | null) => void;
  setPostText: (text: string) => void;
  handleBack: () => void;
  handleNext: () => void;
  handleImagePreview: (visible: boolean) => void;
}

// src/hooks/useAddShot/useAddShot.ts
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

interface UseAddShotReturn {
  state: AddShotState;
  actions: AddShotActions;
}

export const useAddShot = (): UseAddShotReturn => {
  const router = useRouter();
  const [state, setState] = useState<AddShotState>({
    selectedImage: null,
    postText: "",
    isImagePreviewVisible: false,
    isEditing: false,
  });

  const setSelectedImage = useCallback((uri: string | null) => {
    setState((prev) => ({ ...prev, selectedImage: uri }));
  }, []);

  const setPostText = useCallback((text: string) => {
    setState((prev) => ({ ...prev, postText: text }));
  }, []);

  const handleBack = useCallback(() => {
    if (state.selectedImage || state.postText) {
      Alert.alert(
        "Abandonner la publication ?",
        "Si vous quittez maintenant, vous perdrez les modifications apportées.",
        [
          {
            text: "Continuer la modification",
            style: "cancel",
          },
          {
            text: "Abandonner",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  }, [router, state.selectedImage, state.postText]);

  const validatePost = () => {
    if (!state.selectedImage) {
      Alert.alert("Erreur", "Veuillez sélectionner une image");
      return false;
    }

    if (!state.postText.trim()) {
      Alert.alert("Erreur", "Veuillez ajouter une légende");
      return false;
    }

    if (state.postText.length > 2200) {
      Alert.alert(
        "Erreur",
        "La légende est trop longue (maximum 2200 caractères)"
      );
      return false;
    }

    return true;
  };

  const handleNext = useCallback(() => {
    if (state.isEditing) {
      // If we're in editing mode, validate the entire post
      if (validatePost()) {
        // TODO: Here you would typically handle the submission
        // For example: submitPost(state.selectedImage, state.postText)
        console.log("Post validated and ready for submission");
      }
    } else {
      // If we're not in editing mode, just check for image selection
      if (!state.selectedImage) {
        Alert.alert("Erreur", "Veuillez sélectionner une image");
        return;
      }
      setState((prev) => ({ ...prev, isEditing: true }));
    }
  }, [state.isEditing, state.selectedImage, validatePost]);

  const handleImagePreview = useCallback((visible: boolean) => {
    setState((prev) => ({ ...prev, isImagePreviewVisible: visible }));
  }, []);

  return {
    state,
    actions: {
      setSelectedImage,
      setPostText,
      handleBack,
      handleNext,
      handleImagePreview,
    },
  };
};
