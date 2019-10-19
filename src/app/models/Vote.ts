// Votes exist for single post across
// one or more group(s).
export interface Vote {
  post?: string;
  // 1 for up or 0 for down
  voteDirection?: number;
}
