export type AiControlEvidenceItem = {
  id: string;
  title: string;
  summary: string;
  href: string;
};

export type AiControlResultItem = {
  id: string;
  title: string;
  summary: string;
  badges: string[];
  meta: string;
  href?: string;
  actionLabel?: string;
};

export type AiControlJobItem = {
  id: string;
  title: string;
  summary: string;
  status: string;
  progress: number;
  leadAgent: string;
  supportingAgents: string[];
  meta: string;
  href?: string;
  actionLabel?: string;
};

export type AiControlConfirmationItem = {
  id: string;
  title: string;
  summary: string;
  reason: string;
  owner: string;
  agentRunId?: string;
  href?: string;
  actionLabel?: string;
};
