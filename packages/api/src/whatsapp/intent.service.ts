import { Injectable } from '@nestjs/common';
import { CatalogService } from '../catalog/catalog.service.js';

export type Lang = 'en' | 'ar';

@Injectable()
export class IntentService {
  constructor(private readonly catalog: CatalogService) {}

  async handleText(text: string, lang: Lang = 'en') {
    const t = (text || '').trim();
    if (!t) return [this.msg(lang, 'empty')];

    // Simple intent routing
    if (this.isBrowse(t, lang)) {
      const cats = await this.catalog.listCategories();
      const top = cats.filter((c: any) => !c.parentId).slice(0, 6);
      const lines = top.map((c: any) => `• ${c.name}`);
      return [this.msg(lang, 'browseHeader'), { type: 'text', text: lines.join('\n') }];
    }

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

    const showCat = this.parseShowCategory(t, lang);
    if (showCat) {
      const res = await this.catalog.listProducts({ category: showCat, page: 1, pageSize: 5, sort: 'name', order: 'asc' });
      if (!res.items.length) return [this.msg(lang, 'notFound')];
      const lines = res.items.map((p: any) => `• ${p.name} (${(p.price / 100).toFixed(2)} ${p.currency})`);
      return [this.msg(lang, 'categoryHeader', showCat), { type: 'text', text: lines.join('\n') }, this.msg(lang, 'morePrompt')];
    }

    // Fallback: try search
    const res = await this.catalog.listProducts({ q: t, page: 1, pageSize: 5 });
    if (res.items.length) {
      const lines = res.items.map((p: any) => `• ${p.name} (${(p.price / 100).toFixed(2)} ${p.currency})`);
      return [this.msg(lang, 'searchHeader', t), { type: 'text', text: lines.join('\n') }];
    }
    return [this.msg(lang, 'help')];
  }

  private isBrowse(t: string, lang: Lang) {
    return /\b(browse|categories)\b/i.test(t) || (lang === 'ar' && /(تصفح|الأقسام)/.test(t));
  }
  private parseDetailsSku(t: string, lang: Lang) {
    const m = t.match(/^(details|detail)\s+(\S+)/i) || (lang === 'ar' ? t.match(/^(تفاصيل)\s+(\S+)/) : null);
    return m ? m[2] : '';
  }
  private parseShowCategory(t: string, lang: Lang) {
    const m = t.match(/^show\s+(\S+)/i) || (lang === 'ar' ? t.match(/^عرض\s+(\S+)/) : null);
    return m ? m[1] : '';
  }

  private msg(lang: Lang, key: string, arg?: string) {
    const en = {
      empty: { type: 'text', text: 'Say "browse" to see categories or "details <sku>".' },
      browseHeader: { type: 'text', text: 'Top categories:' },
      notFound: { type: 'text', text: 'No matching items found.' },
      detailsFooter: { type: 'text', text: 'Reply "add <sku>" to add to cart, or "browse".' },
      categoryHeader: { type: 'text', text: `Popular in category: ${arg || ''}` },
      morePrompt: { type: 'text', text: 'Reply "more" for more items, or "details <sku>".' },
      searchHeader: { type: 'text', text: `Results for "${arg || ''}":` },
      help: { type: 'text', text: 'Try: "browse", "show <category>", or "details <sku>".' },
    } as const;
    const ar = {
      empty: { type: 'text', text: 'اكتب "تصفح" لعرض الأقسام أو "تفاصيل <sku>".' },
      browseHeader: { type: 'text', text: 'الأقسام:' },
      notFound: { type: 'text', text: 'لا توجد نتائج.' },
      detailsFooter: { type: 'text', text: 'اكتب "add <sku>" لإضافة للسلة، أو "تصفح".' },
      categoryHeader: { type: 'text', text: `الأكثر شيوعًا في القسم: ${arg || ''}` },
      morePrompt: { type: 'text', text: 'اكتب "more" للمزيد، أو "تفاصيل <sku>".' },
      searchHeader: { type: 'text', text: `نتائج البحث عن "${arg || ''}":` },
      help: { type: 'text', text: 'جرّب: "تصفح"، "عرض <category>"، أو "تفاصيل <sku>".' },
    } as const;
    const dict = lang === 'ar' ? ar : en;
    return dict[key as keyof typeof dict] || dict.help;
  }
}

