export type FeedTab = "for-you" | "following";
export type FeedView = "all" | "clips" | "bookmarks" | "saved";

export const VIEW_LABELS: Record<FeedView, string> = {
  all: "For You",
  clips: "Clips",
  bookmarks: "Bookmarks",
  saved: "Saved",
};
