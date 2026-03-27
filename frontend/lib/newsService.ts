/**
 * News Service - Fetches news from newsdata.io API
 */

export interface NewsArticle {
  article_id: string;
  title: string;
  link: string;
  keywords: string[] | null;
  creator: string[] | null;
  video_url: string | null;
  description: string;
  content: string;
  pubDate: string;
  pubDateTZ: string;
  image_url: string | null;
  source_id: string;
  source_name: string;
  source_url: string;
  source_icon: string | null;
  language: string;
  country: string[];
  category: string[];
  ai_tag: string | null;
  sentiment: string | null;
  sentiment_stats: string | null;
  ai_region: string | null;
  ai_org: string | null;
  duplicate: boolean;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  results: NewsArticle[];
  nextPage: string | null;
}

const NEWS_API_KEY = "pub_9a2a0a985f80452fab68846aeac9d0ed";
const BASE_URL = "https://newsdata.io/api/1";

/**
 * Fetch market news from newsdata.io
 */
export async function fetchMarketNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/market?apikey=${NEWS_API_KEY}&language=en&country=in`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: NewsResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching market news:", error);
    return [];
  }
}

/**
 * Fetch latest news with custom query
 */
export async function fetchNewsByQuery(query: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/news?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(query)}&language=en&country=in`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: NewsResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching news by query:", error);
    return [];
  }
}

/**
 * Format date for display
 */
export function formatNewsDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
