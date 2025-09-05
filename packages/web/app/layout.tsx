export const metadata = {
  title: 'WhatsApp Concierge',
  description: 'Conversational commerce MVP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}

