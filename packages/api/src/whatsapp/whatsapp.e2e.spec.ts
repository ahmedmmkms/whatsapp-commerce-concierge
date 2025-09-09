import request from 'supertest';
import { createApp } from '../main.js';

describe('WhatsApp webhook verify (GET)', () => {
  it('echoes hub.challenge when verify_token matches', async () => {
    process.env.WHATSAPP_VERIFY_TOKEN = 'testtoken';
    const app = await createApp();
    const server = app.getHttpServer();
    await request(server)
      .get('/webhook/whatsapp')
      .query({ 'hub.mode': 'subscribe', 'hub.verify_token': 'testtoken', 'hub.challenge': '123' })
      .expect(200)
      .expect('123');
  });
});

