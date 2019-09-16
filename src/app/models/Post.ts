export interface Post {
  id?: string;
  createdAt?: Date;
  link?: string;
  title?: string;
  comments?: Comment[];
}
