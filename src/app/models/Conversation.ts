import { Message } from "./Message";

export interface Conversation {
  id?: string;
  participants?: string[];
  messages?: Message[];
}
