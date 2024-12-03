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
  
  export interface Comment {
    id: number;
    content: string;
    createdAt: string;
    user: SerializedUser;
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
    likesCount: number;
    commentsCount: number;
    likedByCurrentUser: boolean;
    comments: Comment[];
  }
  