# CyberLearn hands-on labs: architecture and rollout
#
## Status
The dashboard's current labs and CTF challenges are browser-rendered simulations; they are not isolated compute environments. Do not describe them as real shells or live network access.

## Trust boundaries
1. **Learner browser**: untrusted input and presentation only.
2. **CyberLearn Next.js app (Vercel)**: course catalogue, login experience, and authenticated launch UI. Never place infrastructure credentials in `NEXT_PUBLIC_*` variables.
3. **Lab control plane (separate AWS service)**: validates Supabase access tokens, authorizes lab sessions, applies quotas, provisions sessions, issues short-lived access, and expires sessions. It is not the workload host.
4. **Lab data plane (private AWS network)**: disposable isolated workloads, no public inbound access except through a dedicated authenticated gateway; deny egress by default.
5. **Supabase**: identity and learner progress/session metadata. No lab workload receives Supabase service-role credentials or production secrets.

## Isolation baseline
- Use a disposable container or VM per session. For untrusted code execution, prefer microVMs or a managed sandbox runtime with a strong isolation boundary; ordinary containers share the host kernel.
- Run as non-root, drop Linux capabilities, enable seccomp/AppArmor or equivalent, use read-only root filesystems where practical, and impose CPU, memory, PID, disk, and wall-clock limits.
- Never mount the container runtime socket, host paths, cloud credentials, or production secrets into a workload. Do not use host networking or privileged mode.
- Place workloads in private subnets with rules denying internet egress, metadata endpoints, production VPCs, and other learner sessions. Allow only explicitly required internal destinations.
- Use an authenticated gateway for terminal/web access. Issue short-lived, single-session tokens; verify ownership on every control-plane operation.
- Apply per-user and global concurrency limits, rate limits, audit events, and automatic expiry/cleanup. Cleanup must delete writable session storage and revoke credentials.
- Pin images by digest, scan and rebuild them regularly, and launch only staff-approved templates.
- Treat command output and learner input as untrusted. Redact secrets from logs and cap output size.
- Keep the existing quiz simulations as a safe fallback while real labs are developed and tested.

## Session lifecycle
`requested -> authorizing -> provisioning -> ready -> running -> stopping -> stopped/expired/failed`

A session record should include an opaque ID, Supabase user ID, approved template ID/version, status, created/expiry/ended timestamps, and limited completion metadata. Never accept a user ID from the browser as authority; derive it from a verified access token. Use an idempotency key to avoid duplicate provisioning on retries.

## Progress and database
Continue using the existing `learning_progress` flow for current lessons/challenges. For real labs, introduce a separate table only after a Supabase migration and row-level security policies have been reviewed. Suggested fields: `id`, `user_id`, `template_id`, `status`, `created_at`, `expires_at`, `ended_at`, `completion_status`. RLS must restrict reads to the owning learner; privileged service credentials stay server-side.

## API outline (not yet implemented)
- `POST /sessions`: verify bearer token, validate an allowlisted template ID, enforce quotas, and create an idempotent session.
- `GET /sessions/:id`: verify ownership before returning limited status.
- `POST /sessions/:id/stop`: verify ownership and stop only that session.
- The browser must never submit an arbitrary image, shell command, user ID, network destination, or infrastructure identifier to the control plane.

## Staged rollout
1. Catalogue, simulations, and architecture documentation.
2. Server-side Supabase token verification and authorization tests.
3. Private sandbox runtime with no egress, strict resource limits, and automated expiry.
4. Authenticated gateway and end-to-end abuse testing.
5. Small controlled pilot; monitor cost, cleanup, and isolation before wider release.

## Launch gate
Do not enable arbitrary shell execution or deploy real vulnerable targets until authentication, ownership checks, network isolation, quotas, automatic cleanup, and abuse tests have passed. This branch does not provision AWS resources or enable a real shell.
