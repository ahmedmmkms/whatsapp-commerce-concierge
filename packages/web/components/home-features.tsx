"use client"
import { useI18n } from './i18n/provider'

export function HomeFeatures() {
  const { t } = useI18n()
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card">
        <div className="card-body">
          <h3 className="card-title">{t('home.features.fast.title')}</h3>
          <p className="card-subtitle">{t('home.features.fast.subtitle')}</p>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <h3 className="card-title">{t('home.features.bilingual.title')}</h3>
          <p className="card-subtitle">{t('home.features.bilingual.subtitle')}</p>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <h3 className="card-title">{t('home.features.handoff.title')}</h3>
          <p className="card-subtitle">{t('home.features.handoff.subtitle')}</p>
        </div>
      </div>
    </section>
  )
}

