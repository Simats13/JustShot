import { JustPhotoType } from "@/types/JustPhotoTypes";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/app/config/firebase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const db = getFirestore(app);
const storage = getStorage(app);

export const queryKeys = {
  posts: ["posts"] as const,
};

const fetchPosts = async (): Promise<JustPhotoType[]> => {
  try {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    })) as JustPhotoType[];
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

const convertLocalFileToBlob = async (localPath: string): Promise<Blob> => {
  try {
    // For React Native, you'll need to use the appropriate file reading method
    // This example uses fetch which works in React Native
    const response = await fetch(localPath);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error("Error converting file to blob:", error);
    throw error;
  }
};

const uploadImage = async (imagePath: string): Promise<string> => {
  try {
    const blob = await convertLocalFileToBlob(imagePath);
    const fileExtension = imagePath.split(".").pop()?.toLowerCase() || "jpg";
    const storageRef = ref(storage, `images/${Date.now()}.${fileExtension}`);

    // Upload the blob
    await uploadBytes(storageRef, blob);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

const addPost = async (
  newPost: Omit<JustPhotoType, "id" | "createdAt">
): Promise<JustPhotoType> => {
  try {
    let imageUrl = newPost.image;

    // Check if image is a local file path
    if (newPost.image && newPost.image.startsWith("file://")) {
      imageUrl = await uploadImage(newPost.image);
    }

    const postToAdd = {
      ...newPost,
      image: imageUrl,
      createdAt: serverTimestamp(),
    };

    const postsRef = collection(db, "posts");
    const docRef = await addDoc(postsRef, postToAdd);

    return {
      ...postToAdd,
      id: docRef.id,
      createdAt: new Date().toISOString(), // For optimistic update
    } as JustPhotoType;
  } catch (error) {
    console.error("Error adding post:", error);
    throw error;
  }
};

export const usePosts = () => {
  return useQuery({
    queryKey: queryKeys.posts,
    queryFn: fetchPosts,
  });
};

export const useAddPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPost,
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts });
      const previousPosts = queryClient.getQueryData<JustPhotoType[]>(
        queryKeys.posts
      );

      queryClient.setQueryData<JustPhotoType[]>(queryKeys.posts, (old = []) => {
        const optimisticPost = {
          ...newPost,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        } as JustPhotoType;
        return [optimisticPost, ...old];
      });

      return { previousPosts };
    },
    onError: (err, newPost, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKeys.posts, context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });
};
