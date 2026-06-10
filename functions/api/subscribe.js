/**
 * Cloudflare Pages Function: POST /api/subscribe
 *
 * Captures an email and adds it to a Kit (formerly ConvertKit) form using
 * Kit's v4 API. The Kit API key stays server-side — it is read from the
 * environment and never sent to the client.
 *
 * Kit v4 differs from v3: you can no longer POST an email straight to a form.
 * The flow is two steps:
 *   1. POST /v4/subscribers          -> upsert subscriber by email, get its id
 *   2. POST /v4/forms/{id}/subscribers/{subscriberId} -> add subscriber to form
 * Auth is the `X-Kit-Api-Key` header (NOT a Bearer token, NOT v3's api_secret).
 *
 * Required environment variables (set in the Cloudflare Pages dashboard):
 *   KIT_API_KEY  - Kit v4 API key
 *   KIT_FORM_ID  - numeric id of the Kit form to subscribe people to
 */

const KIT_API_BASE = 'https://api.kit.com/v4';

// Pragmatic email check: one @, something before, a dotted domain after.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function onRequestPost({ request, env }) {
  const { KIT_API_KEY, KIT_FORM_ID } = env;

  if (!KIT_API_KEY || !KIT_FORM_ID) {
    console.error('[subscribe] Missing KIT_API_KEY or KIT_FORM_ID env var');
    return json({ ok: false, error: 'Server is not configured.' }, 500);
  }

  // Parse and validate the body.
  let email;
  try {
    const body = await request.json();
    email = typeof body?.email === 'string' ? body.email.trim() : '';
  } catch {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  if (!email || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  }

  const kitHeaders = {
    'Content-Type': 'application/json',
    'X-Kit-Api-Key': KIT_API_KEY,
  };

  try {
    // Step 1: create/upsert the subscriber by email. This is an upsert, so an
    // existing subscriber is returned rather than erroring.
    const createRes = await fetch(`${KIT_API_BASE}/subscribers`, {
      method: 'POST',
      headers: kitHeaders,
      body: JSON.stringify({ email_address: email }),
    });

    if (!createRes.ok) {
      const detail = await createRes.text();
      console.error('[subscribe] Kit create subscriber failed', createRes.status, detail);
      return json({ ok: false, error: 'Could not subscribe right now.' }, 502);
    }

    const created = await createRes.json();
    const subscriberId = created?.subscriber?.id;

    if (!subscriberId) {
      console.error('[subscribe] Kit response missing subscriber id', JSON.stringify(created));
      return json({ ok: false, error: 'Could not subscribe right now.' }, 502);
    }

    // Step 2: add the subscriber to the form.
    const formRes = await fetch(
      `${KIT_API_BASE}/forms/${encodeURIComponent(KIT_FORM_ID)}/subscribers/${subscriberId}`,
      {
        method: 'POST',
        headers: kitHeaders,
        body: JSON.stringify({}),
      }
    );

    if (!formRes.ok) {
      const detail = await formRes.text();
      console.error('[subscribe] Kit add-to-form failed', formRes.status, detail);
      return json({ ok: false, error: 'Could not subscribe right now.' }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    console.error('[subscribe] Unexpected error', err);
    return json({ ok: false, error: 'Could not subscribe right now.' }, 502);
  }
}

// Only POST is exported, so Cloudflare Pages automatically returns
// 405 Method Not Allowed for GET/PUT/etc. against this route.
