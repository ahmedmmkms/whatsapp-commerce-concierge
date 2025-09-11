# WhatsApp Number Migration Playbook

Owner: AMM
Status: Draft

## Goals
- Safely migrate WhatsApp sender number or Business Account settings without downtime.
- Validate message templates and webhooks before and after.

## Prerequisites
- Access to Meta Business Manager with required permissions.
- WhatsApp Cloud API app configured; new number provisioned and verified.
- API deployed and reachable at `/webhook/whatsapp` (GET verify + POST ingest).

## Steps
1) Sandbox/Pre-Prod Validation
- Create/test templates (AR/EN) with the new sender in sandbox.
- Verify `/webhook/whatsapp` GET token (set `WHATSAPP_VERIFY_TOKEN`).
- Use `scripts/test-whatsapp-webhook.ps1` to simulate signed POSTs.

2) Configuration Cutover
- Set `WHATSAPP_PHONE_ID` and `WHATSAPP_TOKEN` for the new number in the API environment.
- Toggle `WHATSAPP_SEND_ENABLED=1` only after smoke verification.
- Confirm `CORS_ORIGINS` updated for any new web origins.

3) Template Review
- Ensure required templates are approved/active: `order_status`, `start_return`, `rma_instructions`, `human_handoff` (AR/EN).
- Update template IDs if moving to provider-managed templates.

4) Webhook & Health Checks
- Re-register webhook URL if required by the new app.
- Hit `/healthz`, `/queue/health`, `/health/metrics` to ensure stability.

5) Pilot Rollout
- Use feature flags to restrict bot replies to pilot cohort (see flags below).
- Monitor logs, metrics (P95, error rates), and DLQ.

6) Rollback Plan
- Keep previous token/phone env vars ready.
- Use `scripts/rollback-validate.ps1` to validate both current and rollback deployments.

## Feature Flags (Env)
- `RETURNS_ENABLED=1|0`
- `PDPL_DELETE_MODE=sync|queue` (future)
- `PILOT_WHITELIST=+9665xxxxxxx,+9715xxxxxxx` (comma-separated E.164)
- `WHATSAPP_SEND_ENABLED=1|0`

## Verification Checklist
- Inbound webhook GET verify OK.
- Inbound webhook POST signature verification OK.
- Outbound send enabled and succeeds for pilot whitelist.
- Templates resolve (AR/EN) and deliver.
- No spikes in 5xx, DLQ, or error logs.

## Rollback
- Revert env vars to previous number/token.
- Re-run acceptance scripts; confirm metrics and error rates normalize.

