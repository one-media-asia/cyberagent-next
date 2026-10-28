/**
 * Static catalogue for approved CyberLearn lab templates.
 * Metadata only: this does not provision compute or execute commands.
 */
export type LabTemplate = {
  id: string;
  title: string;
  category: "linux" | "networking" | "web-security" | "forensics";
  level: "beginner" | "intermediate";
  estimatedMinutes: number;
  risk: "low" | "moderate";
  mode: "guided-simulation" | "isolated-runtime";
  description: string;
  learningObjectives: readonly string[];
  /** Infrastructure template ID; must be approved server-side. */
  runtimeTemplateId?: string;
};

export const labTemplates = [
  {
    id: "linux-terminal-basics",
    title: "Linux Terminal Basics",
    category: "linux",
    level: "beginner",
    estimatedMinutes: 10,
    risk: "low",
    mode: "isolated-runtime",
    description: "Practise basic navigation and file inspection in a disposable Linux workspace.",
    learningObjectives: ["Identify the current working directory", "List files and inspect a training directory", "Explain why command execution must be scoped to a sandbox"],
    runtimeTemplateId: "linux-basics-v1",
  },
  {
    id: "network-packet-investigation",
    title: "Network Packet Investigation",
    category: "forensics",
    level: "beginner",
    estimatedMinutes: 15,
    risk: "low",
    mode: "guided-simulation",
    description: "Investigate a supplied packet transcript and identify suspicious DNS activity.",
    learningObjectives: ["Filter DNS-related evidence", "Extract a hostname from a simulated packet record", "Separate an indicator from a confirmed conclusion"],
  },
  {
    id: "private-network-fundamentals",
    title: "Private Network Fundamentals",
    category: "networking",
    level: "beginner",
    estimatedMinutes: 15,
    risk: "low",
    mode: "isolated-runtime",
    description: "Explore a small, private training network with explicitly bounded connectivity.",
    learningObjectives: ["Distinguish loopback, private, and public address ranges", "Interpret a constrained network topology", "Explain why lab egress is denied by default"],
    runtimeTemplateId: "private-network-v1",
  },
  {
    id: "web-security-practice",
    title: "Web Security Practice",
    category: "web-security",
    level: "beginner",
    estimatedMinutes: 20,
    risk: "moderate",
    mode: "isolated-runtime",
    description: "Learn web security against an intentionally vulnerable training target isolated from production.",
    learningObjectives: ["Identify a basic web input-validation weakness", "Describe the defensive fix", "Verify that the target is a designated training environment"],
    runtimeTemplateId: "web-security-v1",
  },
] as const satisfies readonly LabTemplate[];

export function findLabTemplate(id: string): LabTemplate | undefined {
  return labTemplates.find((template) => template.id === id);
}
