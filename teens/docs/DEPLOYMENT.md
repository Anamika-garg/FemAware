# Deploying FemAware

## Recommended: single origin (API serves the client)

The session cookie is `SameSite=Lax`, so the simplest secure setup serves the React build and the API from **one origin**.

```bash
npm ci
npm run build                    # client/dist
NODE_ENV=production \
MONGODB_URI="mongodb+srv://.../femaware_demo" \
SERVE_CLIENT=true \
CLIENT_ORIGIN=https://femaware.example.org \
PORT=8080 \
npm start
```

Then run the seed once against the production database: `MONGODB_URI=... npm run seed`.

### Render / Railway / Fly.io (single web service)

- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Environment: `NODE_ENV=production`, `MONGODB_URI`, `SERVE_CLIENT=true`, `CLIENT_ORIGIN=https://<your-domain>`
- Health check path: `/api/health`
- Behind a proxy, `trust proxy` is already enabled, so secure cookies and rate limits work.

### Docker (example)

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build && npm prune --omit=dev
ENV NODE_ENV=production SERVE_CLIENT=true PORT=8080
EXPOSE 8080
CMD ["npm", "start"]
```

## Split hosting (static client + separate API)

This works if both are on the **same site** (for example `app.example.org` and `api.example.org`). Set
`VITE_API_URL=https://api.example.org/api` at client build time and `CLIENT_ORIGIN=https://app.example.org` on the API.
Completely different domains would need `SameSite=None` cookies, which this release deliberately does not use.

## Database

- Use MongoDB Atlas (or another managed MongoDB 6+). Create a **dedicated demo database** (for example `femaware_demo`)
  that is never shared with production patient data.
- Indexes, including the TTL indexes that auto-delete demo data, are created on startup.
- Restrict network access to the API host. Use a least-privilege DB user (readWrite on the demo database only).

## Production content gate

With `NODE_ENV=production`, the API serves only `clinician_reviewed` lessons and guidance. Until sign-off is recorded
(`npm run review -w server -- ...`), lessons are hidden and symptom checks return 503. For a public demo with unreviewed
content, set `ALLOW_UNREVIEWED_GUIDANCE=true`. The UI then labels every page "Draft — awaiting clinician review". Only do
this for a clearly-labelled demo.

## Checklist

- [ ] `NODE_ENV=production` (enables `Secure` cookies and the content gate)
- [ ] HTTPS only
- [ ] `MONGODB_URI` points at a dedicated demo database
- [ ] `npm run seed` run, and clinical sign-off recorded (or `ALLOW_UNREVIEWED_GUIDANCE=true` deliberately set for a demo)
- [ ] `npm test` passes in CI
- [ ] Privacy page and disclaimer reviewed by whoever is responsible for legal/compliance in your region
