import { rotateWebhookSecret, sendTestWebhook } from "@/app/dashboard/actions";
import { ProfileForm, WebhookForm } from "@/components/app/settings-forms";
import { PageHead } from "@/components/app/ui";
import { requireUser } from "@/lib/auth";
import { relative } from "@/lib/format";
import { admin } from "@/lib/supabase/admin";

const VERIFY = `import crypto from "node:crypto";

// req.headers["vouch-signature"] looks like "t=1790000000,v1=5f3a…"
export function verify(rawBody, header, secret) {
  const { t, v1 } = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const expected = crypto.createHmac("sha256", secret).update(\`\${t}.\${rawBody}\`).digest("hex");
  const fresh = Math.abs(Date.now() / 1000 - Number(t)) < 300;
  return fresh && crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
}`;

export default async function SettingsPage() {
  const user = await requireUser();
  const { data: p } = await admin().from("profiles").select().eq("id", user.id).maybeSingle();
  const last = p?.webhook_last_status;

  return (
    <>
      <PageHead title="Settings" sub="Your profile and where Vouch sends events." />

      <section className="panel">
        <div className="panel-head">
          <h2>Profile</h2>
        </div>
        <ProfileForm fullName={p?.full_name ?? ""} company={p?.company ?? ""} email={user.email ?? ""} />
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Webhooks</h2>
          <span className="muted-sm">Events: run.succeeded · run.failed · snapshots.created</span>
        </div>
        <div className="panel-body">
          <p className="muted-sm" style={{ margin: 0 }}>
            We POST JSON to your endpoint when a run finishes and whenever tracked posts get new snapshots. Every request carries a
            <code> Vouch-Signature</code> header you can verify with your signing secret.
          </p>
          <WebhookForm url={p?.webhook_url ?? ""} />
          {p?.webhook_url && (
            <>
              <div className="secret-row">
                <span className="muted-sm">Signing secret</span>
                <code className="secret">{p.webhook_secret}</code>
                <form action={rotateWebhookSecret}>
                  <button type="submit" className="btn btn-ghost btn-sm">
                    Rotate
                  </button>
                </form>
              </div>
              <div className="secret-row">
                <span className="muted-sm">Last delivery</span>
                <span>
                  {last === null || last === undefined ? (
                    "None yet"
                  ) : (
                    <span className={`badge ${last >= 200 && last < 300 ? "badge-ok" : "badge-bad"}`}>
                      {last === 0 ? "No response" : `HTTP ${last}`}
                    </span>
                  )}{" "}
                  <span className="muted-sm">{relative(p.webhook_last_at)}</span>
                </span>
                <form action={sendTestWebhook}>
                  <button type="submit" className="btn btn-ghost btn-sm">
                    Send test event
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
        <pre className="code-block">{VERIFY}</pre>
      </section>
    </>
  );
}
