import { User } from "./User";

export interface Comment {
  _id?: string;
  userId: User;
  name: string;
  movieId: string;
  content: string;
  avatar?: string | null;
  createdAt: string;
  likes?: number;
  replyCount?: number;
  dislikes?: number;
  repCmtId?: string | null;
  level?: number | undefined;
  parentAvatar?: string | null;
  parentContent?: string;
  parentMedia?: string | null;
  likedBy: User[];
  dislikedBy: User[];
  replies?: Comment[];
}
