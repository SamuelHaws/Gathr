import { Vote } from './Vote';

export interface User {
  username?: string;
  email?: string;
  usersettings?: {};
  invites?: string[];
  // [postId, 1 for up or 0 for down]
  // Votes exist for single post across
  // one or more group(s).
  votes?: Vote[];
}
