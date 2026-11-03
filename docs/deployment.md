# Deployment

This document covers running the app in production: building, environment
variables, process/hosting notes, and backing up the JSON data store. For
architecture/mechanism (why there's no database, how the write queue works),
see [docs/architecture.md](architecture.md#json-persistence-architecture).

## Build and run

```bash
npm install
npm run build      # produces .output/
npm run start       # node .output/server/index.mjs
```

`npm run start` is a thin wrapper added for deployment convenience — it runs
the exact command Nitro prints after a build
(`node .output/server/index.mjs`). The build output is a self-contained
Node server (Nitro `node-server` preset); it does not need the source tree,
`node_modules` for the app code, or a separate web server to proxy requests
to Nuxt internals, though a reverse proxy (see below) is still recommended.

## Environment variables

| Variable         | Required | Default                          | Purpose                                                                                                                                                                                                        |
| ---------------- | -------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATA_FILE_PATH` | No       | `.data/data.json`                | Path to the single JSON file backing all persisted data (products, orders). See [.env.example](../.env.example).                                                                                               |
| `PORT`           | No       | `3000`                           | Port the Nitro `node-server` listens on (standard Nitro/H3 behavior, not app-specific config).                                                                                                                 |
| `HOST`           | No       | `0.0.0.0`                        | Bind address, same as above.                                                                                                                                                                                   |
| `NODE_ENV`       | No       | unset (`production` recommended) | Standard Node convention. Setting it to `production` is what gives the sanitized error responses verified in [docs/delivery-report.md](delivery-report.md) (no stack traces/file paths in API error payloads). |

No variable is required to run the app — every default works out of the
box, including on first run with no existing data file (it auto-creates
with five seed products; see [docs/data-model.md](data-model.md#product)).

**Deployment-critical note on `DATA_FILE_PATH`**: whatever directory holds
this file (and its parent directory, so the file can be auto-created on
first run) must be:

1. **Writable** by the process running the server.
2. **Persistent across deploys and restarts** — this file is the entire
   application data store. In a containerized deployment, mount it as a
   persistent volume; don't let it live on a container's writable layer
   that gets discarded on redeploy.

## Process management

The build output is a plain Node process with no built-in daemonization,
restart-on-crash, or log rotation. Run it under a process manager:

- **systemd**: a simple unit running `node .output/server/index.mjs` with
  `Restart=on-failure`, `WorkingDirectory` set to the deployed app
  directory, and `Environment=DATA_FILE_PATH=...`/`PORT=...` as needed.
- **pm2** / **Docker + an orchestrator's own restart policy**: either works
  equally well — there's nothing app-specific here beyond the
  `DATA_FILE_PATH` persistence requirement above.

Put a reverse proxy (nginx, Caddy, or your platform's load balancer) in
front of it for TLS termination; the app itself serves plain HTTP.

**Readiness/liveness check**: `GET /api/health` returns
`{"success":true,"data":{"status":"ok","dataVersion":1}}` on a healthy
instance and is safe to use as a liveness/readiness probe — it reads the
data file but performs no writes.

### Single-process limitation

The in-process write queue in `server/utils/storage.ts` guarantees
race-free reads/writes **within one Node process**. It does **not**
coordinate across multiple processes or instances sharing the same
`DATA_FILE_PATH` (e.g. horizontal scaling, or a process manager configured
to run more than one instance). Run exactly one instance of this app
against a given data file. See
[docs/architecture.md](architecture.md#json-persistence-architecture) for
the full rationale and what would need to change (real file locking or a
different storage backend) to lift this limitation.

## Data storage, backup, and restore

All application data lives in one file (`DATA_FILE_PATH`, default
`.data/data.json`), validated against `DataFileSchema`
(`server/schemas/data.schema.ts`) on every read and write. There is no
database to back up separately — backing up this one file _is_ the backup.

### Backup

Because every write is atomic (write-to-temp-file-then-rename — see
[docs/architecture.md](architecture.md#json-persistence-architecture)),
copying the file at any point in time, even while the server is running,
will never catch it mid-write — you'll always get a complete, valid JSON
snapshot (either the old or the new version, never a half-written one).

```bash
# Ad-hoc backup
cp /path/to/data.json /path/to/backups/data-$(date +%Y%m%dT%H%M%S).json

# Example cron entry for periodic backups (hourly, keep via your own retention policy)
0 * * * * cp /srv/restaurant/.data/data.json /srv/backups/data-$(date +%Y%m%dT%H%M%S).json
```

For a managed/containerized deployment, back up the persistent volume that
holds `DATA_FILE_PATH` using your platform's normal volume-snapshot
mechanism instead of a cron job inside the container.

### Restore

1. Stop the server (or at least stop routing traffic to it) — don't restore
   onto a file a live process might be mid-write to.
2. Copy the chosen backup file over the path configured as `DATA_FILE_PATH`.
3. Start the server and confirm `GET /api/health` returns `200` and
   `GET /api/orders/updates` returns the expected order count.

### Corrupted file behavior

If `data.json` exists but fails to parse as JSON or fails `DataFileSchema`
validation, the server does **not** auto-repair it — every read/write
fails loudly with `500 Data store is corrupted or unreadable` instead of
risking silent data loss. If you hit this in production: stop the server,
inspect the file by hand (or restore the most recent backup), fix/replace
it, then restart. This was verified directly during this review — see
[docs/delivery-report.md](delivery-report.md).

## What this deployment setup does not cover

- **No database migration tooling** — there's no database. A future schema
  change to `DataFileSchema` needs its own forward-migration logic if it's
  not backward-compatible; see `version` in
  [docs/data-model.md](data-model.md#json-storage-structure-datadatajson).
- **No multi-instance/horizontal scaling** — see "Single-process
  limitation" above.
- **No HTTPS termination** — provide it via a reverse proxy.
- **No authentication** — `/staff` and `/admin` are not access-controlled
  at the application layer; if deployed publicly, restrict access at the
  network/proxy layer (e.g. VPN, IP allowlist, or proxy-level basic auth)
  until `app/middleware/`/`server/middleware/` auth is built (see
  [docs/project-overview.md](project-overview.md#explicit-limitations-and-non-goals)).
