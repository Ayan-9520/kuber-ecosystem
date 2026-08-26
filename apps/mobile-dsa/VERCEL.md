# Partner DSA App — Vercel (`partner.kuberone.online`)

## One API tunnel for Admin + Partner
Keep **one** Cloudflare tunnel to Docker backend `:4000`.
Both `kuberone.online` (Admin) and `partner.kuberone.online` (DSA) rewrite `/api` to that tunnel.

## Deploy Partner app (not Admin)

1. Vercel → **Add New Project** → import `Ayan-9520/kuber-ecosystem`
2. **Root Directory:** `apps/mobile-dsa`
3. Framework: Other / leave blank (uses `vercel.json`)
4. Env: leave empty, or set full tunnel URL — **never** `/api/v1` (Vercel→trycloudflare rewrites 502)
5. Deploy

## Move subdomain off Admin project

1. Open project **kuber-ecosystem-admin** → Domains
2. **Remove** `partner.kuberone.online`
3. Open **Partner** project → Domains → Add `partner.kuberone.online`
4. DNS already points to Vercel — should become Valid quickly

## Tunnel

```bat
scripts\start-api-tunnel.cmd
```

If tunnel URL changes, update `rewrites` in:
- `apps/admin/vercel.json`
- `apps/mobile-dsa/vercel.json`
then push / redeploy both.
