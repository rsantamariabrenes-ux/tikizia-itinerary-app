type WPPost = {
  title: { rendered: string };
  excerpt: { rendered: string };
  link: string;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export async function fetchBlogPosts(): Promise<string> {
  try {
    const res = await fetch(
      'https://exploretikizia.com/wp-json/wp/v2/posts?per_page=10&_fields=title,excerpt,link',
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return '';
    const posts: WPPost[] = await res.json();
    return posts
      .map((p) => `- ${stripHtml(p.title.rendered)}: ${p.link}`)
      .join('\n');
  } catch {
    return '';
  }
}
