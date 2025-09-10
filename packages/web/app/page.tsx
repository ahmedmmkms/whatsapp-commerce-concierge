import { HomeHero } from '../components/home-hero'

export default function HomePage() {
  return (
    <div>
      <HomeHero apiBase={process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'} />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-body">
            <h3 className="card-title">Fast</h3>
            <p className="card-subtitle">P95 ≤ 200ms for core routes</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="card-title">Bilingual</h3>
            <p className="card-subtitle">Arabic-first with RTL support</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="card-title">Seamless Handoff</h3>
            <p className="card-subtitle">WhatsApp deeplinks from product pages</p>
          </div>
        </div>
      </section>
    </div>
  );
}
