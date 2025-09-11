import { Injectable } from '@nestjs/common';

type OutMessage =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string }
  | { type: 'quick_replies'; replies: Array<{ title: string; payload: string }> };

@Injectable()
export class WhatsappSenderService {
  private enabled = process.env.WHATSAPP_SEND_ENABLED === '1';
  private token = process.env.WHATSAPP_TOKEN;
  private phoneId = process.env.WHATSAPP_PHONE_ID;
  private timeoutMs = Number(process.env.WA_SEND_TIMEOUT_MS || 8000);
  private maxRetries = Number(process.env.WA_SEND_MAX_RETRIES || 2);
  private breakerThreshold = Number(process.env.WA_SEND_BREAKER_THRESHOLD || 5);
  private breakerCooldownMs = Number(process.env.WA_SEND_BREAKER_COOLDOWN_MS || 30000);

  private consecutiveFailures = 0;
  private breakerOpenUntil = 0;

  isEnabled() {
    return this.enabled && !!this.token && !!this.phoneId;
  }

  async sendBatch(to: string, messages: OutMessage[]) {
    if (!this.isEnabled()) return { ok: false, reason: 'disabled' } as const;
    const now = Date.now();
    if (this.breakerOpenUntil > now) {
      // Circuit open; skip sending to avoid cascading failures
      return { ok: false, reason: 'circuit_open' } as const;
    }
    for (const m of messages) {
      // Map preview messages to WhatsApp Cloud API payloads
      if (m.type === 'text') {
        await this.sendWithRetry({ messaging_product: 'whatsapp', to, type: 'text', text: { body: m.text } });
      } else if (m.type === 'image') {
        await this.sendWithRetry({ messaging_product: 'whatsapp', to, type: 'image', image: { link: m.url } });
      } else if (m.type === 'quick_replies') {
        // For now, send a plain text listing as buttons require templates or interactive objects with limitations
        const body = 'Options:\n' + m.replies.map((r) => `• ${r.title}`).join('\n');
        await this.sendWithRetry({ messaging_product: 'whatsapp', to, type: 'text', text: { body } });
      }
    }
    return { ok: true } as const;
  }

  private async sendWithRetry(payload: any) {
    const url = `https://graph.facebook.com/v20.0/${this.phoneId}/messages`;
    const attempt = async () => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: ctrl.signal as any,
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`wa_send ${res.status} ${txt?.slice(0, 200)}`);
        }
      } finally {
        clearTimeout(timer);
      }
    };

    let lastErr: any;
    for (let i = 0; i <= this.maxRetries; i++) {
      try {
        await attempt();
        // success -> reset failure counter
        this.consecutiveFailures = 0;
        return;
      } catch (err: any) {
        lastErr = err;
        this.consecutiveFailures++;
        // eslint-disable-next-line no-console
        console.warn('[wa:send] attempt failed', i + 1, err?.message || err);
        if (this.consecutiveFailures >= this.breakerThreshold) {
          this.breakerOpenUntil = Date.now() + this.breakerCooldownMs;
          // eslint-disable-next-line no-console
          console.warn('[wa:send] circuit opened for', this.breakerCooldownMs, 'ms');
          break;
        }
        const backoffMs = Math.min(1000 * 2 ** i, 5000);
        await new Promise((r) => setTimeout(r, backoffMs));
      }
    }
    // eslint-disable-next-line no-console
    console.warn('[wa:send] giving up after retries', lastErr?.message || lastErr);
  }
}
