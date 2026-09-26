import { KeyRound } from "lucide-react";
import { revokeApiKey } from "@/app/dashboard/actions";
import { ApiKeyCreate } from "@/components/app/api-key-create";
import { Empty, PageHead } from "@/components/app/ui";
import { requireUser } from "@/lib/auth";
import { dateTime, relative } from "@/lib/format";
import { admin } from "@/lib/supabase/admin";

export default async function ApiKeysPage() {
  const user = await requireUser();
  const { data: keys } = await admin().from("api_keys").select().eq("user_id", user.id).order("created_at", { ascending: false });
  const active = (keys ?? []).filter((k) => !k.revoked_at);
  const revoked = (keys ?? []).filter((k) => k.revoked_at);

  return (
    <>
      <PageHead
        title="API keys"
        sub="Authenticate requests with Authorization: Bearer <key>. Keys never expire until you revoke them."
        actions={<ApiKeyCreate />}
      />

      {!active.length ? (
        <Empty icon={<KeyRound size={20} />} title="No active keys">
          Create a key to call the Vouch API from your code.
        </Empty>
      ) : (
        <div className="table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Key</th>
                <th>Created</th>
                <th>Last used</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {active.map((k) => (
                <tr key={k.id}>
                  <td>
                    <b>{k.name}</b>
                  </td>
                  <td className="mono-sm">{k.prefix}••••••••••••</td>
                  <td className="nowrap">{dateTime(k.created_at)}</td>
                  <td className="nowrap muted-sm">{k.last_used_at ? relative(k.last_used_at) : "Never"}</td>
                  <td className="r">
                    <form action={revokeApiKey.bind(null, k.id)}>
                      <button type="submit" className="btn btn-ghost btn-sm danger">
                        Revoke
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section className="panel quickstart">
        <div className="panel-head">
          <h2>Quickstart</h2>
        </div>
        <pre className="code-block">{`curl -X POST https://api.vouch.dev/v1/scrape?wait=60 \\
  -H "Authorization: Bearer $VOUCH_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "urls": ["https://www.instagram.com/reel/C8xQ2Lm/"], "track": true }'`}</pre>
      </section>

      {revoked.length > 0 && (
        <details className="revoked">
          <summary>
            {revoked.length} revoked {revoked.length === 1 ? "key" : "keys"}
          </summary>
          <ul>
            {revoked.map((k) => (
              <li key={k.id}>
                <span>{k.name}</span>
                <span className="mono-sm">{k.prefix}…</span>
                <span className="muted-sm">revoked {relative(k.revoked_at)}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}
