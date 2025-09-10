# Frontend Coding Standards (Web)

- JSX entities: avoid raw `<`/`>`/`'`/`"` in text.
  - Use `≤` or encode via `{"<"}` / `{">"}` when needed.
- i18n/RTL: all user-visible strings via i18n; `dir` follows locale.
- Numbers/currency: format with `Intl.NumberFormat` (already via `components/price.tsx`).
- Components: prefer tokenized Tailwind classes; reuse `btn`, `card`, `prose-*` utilities.
- Images: use `next/image` where possible; keep `unoptimized` until domains are configured.
- Accessibility: preserve focus rings, provide `aria-label` where text isn’t explicit.
- Styling: keep spacing consistent with Tailwind scale and CSS variables in `styles/theme.css`.
- Icons: use inline SVG components in `components/icons.tsx` or a pinned icon lib.

Linting
- Run `pnpm -C packages/web run lint` before PRs.
- Rule of note: `react/no-unescaped-entities` ensures JSX text doesn’t contain unescaped characters.
