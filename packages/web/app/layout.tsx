export const metadata = {
  title: 'WhatsApp Concierge',
  description: 'Conversational commerce MVP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir={process.env.NEXT_PUBLIC_RTL === '1' ? 'rtl' : 'ltr'}>
      <body>
        <div style={{ padding: 12, background: '#f3f4f6', fontSize: 13 }}>
          <a href="/">Home</a> | <a href="/products">Products</a> | RTL: {process.env.NEXT_PUBLIC_RTL === '1' ? 'on' : 'off'}
        </div>
        {children}
      </body>
    </html>
  );
}
