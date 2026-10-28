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

/** Safe, browser-visible summary; never include credentials or internal addresses. */
export type LabSessionSummary = {
  id: string;
  templateId: string;
  status: LabSessionStatus;
  createdAt: string;
  expiresAt: string;
  endedAt?: string;
};

export type CreateLabSessionRequest = {
  /** Must match an allowlisted catalogue ID; never an arbitrary runtime image. */
  templateId: string;
  /** Client-generated retry key; server validates length and format. */
  idempotencyKey: string;
};
