"use client"
import { useState } from 'react'
import { I18nText } from '../i18n/text'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [ok, setOk] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valid = /.+@.+\..+/.test(email)
    if (valid) setOk(true)
  }

  return (
    <section aria-labelledby="news-title" className="py-8">
      <div className="container-page">
        <div className="card p-6">
          <h2 id="news-title" className="prose-title mb-2"><I18nText k="newsletter.title" fallback="Stay in the loop" /></h2>
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required aria-label="email" placeholder="email@example.com"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" />
            <button className="btn btn-primary h-10" aria-label="Subscribe">
              <I18nText k="newsletter.cta" fallback="Subscribe" />
            </button>
          </form>
          {ok && <div className="mt-2 text-sm text-muted-foreground"><I18nText k="newsletter.success" fallback="Thanks! You are subscribed." /></div>}
        </div>
      </div>
    </section>
  )
}

