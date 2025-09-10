import { Injectable } from '@nestjs/common';
import { CatalogService } from '../catalog/catalog.service.js';
import { CartService } from '../cart/cart.service.js';

export type Lang = 'en' | 'ar';

@Injectable()
export class IntentService {
  constructor(private readonly catalog: CatalogService, private readonly cart: CartService) {}

  async handleText(text: string, lang: Lang = 'en') {
    const t = (text || '').trim();
    if (!t) return [this.msg(lang, 'empty')];

    // Simple intent routing
    if (this.isBrowse(t, lang)) {
      const cats = await this.catalog.listCategories();
      const top = cats.filter((c: any) => !c.parentId).slice(0, 6);
      const lines = top.map((c: any) => `• ${c.name}`);
      const replies = top.map((c: any) => ({ title: c.name, payload: `show ${c.slug}` }));
      return [this.msg(lang, 'browseHeader'), { type: 'text', text: lines.join('\n') }, { type: 'quick_replies', replies }];
    }

    // Cart add by sku
    const addSku = this.parseAddSku(t, lang);
    if (addSku) {
      const found = await this.catalog.listProducts({ q: addSku, page: 1, pageSize: 1 });
      const p = found.items[0];
      if (!p) return [this.msg(lang, 'notFound')];
      await this.cart.addItem({ sku: p.sku || undefined, productId: p.id, qty: 1 });
      const price = (p.price / 100).toFixed(2) + ' ' + (p.currency || 'USD');
      const replies = [
        { title: this.tr(lang, 'cart'), payload: 'cart' },
        { title: this.tr(lang, 'browse'), payload: 'browse' },
      ];
      return [{ type: 'text', text: `Added: ${p.name} (${price})` }, { type: 'quick_replies', replies }];
    }

    // Cart view
    if (this.isCart(t, lang)) {
      const c = await this.cart.getCart();
      if (!c.items?.length) return [{ type: 'text', text: this.tr(lang, 'cartEmpty') }];
      const lines = c.items.map((it: any) => `• ${it.nameSnapshot} x${it.qty} — ${(it.lineTotalMinor / 100).toFixed(2)} ${c.currency}`);
      const replies = [{ title: this.tr(lang, 'browse'), payload: 'browse' }];
      return [{ type: 'text', text: this.tr(lang, 'cartHeader') }, { type: 'text', text: lines.join('\n') }, { type: 'quick_replies', replies }];
    }

    // Product details by sku
    const detailsSku = this.parseDetailsSku(t, lang);
    if (detailsSku) {
      const res = await this.catalog.listProducts({ q: detailsSku, page: 1, pageSize: 1 });
      const p = res.items[0];
      if (!p) return [this.msg(lang, 'notFound')];
      const price = (p.price / 100).toFixed(2) + ' ' + (p.currency || 'USD');
      const desc = p.description ? `\n${p.description}` : '';
      const textMsg = { type: 'text', text: `${p.name}\n${price}${desc}` };
      const img = p.media?.[0]?.url ? [{ type: 'image', url: p.media[0].url }] : [];
      return [...img, textMsg, this.msg(lang, 'detailsFooter')];
    }

    // Category show/more flows
    const show = this.parseShowCategory(t, lang);
    if (show) {
      const page = show.page || 1;
      const res = await this.catalog.listProducts({ category: show.slug, page, pageSize: 5, sort: 'name', order: 'asc' });
      if (!res.items.length) {
        const cats = await this.catalog.listCategories();
        const top = cats.filter((c: any) => !c.parentId).slice(0, 6);
        const repliesNF = top.map((c: any) => ({ title: c.name, payload: `show ${c.slug}` }));
        repliesNF.unshift({ title: this.tr(lang, 'browse'), payload: 'browse' });
        return [this.msg(lang, 'notFound'), { type: 'quick_replies', replies: repliesNF }];
      }
      const lines = res.items.map((p: any) => `• ${p.name} (${(p.price / 100).toFixed(2)} ${p.currency}) [${p.sku || p.id}]`);
      const replies = [
        { title: this.tr(lang, 'more'), payload: `show ${show.slug} page ${page + 1}` },
        ...(res.items[0]?.sku ? [{ title: this.tr(lang, 'details') + ' ' + res.items[0].sku, payload: `details ${res.items[0].sku}` }] : []),
        { title: this.tr(lang, 'browse'), payload: 'browse' },
      ];
      return [this.msg(lang, 'categoryHeader', show.slug), { type: 'text', text: lines.join('\n') }, { type: 'quick_replies', replies }];
    }

    const more = this.parseMore(t, lang);
    if (more) {
      const page = more.page || 2;
      const res = await this.catalog.listProducts({ category: more.slug, page, pageSize: 5, sort: 'name', order: 'asc' });
      if (!res.items.length) {
        const cats = await this.catalog.listCategories();
        const top = cats.filter((c: any) => !c.parentId).slice(0, 6);
        const repliesNF = top.map((c: any) => ({ title: c.name, payload: `show ${c.slug}` }));
        repliesNF.unshift({ title: this.tr(lang, 'browse'), payload: 'browse' });
        return [this.msg(lang, 'notFound'), { type: 'quick_replies', replies: repliesNF }];
      }
      const lines = res.items.map((p: any) => `• ${p.name} (${(p.price / 100).toFixed(2)} ${p.currency}) [${p.sku || p.id}]`);
      const replies = [
        { title: this.tr(lang, 'more'), payload: `show ${more.slug} page ${page + 1}` },
        ...(res.items[0]?.sku ? [{ title: this.tr(lang, 'details') + ' ' + res.items[0].sku, payload: `details ${res.items[0].sku}` }] : []),
        { title: this.tr(lang, 'browse'), payload: 'browse' },
      ];
      return [this.msg(lang, 'categoryHeader', more.slug), { type: 'text', text: lines.join('\n') }, { type: 'quick_replies', replies }];
    }

    // Fallback: try search
    const res = await this.catalog.listProducts({ q: t, page: 1, pageSize: 5 });
    if (res.items.length) {
      const lines = res.items.map((p: any) => `• ${p.name} (${(p.price / 100).toFixed(2)} ${p.currency})`);
      return [this.msg(lang, 'searchHeader', t), { type: 'text', text: lines.join('\n') }];
    }
    const cats = await this.catalog.listCategories();
    const top = cats.filter((c: any) => !c.parentId).slice(0, 6);
    const repliesNF = top.map((c: any) => ({ title: c.name, payload: `show ${c.slug}` }));
    repliesNF.unshift({ title: this.tr(lang, 'browse'), payload: 'browse' });
    return [this.msg(lang, 'help'), { type: 'quick_replies', replies: repliesNF }];
  }

