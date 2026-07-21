import { MetadataRoute } from 'next';

// Tells Next.js to skip static build caching for the sitemap generator
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  try {
    const res = await fetch(`${apiUrl}/api/v1/components`, { cache: 'no-store' });
    if (!res.ok) return staticRoutes;
    
    const json = await res.json();
    const components = json.data || [];

    const dynamicRoutes: MetadataRoute.Sitemap = components.map((item: any) => ({
      url: `${baseUrl}/components/${item._id}`,
      lastModified: item.lastRegeneratedAt ? new Date(item.lastRegeneratedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error('Failed to generate dynamic sitemap routes:', error);
    return staticRoutes;
  }
}