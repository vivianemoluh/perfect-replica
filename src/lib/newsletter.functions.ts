import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().trim().max(80).optional().default(""),
  email: z.string().trim().toLowerCase().email().max(200),
  source: z.string().trim().max(60).optional().default("site"),
});

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input) => schema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Backup in our DB (idempotent on email unique)
    const { error: dbErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert(
        { email: data.email, first_name: data.firstName || null, source: data.source },
        { onConflict: "email", ignoreDuplicates: false },
      );
    if (dbErr) console.error("[newsletter] db error", dbErr);

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      // Brevo not configured yet — still saved locally
      return { ok: true, alreadySubscribed: false, brevoConfigured: false };
    }

    const listId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : undefined;

    const resp = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        attributes: data.firstName ? { PRENOM: data.firstName, FIRSTNAME: data.firstName } : undefined,
        listIds: listId ? [listId] : undefined,
        updateEnabled: true,
      }),
    });

    if (resp.status === 201) return { ok: true, alreadySubscribed: false, brevoConfigured: true };
    if (resp.status === 204) return { ok: true, alreadySubscribed: true, brevoConfigured: true };

    let body: unknown = null;
    try { body = await resp.json(); } catch {}
    const code = (body as { code?: string } | null)?.code;
    if (code === "duplicate_parameter") return { ok: true, alreadySubscribed: true, brevoConfigured: true };

    console.error("[newsletter] brevo error", resp.status, body);
    throw new Error("Newsletter signup failed");
  });
