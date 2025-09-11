import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS) : 10,
  duration: __ENV.DURATION || '1m',
};

const API = __ENV.API_BASE || 'http://localhost:3001';

export default function () {
  const r1 = http.get(`${API}/products?page=1&pageSize=10`);
  check(r1, { 'products 200': (r) => r.status === 200 });

  const cart = http.post(`${API}/cart`);
  check(cart, { 'cart 200': (r) => r.status === 201 || r.status === 200 });

  const idem = Math.random().toString(36).slice(2);
  const co = http.post(`${API}/checkout/init`, JSON.stringify({ method: 'cod' }), {
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idem },
  });
  check(co, { 'checkout 200': (r) => r.status === 200 });

  sleep(1);
}

