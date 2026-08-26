# Partner DSA App — Vercel (`partner.kuberone.online`)

## Why Vercel showed Error
Expo web export takes **~45–60 min** and often fails / times out on Vercel CI.
This repo now deploys a **prebuilt** `apps/mobile-dsa/dist` (install/build are no-ops).

## Correct Vercel project (IMPORTANT)
`partner.kuberone.online` must be on a project whose **Root Directory = `apps/mobile-dsa`**.

If the domain is on `kuber-ecosystem-admin` or `kuber-ecosystem-admin-vjk9`:
1. That project → **Settings → Domains** → **Remove** `partner.kuberone.online`
2. Create / open Partner project → Root Directory `apps/mobile-dsa` → Add domain `partner.kuberone.online`

Admin project Root Directory must stay `apps/admin` (domain `kuberone.online` only).

## Redeploy after tunnel change
1. Locally rebuild partner dist with the tunnel URL (or ask agent)
2. Commit `apps/mobile-dsa/dist` + `vercel.json`
3. Push `main` → Vercel deploys in **~30 seconds**

## Manual Redeploy (Vercel UI)
1. Open the **Partner** project (Root = `apps/mobile-dsa`)
2. **Deployments** → latest → **⋯** → **Redeploy** (uncheck “Use existing Build Cache” if stuck)
3. Wait until **Ready** (should be fast with prebuilt dist)

## Tunnel
Keep one Cloudflare tunnel to Docker `:4000`. Update rewrites + rebuild dist when URL changes.
