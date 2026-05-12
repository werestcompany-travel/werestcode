/**
 * Instagram Basic Display API integration.
 * Set INSTAGRAM_ACCESS_TOKEN in your .env to enable real Instagram posts.
 * Get your token at: https://developers.facebook.com/docs/instagram-basic-display-api
 */

export interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  like_count?: number;
}

export async function getInstagramPosts(limit = 6): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return []; // Graceful fallback — component will use static data

  try {
    const fields = 'id,media_url,permalink,caption,timestamp';
    const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${token}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json() as { data: InstagramPost[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}
