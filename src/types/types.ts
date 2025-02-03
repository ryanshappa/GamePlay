export interface SerializedUser {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface Author {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface NestedComment {
  id: number;
  content: string;
  createdAt: string;
  user: SerializedUser;

  // Nested replies
  parentId?: number | null;
  children?: NestedComment[];

  // For comment likes
  likeCount?: number;             
  likedByCurrentUser?: boolean;   
}

export interface PostWithAuthor {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  fileUrl: string | null;
  status: string | null;
  authorId: string;
  author: Author;

  // Post-level likes & comments
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser: boolean;
  savedByCurrentUser?: boolean;

  comments?: NestedComment[];
}
