export interface Comment {
  id?: string;
  author?: string;
  createdAt?: Date;
  level?: number;
  text?: string;
  comments?: Comment[];
  parentId?: string;
  isDisabled?: boolean;
}
