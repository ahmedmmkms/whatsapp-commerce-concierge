export default function HomePage() {
  return (
    <div>
      {/* @ts-expect-error Server Component rendering client i18n section */}
      <HomeHeroClient apiBase={process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'} />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-body">
            <h3 className="card-title">Fast</h3>
            <p className="card-subtitle">P95 < 200ms for core routes</p>
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

function HomeHeroClient({ apiBase }: { apiBase: string }) {
  // @ts-expect-error client-only hook loaded dynamically
  return <(async () => {
    const { useI18n } = await import('../components/i18n/provider')
    const Comp = () => {
      const { t } = useI18n()
      return (
        <section className="rounded-lg border border-border bg-card p-8 mb-8">
          <h1 className="prose-title">WhatsApp Commerce Concierge</h1>
          <p className="prose-subtle mt-2">{t('hero.subtitle')}</p>
          <div className="mt-4 text-sm text-muted-foreground">API base: {apiBase}</div>
          <div className="mt-6"><a className="btn btn-primary" href="/products">{t('cta.browse')}</a></div>
        </section>
      )
    }
    return <Comp />
  }) />
}
