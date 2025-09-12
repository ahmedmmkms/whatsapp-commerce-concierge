import Link from 'next/link'
import { I18nText } from '../i18n/text'

const categories = [
  { slug: 'smartphones', title: 'Phones', emoji: '📱' },
  { slug: 'laptops', title: 'Laptops', emoji: '💻' },
  { slug: 'audio', title: 'Audio', emoji: '🎧' },
  { slug: 'gaming', title: 'Gaming', emoji: '🎮' },
  { slug: 'accessories', title: 'Accessories', emoji: '🔌' },
]

export function CategoryGrid() {
  return (
    <section aria-labelledby="cat-title" className="py-8">
      <div className="container-page">
        <h2 id="cat-title" className="prose-title mb-4">
          <I18nText k="sections.categories.title" fallback="Top Categories" />
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((c) => (
            <Link key={c.slug} href={`/products?category=${encodeURIComponent(c.slug)}`} className="card p-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Shop ${c.title}`}>
              <div className="text-3xl mb-2" aria-hidden>{c.emoji}</div>
              <div className="font-medium">{c.title}</div>
              <div className="text-xs text-muted-foreground group-hover:underline">Shop now →</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

