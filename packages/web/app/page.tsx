export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>WhatsApp Commerce Concierge</h1>
      <p>Author: AMM</p>
      <p>
        API base: {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}
      </p>
      <ul>
        <li>Order status: /order/[id] (TBD)</li>
        <li>Returns: /returns (TBD)</li>
      </ul>
    </main>
  );
}

