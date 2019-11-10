import { Comment } from './Comment';

export interface Post {
  id?: string;
  owner?: string;
  createdAt?: Date;
  link?: string;
  title?: string;
  body?: string;
  upvotes?: number;
  downvotes?: number;
  commentCount?: number;
  comments?: Comment[];
  isTextPost?: boolean;
  isDisabled?: boolean;
  
  // For this.posts in Group
  upvoteToggled?: boolean;
  downvoteToggled?: boolean;
}
