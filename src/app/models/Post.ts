export interface Post {
  id?: string;
  owner?: string;
  createdAt?: Date;
  link?: string;
  title?: string;
  body?: string;
  upvotes?: number;
  downvotes?: number;
  // For this.posts in Group
  upvoteToggled?: boolean;
  downvoteToggled?: boolean;
  // comments?: Comment[];
}
