import '../styles/globals.css'
import { I18nProvider } from '../components/i18n/provider'
import { Header } from '../components/header'

export const metadata = {
  title: 'WhatsApp Concierge',
  description: 'Conversational commerce MVP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir={process.env.NEXT_PUBLIC_RTL === '1' ? 'rtl' : 'ltr'}>
      <body className="bg-background text-foreground">
        <I18nProvider>
          <Header />
          <main className="container-page py-6">
            {children}
          </main>
          <footer className="mt-12 border-t border-border">
            <div className="container-page py-6 text-xs text-muted-foreground">
              © {new Date().getFullYear()} AMM. All rights reserved.
            </div>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
