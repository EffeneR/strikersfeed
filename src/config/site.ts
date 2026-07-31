/** Central site-wide brand + metadata constants for StrikersFeed. */

export const siteConfig = {
  name: "StrikersFeed",
  domain: "strikersfeed.club",
  url: "https://strikersfeed.club",
  title: "StrikersFeed — The Social Home of Strikers Club",
  description:
    "Follow players and teams, share clips, discuss matches and compete in community tournaments on StrikersFeed.",
  tagline: "The social home of Strikers Club.",
  campaignLine: "Watch. Post. Discuss. Compete.",
  positioning: "SOCIAL. COMPETE. BELONG.",
  disclaimer:
    "StrikersFeed is an independent community platform and is not affiliated with or endorsed by the creators of Strikers Club.",
  og: {
    imageAlt: "StrikersFeed — the social home of Strikers Club",
  },
} as const;

export type SiteConfig = typeof siteConfig;
