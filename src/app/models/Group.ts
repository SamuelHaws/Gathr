import { Chat } from './Chat';
import { Post } from './Post';

export interface Group {
  id?: string;
  groupname?: string;
  description?: string;
  public?: boolean;
  owner?: string;
  // chats?: Chat[];
  // posts?: string[];
}
