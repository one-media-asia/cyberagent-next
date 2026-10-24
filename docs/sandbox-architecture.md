# CyberLearn Sandbox Architecture

## Product direction

CyberLearn labs should teach investigation, not merely quiz learners. Learners gather evidence, test hypotheses, explain uncertainty, and see the consequences of decisions.

## Target lab topology

1. **Windows Server VM** — a disposable lab domain and infrastructure services for lessons that need them (for example, Active Directory, DNS, synthetic accounts, and server event logs).
2. **Windows client VM** — the learner's endpoint for process inspection, event-log analysis, PowerShell, and controlled incident scenarios.
3. **Kali Linux VM** — the learner's security workstation for authorised discovery, packet analysis, and testing within the lab network.

Individual lessons may use only the machines they need, but the full practical range should support all three.

## Hosting strategy

- **Develop and test locally first** where the user's hardware supports the required hypervisor and Windows licensing.
- **Host the learner-facing service and on-demand ranges in AWS** when ready for remote access and broader availability.
- Keep local and cloud provisioning reproducible; document VM images, network rules, setup steps, and reset procedures.
- Start with one controlled demonstration range if needed, then move to isolated per-learner or per-session environments as demand and budget justify.
- Do not assume the user's local hardware, AWS account, region, budget, or Windows licences. Confirm these before provisioning anything.

## Network safety boundaries

- Place VMs on a dedicated private virtual network for each lab session.
- Never bridge lab interfaces onto a learner's home or corporate LAN.
- Deny internet egress from lab VMs by default; permit only explicitly required updates or training services through controlled gateways.
- Restrict Kali to the authorised lab subnet; never use it as a launch point for attacks against public targets.
- Prevent lateral movement between learner sessions.
- Never expose vulnerable target services directly to the public internet.
- Use short-lived sessions, resource limits, snapshots, and reliable reset/teardown.
- Keep management access separate from the learner network.
- Log session lifecycle and security-relevant lab actions without collecting unnecessary personal data.
- Test isolation, routing, and egress controls before inviting learners.

## Learner access

The preferred experience is browser access without requiring a VPN client for the first lessons. For interactive desktop access, evaluate a secured browser gateway or remote-display solution with authentication, session isolation, and no direct exposure of VM management ports. A VPN option can be added for learners who need to connect from their own computers. Browser access does not remove the need for secure network boundaries.

## Implementation phases

### Phase 1 — investigation design

Build a browser-based simulated investigation in CyberLearn. Present believable process listings, DNS history, connection records, Windows event entries, and timestamps. Learners choose what to inspect; evidence appears as a result. Do not label an anomaly malicious without sufficient evidence.

### Phase 2 — local proof of concept

Confirm available hardware and hypervisor, Windows Server and Windows client licensing, and whether three VMs can run simultaneously. Create a private lab network, synthetic data, and a repeatable reset procedure. Validate that the lab cannot reach the home LAN or public targets.

### Phase 3 — AWS proof of concept

Choose an AWS region, instance sizes, disk sizes, Windows licensing approach, browser access method, and maximum session count based on actual cost estimates. Provision isolated networking with deny-by-default egress and explicit teardown. Start and stop lab machines on demand to limit cost.

### Phase 4 — learner scale

Add per-user or per-session isolation, quotas, automated expiry, audit logs, health checks, and cost controls. Never let one learner's session access another's machines or data.

## Teaching principles

- Evidence before conclusions.
- Teach normal behaviour before anomalies.
- Separate observations, interpretations, and assumptions.
- Allow multiple defensible hypotheses when evidence is incomplete.
- Make learner choices affect what evidence they see next.
- Treat mistakes as learning opportunities, not just wrong answers.
- Use synthetic identities and data; practise only on systems with explicit authorisation.

## Initial scenario

A Windows client begins making periodic outbound TLS connections. Learners can inspect process details, DNS history, Windows event logs, and server-side records. The lab does not call the behaviour malicious based on one anomaly; learners build a timeline, compare it with baseline activity, and choose a proportionate next step.

## Not yet implemented

This document records the architecture and product direction only. It does not provision machines, configure a VPN, or claim that live labs are available.
