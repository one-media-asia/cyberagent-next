# CyberLearn Sandbox Architecture

## Product direction

CyberLearn labs should teach investigation, not merely quiz learners. Learners gather evidence, test hypotheses, explain uncertainty, and see the consequences of decisions.

## Lab model: three VMs per practical exercise

1. **Windows Server VM** — domain and infrastructure services for lessons that need them (for example, Active Directory, DNS, Windows event logs). Use a disposable lab domain with synthetic accounts and data.
2. **Windows client VM** — the learner's target for endpoint investigation, event-log analysis, process review, and controlled incident scenarios.
3. **Kali Linux VM** — the learner's security workstation for approved discovery and testing within the lab network.

This is the intended baseline topology. Individual lessons may use only the VMs they need, but the full range should support all three.

## Network safety boundaries

- Put VMs on a dedicated, per-session private virtual network.
- Do not bridge lab interfaces onto a learner's home or corporate LAN.
- Deny internet egress from all lab VMs by default; permit only explicitly required updates or training services through controlled gateways.
- Restrict Kali to the authorised lab subnet; never configure it as a launch point for attacks against public targets.
- Prevent lateral movement between learner sessions.
- Never expose vulnerable target services directly to the public internet.
- Use short-lived sessions, resource limits, snapshots, and reliable reset/teardown.
- Keep management access separate from the learner network.
- Log session lifecycle and security-relevant lab actions without collecting unnecessary personal data.
- Test network isolation, routing, and egress controls before inviting learners.

## Learner experience

### Phase 1 — browser investigation (first milestone)

Build an interactive, simulated investigation inside CyberLearn. Present believable evidence such as process listings, DNS queries, connection logs, Windows event records, and timestamps. Learners choose what to inspect next; the system reveals relevant evidence and explains outcomes without prematurely labelling activity as malicious.

This phase proves the learning design without requiring expensive VM infrastructure.

### Phase 2 — real three-VM range

Provision Windows Server, Windows client, and Kali as isolated, resettable VMs. Provide a clear launch/stop/reset flow and browser access where practical. A VPN may be offered for learners who need to connect from their own computers, but should not be mandatory for the first browser-based lessons.

Before implementation, decide the hypervisor/cloud, Windows licensing and images, session concurrency, budget, browser-access method, and how identities and per-user networks will be isolated.

## Teaching principles

- Evidence before conclusions.
- Teach normal behaviour before anomalies.
- Separate observations, interpretations, and assumptions.
- Allow multiple defensible hypotheses when evidence is incomplete.
- Make learner choices affect what evidence they see next.
- Treat mistakes as learning opportunities, not just wrong answers.
- Use synthetic identities and data; never practise on systems without explicit authorisation.

## Initial scenario

A Windows client begins making periodic outbound TLS connections. Learners can inspect process details, DNS history, Windows event logs, and server-side records. The lab does not call the behaviour malicious based on one anomaly; learners build a timeline, compare it with baseline activity, and choose a proportionate next step.

## Not yet implemented

This document records the architecture and product direction only. It does not provision machines, configure a VPN, or claim that live labs are available.
