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
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "@/app/config/firebase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

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
    const response = await fetch(localPath);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error("Error converting file to blob:", error);
    throw error;
  }
};

const uploadImage = async (
  imagePath: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const blob = await convertLocalFileToBlob(imagePath);
    const fileExtension = imagePath.split(".").pop()?.toLowerCase() || "jpg";
    const storageRef = ref(storage, `images/${Date.now()}.${fileExtension}`);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error("Error during upload:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

const addPost = async (
  newPost: Omit<JustPhotoType, "id" | "createdAt">,
  onProgress?: (progress: number) => void
): Promise<JustPhotoType> => {
  try {
    let imageUrl = newPost.image;

    // Check if image is a local file path
    if (newPost.image && newPost.image.startsWith("file://")) {
      imageUrl = await uploadImage(newPost.image, onProgress);
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
      createdAt: new Date().toISOString(),
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (newPost: Omit<JustPhotoType, "id" | "createdAt">) => {
      try {
        if (newPost.image!.startsWith("file://")) {
          setUploadingImage(newPost.image!);
        }
        
        const result = await addPost(newPost, (progress) => setUploadProgress(progress));
        
        setUploadingImage(null);
        return result;
      } catch (error) {
        setUploadingImage(null);
        throw error;
      }
    },
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
      setUploadingImage(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      setUploadProgress(0);
      setUploadingImage(null);
    },
  });

  return {
    ...mutation,
    uploadProgress,
    uploadingImage,
  };
};
