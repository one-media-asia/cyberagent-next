/**
 * Shared contract for future lab-control-plane integration.
 * These types are not an authorization mechanism; the server must verify
 * identity, ownership, template approval, quotas, and session state.
 */
export type LabSessionStatus =
  | "requested"
  | "authorizing"
  | "provisioning"
  | "ready"
  | "running"
  | "stopping"
  | "stopped"
  | "expired"
  | "failed";

export type LabSessionSummary = {
  id: string;
  templateId: string;
  status: LabSessionStatus;
  createdAt: string;
  expiresAt: string;
  endedAt?: string;
};

export type CreateLabSessionRequest = {
  templateId: string;
  /** Client-generated idempotency key; never use this as an auth credential. */
  idempotencyKey: string;
};
