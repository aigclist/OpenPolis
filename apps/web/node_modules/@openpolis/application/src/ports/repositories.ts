import type {
  AgentRun,
  Approval,
  Asset,
  Brief,
  Event,
  Feedback,
  Issue,
  Region,
  Task,
  Team
} from "@openpolis/contracts";

export interface IssueRepository {
  getById(id: string): Promise<Issue | null>;
  save(issue: Issue): Promise<void>;
}

export interface AssetRepository {
  getById(id: string): Promise<Asset | null>;
  save(asset: Asset): Promise<void>;
}

export interface BriefRepository {
  getById(id: string): Promise<Brief | null>;
  save(brief: Brief): Promise<void>;
}

export interface TaskRepository {
  getById(id: string): Promise<Task | null>;
  save(task: Task): Promise<void>;
}

export interface TeamRepository {
  getById(id: string): Promise<Team | null>;
}

export interface RegionRepository {
  getById(id: string): Promise<Region | null>;
}

export interface EventRepository {
  getById(id: string): Promise<Event | null>;
  save(event: Event): Promise<void>;
}

export interface FeedbackRepository {
  getById(id: string): Promise<Feedback | null>;
  save(feedback: Feedback): Promise<void>;
}

export interface ApprovalRepository {
  getById(id: string): Promise<Approval | null>;
  save(approval: Approval): Promise<void>;
}

export interface AgentRunRepository {
  getById(id: string): Promise<AgentRun | null>;
  save(run: AgentRun): Promise<void>;
}

export interface RepositoryBundle {
  issues: IssueRepository;
  assets: AssetRepository;
  briefs: BriefRepository;
  tasks: TaskRepository;
  teams: TeamRepository;
  regions: RegionRepository;
  events: EventRepository;
  feedback: FeedbackRepository;
  approvals: ApprovalRepository;
  agentRuns: AgentRunRepository;
  runInTransaction<T>(operation: () => Promise<T>): Promise<T>;
}
