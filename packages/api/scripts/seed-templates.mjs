#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const templates = [
  { key: 'order_status', locale: 'en', channel: 'wa', body: 'Your order {{orderId}} is {{status}}. Total: {{total}} {{currency}}', variables: { vars: ['orderId','status','total','currency'] }, isActive: true, updatedBy: 'seed' },
  { key: 'order_status', locale: 'ar', channel: 'wa', body: 'طلبك {{orderId}} حالته {{status}}. الإجمالي: {{total}} {{currency}}', variables: { vars: ['orderId','status','total','currency'] }, isActive: true, updatedBy: 'seed' },
  { key: 'start_return', locale: 'en', channel: 'wa', body: 'We started your return for order {{orderId}}. RMA: {{rma}}', variables: { vars: ['orderId','rma'] }, isActive: true, updatedBy: 'seed' },
  { key: 'start_return', locale: 'ar', channel: 'wa', body: 'بدأنا إرجاع طلبك {{orderId}}. رقم الطلب المرتجع: {{rma}}', variables: { vars: ['orderId','rma'] }, isActive: true, updatedBy: 'seed' },
  { key: 'rma_instructions', locale: 'en', channel: 'wa', body: 'Please use RMA {{rma}} to ship items back within {{days}} days.', variables: { vars: ['rma','days'] }, isActive: true, updatedBy: 'seed' },
  { key: 'rma_instructions', locale: 'ar', channel: 'wa', body: 'يرجى استخدام رقم الإرجاع {{rma}} لإعادة الشحنة خلال {{days}} يومًا.', variables: { vars: ['rma','days'] }, isActive: true, updatedBy: 'seed' },
  { key: 'human_handoff', locale: 'en', channel: 'wa', body: 'Okay, connecting you to a human agent.', variables: { vars: [] }, isActive: true, updatedBy: 'seed' },
  { key: 'human_handoff', locale: 'ar', channel: 'wa', body: 'حسنًا، سنوصلك بممثل خدمة العملاء.', variables: { vars: [] }, isActive: true, updatedBy: 'seed' },
]

async function main() {
  for (const t of templates) {
    await prisma.template.upsert({
      where: { key_locale_channel: { key: t.key, locale: t.locale, channel: t.channel } },
      update: { body: t.body, variables: t.variables, isActive: t.isActive, updatedBy: t.updatedBy },
      create: t,
    })
    console.log(`Upserted ${t.key}/${t.locale}/${t.channel}`)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

