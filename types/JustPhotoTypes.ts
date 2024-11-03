export type User = {
  id: string;
  name: string;
  username: string;
  image?: string;
};

export type JustPhotoType = {
  id: string;
  user: User;
  content: string;
  createdAt: string;
  numberOfComments?: number;
  numberOfRetweets?: number;
  numberOfLikes?: number;
  impressions?: number;
  image?: string;
};