  private isBrowse(t: string, lang: Lang) {
    return /\b(browse|categories)\b/i.test(t) || (lang === 'ar' && /(���|��竟�)/.test(t));
  }
  private isCart(t: string, lang: Lang) {
    return /\b(cart)\b/i.test(t) || (lang === 'ar' && /(����)/.test(t));
  }
  private parseAddSku(t: string, lang: Lang) {
    const m = t.match(/^add\s+(\S+)/i) || (lang === 'ar' ? t.match(/^(���)\s+(\S+)/) : null);
    return m ? (m[1] || m[2]) : '';
  }
  private parseDetailsSku(t: string, lang: Lang) {
    const m = t.match(/^(details|detail)\s+(\S+)/i) || (lang === 'ar' ? t.match(/^(�埭��)\s+(\S+)/) : null);
    return m ? m[2] : '';
  }
  private parseShowCategory(t: string, lang: Lang): { slug: string; page?: number } | null {
    const m = t.match(/^show\s+(\S+)(?:\s+page\s+(\d+))?/i) || (lang === 'ar' ? t.match(/^��\s+(\S+)(?:\s+�奡\s+(\d+))?/) : null);
    if (!m) return null;
    const slug = (m[1] || '').toLowerCase();
    const page = m[2] ? Math.max(1, parseInt(m[2], 10)) : undefined;
    return { slug, page };
  }
  private parseMore(t: string, lang: Lang): { slug: string; page?: number } | null {
    const m = t.match(/^more(?:\s+(\S+))?(?:\s+page\s+(\d+))?/i) || (lang === 'ar' ? t.match(/^����(?:\s+(\S+))?(?:\s+�奡\s+(\d+))?/) : null);
    if (!m) return null;
    const slug = (m[1] || '').toLowerCase();
    const page = m[2] ? Math.max(1, parseInt(m[2], 10)) : undefined;
    if (!slug) return null; // require category for stateless preview
    return { slug, page };
  }

  private msg(lang: Lang, key: string, arg?: string) {
    const en = {
      empty: { type: 'text', text: 'Say "browse" to see categories or "details <sku>".' },
      browseHeader: { type: 'text', text: 'Top categories:' },
      notFound: { type: 'text', text: 'No matching items found.' },
      detailsFooter: { type: 'text', text: 'Reply "add <sku>" to add to cart, or "browse".' },
      categoryHeader: { type: 'text', text: `Popular in category: ${arg || ''}` },
      morePrompt: { type: 'text', text: 'Reply "more <category>" for more items, or "details <sku>".' },
      searchHeader: { type: 'text', text: `Results for "${arg || ''}":` },
      help: { type: 'text', text: 'Try: "browse", "show <category>", or "details <sku>".' },
    } as const;
    const ar = {
      empty: { type: 'text', text: '�袠 "���" ��� ��竟� �� "�埭�� <sku>".' },
      browseHeader: { type: 'text', text: '��竟�:' },
      notFound: { type: 'text', text: '� ���� 뢟��.' },
      detailsFooter: { type: 'text', text: '�袠 "add <sku>" ���� ���? �� "���".' },
      categoryHeader: { type: 'text', text: `��裩 ����� �� ����: ${arg || ''}` },
      morePrompt: { type: 'text', text: '�袠 "more <category>" ����? �� "�埭�� <sku>".' },
      searchHeader: { type: 'text', text: `뢟�� �頥� �� "${arg || ''}":` },
      help: { type: 'text', text: '����: "���"? "�� <category>"? �� "�埭�� <sku>".' },
    } as const;
    const dict = lang === 'ar' ? ar : en;
    return dict[key as keyof typeof dict] || dict.help;
  }

  private tr(lang: Lang, key: 'more' | 'details' | 'browse' | 'cart' | 'cartEmpty' | 'cartHeader') {
    const en = { more: 'more', details: 'details', browse: 'browse', cart: 'cart', cartEmpty: 'Your cart is empty.', cartHeader: 'Your cart:' };
    const ar = { more: '����', details: '�埭��', browse: '���', cart: '����', cartEmpty: '������� ���.', cartHeader: '�������:' };
    return (lang === 'ar' ? ar : en)[key];
  }
}

