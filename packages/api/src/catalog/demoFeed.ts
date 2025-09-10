export type DemoCategory = { slug: string; name: string; parentSlug?: string };
export type DemoMedia = { url: string; kind?: 'image' | 'video'; sortOrder?: number };
export type DemoProduct = {
  sku: string;
  name: string;
  description?: string;
  price: number; // minor units
  currency: string;
  stock?: number;
  brand?: string;
  attributes?: Record<string, unknown>;
  categorySlug?: string;
  media?: DemoMedia[];
};

export type DemoFeed = { categories: DemoCategory[]; products: DemoProduct[] };

export const demoFeed: DemoFeed = {
  categories: [
    { slug: 'apparel', name: 'Apparel' },
    { slug: 'men', name: 'Men', parentSlug: 'apparel' },
    { slug: 'women', name: 'Women', parentSlug: 'apparel' },
    { slug: 'footwear', name: 'Footwear' },
  ],
  products: [
    {
      sku: 'SKU-001',
      name: 'Basic Tee',
      description: 'Soft cotton tee',
      price: 2500,
      currency: 'USD',
      stock: 42,
      brand: 'Acme',
      categorySlug: 'men',
      media: [
        { url: 'https://picsum.photos/id/11/600/400', kind: 'image', sortOrder: 0 },
      ],
    },
    {
      sku: 'SKU-002',
      name: 'Running Shoe',
      description: 'Lightweight trainers',
      price: 7900,
      currency: 'USD',
      stock: 18,
      brand: 'Acme',
      categorySlug: 'footwear',
      media: [
        { url: 'https://picsum.photos/id/21/600/400', kind: 'image', sortOrder: 0 },
      ],
    },
    {
      sku: 'SKU-003',
      name: 'Cap',
      description: 'Adjustable baseball cap',
      price: 1500,
      currency: 'USD',
      stock: 100,
      brand: 'Acme',
      categorySlug: 'apparel',
      media: [
        { url: 'https://picsum.photos/id/31/600/400', kind: 'image', sortOrder: 0 },
      ],
    },
  ],
};

