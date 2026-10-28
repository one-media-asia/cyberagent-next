# CyberLearn hands-on labs: architecture and rollout

## Status

This document defines the first implementation boundary. The current dashboard's labs and CTF challenges are browser-rendered simulations in `app/page.tsx`; they are not isolated compute environments. Do not describe them as real shells or real network access.

## Trust boundaries

1. **Learner browser**: untrusted input and presentation only.
2. **CyberLearn Next.js app (Vercel)**: course catalogue, login experience, and authenticated launch UI. Never place infrastructure credentials in `NEXT_PUBLIC_*` variables.
3. **Lab control plane (separate AWS service)**: validates Supabase access tokens, maps identity to an authorised lab, applies per-user/global quotas, provisions sessions, issues short-lived access, and expires sessions. This is not the workload host.
4. **Lab data plane (private AWS network)**: disposable isolated workloads, no inbound access from the public internet except through a dedicated authenticated gateway; deny egress by default.
5. **Supabase**: identity and learner progress/session metadata. No lab workload receives Supabase service-role credentials or production secrets.

## Isolation baseline

- Use one disposable container or VM per session. For untrusted code execution, prefer microVMs or a managed sandbox runtime with a strong isolation boundary; ordinary containers share the host kernel.
- Run as non-root, drop Linux capabilities, enable seccomp/AppArmor or equivalent, use read-only root filesystems where practical, and impose CPU, memory, PID, disk, and wall-clock limits.
- Never mount the Docker/container runtime socket, host paths, cloud credentials, or production secrets into a workload. Do not use host networking or privileged mode.
- Put workloads in private subnets with security-group rules that deny internet egress, access to metadata endpoints, production VPCs, and other learner sessions. Allow only explicitly required internal destinations.
- Use an authenticated gateway for terminal/web access. Issue short-lived, single-session tokens; verify ownership on every control-plane operation.
- Apply per-user and global concurrency limits, rate limits, audit events, and automatic expiry/cleanup. Cleanup must delete writable session storage and revoke session credentials.
- Keep lab images pinned by digest, minimal, scanned, and rebuilt regularly. Only staff-approved templates may be launched.
- Treat command output, uploaded files, and learner-provided strings as untrusted. Redact secrets from logs and cap output size.
- Keep the existing quiz simulations available as a safe fallback while real labs are developed and tested.

## Session lifecycle

`requested -> authorizing -> provisioning -> ready -> running -> stopping -> stopped/expired/failed`

A session record should include an opaque ID, Supabase user ID, approved template ID/version, status, created/expiry/ended timestamps, and limited completion metadata. Never accept a user ID from the browser as authority; derive it from a verified access token. Use an idempotency key to avoid duplicate provisioning on retries.

## Progress and database

Continue using the existing `learning_progress` flow for current lessons/challenges. For real labs, introduce a separate table only after a Supabase migration and row-level security policies have been reviewed. Suggested fields: `id`, `user_id`, `template_id`, `status`, `created_at`, `expires_at`, `ended_at`, `completion_status`. RLS must restrict reads to the owning user; client roles must not be able to set privileged statuses or award themselves verified completion. Completion should be written by the trusted control plane or verified by a server-side grader.

## API outline (not implemented yet)

- `POST /api/labs/sessions`: authenticate user, validate approved template, enforce quotas, create session.
- `GET /api/labs/sessions/:id`: return status only after owner/admin authorization.
- `POST /api/labs/sessions/:id/stop`: owner/admin check, revoke gateway token, terminate workload.
- A separate internal worker provisions and destroys workloads. Do not expose Docker/Kubernetes APIs to the browser.

All endpoints require authentication, input validation, CSRF protection appropriate to the auth mechanism, rate limits, structured audit logging, and explicit error handling. Do not implement these endpoints until server-side Supabase token verification and the AWS control-plane credentials are configured.

## Staged rollout

1. Document boundaries and add a typed, static approved-template catalogue (no provisioning side effects).
2. Add Supabase server-side auth verification and migration/RLS tests.
3. Deploy the isolated control plane and private lab network separately from Vercel.
4. Add the authenticated gateway and session lifecycle endpoints.
5. Start with a low-risk Linux command lab with a strict command allowlist; never pass arbitrary shell strings to `exec`.
6. Add network and intentionally vulnerable web labs only after isolation and egress tests pass.
7. Run adversarial tests: cross-user session IDs, expired tokens, SSRF/metadata access, egress, resource exhaustion, cleanup failures, and persistence between sessions.

## Launch gate

A lab is not production-ready until ownership checks, network denial, resource quotas, timeout, teardown, and isolation tests have all passed. Do not launch real user-supplied arbitrary code in a normal shared container.
