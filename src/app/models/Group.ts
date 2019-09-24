import { Chat } from './Chat';
import { Post } from './Post';

export interface Group {
  groupname?: string;
  description?: string;
  public?: boolean;
  owner?: string;
  // chats?: Chat[];
  // posts?: string[];
}
