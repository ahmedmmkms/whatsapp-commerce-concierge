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

  isEnabled() {
    return this.enabled && !!this.token && !!this.phoneId;
  }

  async sendBatch(to: string, messages: OutMessage[]) {
    if (!this.isEnabled()) return { ok: false, reason: 'disabled' } as const;
    for (const m of messages) {
      // Map preview messages to WhatsApp Cloud API payloads
      if (m.type === 'text') {
        await this.sendRaw({ messaging_product: 'whatsapp', to, type: 'text', text: { body: m.text } });
      } else if (m.type === 'image') {
        await this.sendRaw({ messaging_product: 'whatsapp', to, type: 'image', image: { link: m.url } });
      } else if (m.type === 'quick_replies') {
        // For now, send a plain text listing as buttons require templates or interactive objects with limitations
        const body = 'Options:\n' + m.replies.map((r) => `• ${r.title}`).join('\n');
        await this.sendRaw({ messaging_product: 'whatsapp', to, type: 'text', text: { body } });
      }
    }
    return { ok: true } as const;
  }

  private async sendRaw(payload: any) {
    const url = `https://graph.facebook.com/v20.0/${this.phoneId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      // eslint-disable-next-line no-console
      console.warn('[wa:send] non-200', res.status, txt);
    }
  }
}

