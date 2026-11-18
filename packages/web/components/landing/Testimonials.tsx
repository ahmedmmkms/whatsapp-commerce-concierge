import { I18nText } from '../i18n/text'

const quotes = [
  { q: 'Great prices and super fast delivery. Will buy again!', n: 'Demo shopper' },
  { q: 'Customer support was helpful and quick to respond.', n: 'Demo shopper' },
  { q: 'Genuine products and smooth checkout experience.', n: 'Demo shopper' },
]

export function Testimonials() {
  return (
    <section aria-labelledby="testimonials-title" className="py-8">
      <div className="container-page">
        <h2 id="testimonials-title" className="prose-title mb-4"><I18nText k="sections.testimonials.title" fallback="Sample reviews (demo data)" /></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quotes.map((x, i) => (
            <figure key={i} className="card p-4">
              <blockquote className="text-sm text-muted-foreground">“{x.q}”</blockquote>
              <figcaption className="mt-3 text-xs">— {x.n}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

