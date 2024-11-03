import { JustPhotoType } from "@/types/JustPhotoTypes";
import { create } from "zustand";
import posts from "@/app/config/posts";

type PostStore = {
  posts: JustPhotoType[];
  isLoading: boolean;
  addPost: (post: JustPhotoType) => void;
  setLoading: (loading: boolean) => void;
};

export const usePostStore = create<PostStore>((set) => ({
  posts: posts,
  isLoading: false,
  addPost: (newPost) =>
    set((state) => ({
      posts: [newPost, ...state.posts],
    })),
  setLoading: (loading) => set({ isLoading: loading }),
}));
