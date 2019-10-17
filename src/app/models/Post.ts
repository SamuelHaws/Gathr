export interface Post {
  id?: string;
  owner?: string;
  createdAt?: Date;
  link?: string;
  title?: string;
  body?: string;
  upvotes?: number;
  downvotes?: number;
  // comments?: Comment[];
}
