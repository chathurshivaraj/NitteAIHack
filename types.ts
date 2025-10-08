export enum View {
  Recruiter = 'recruiter',
  Candidate = 'candidate',
}

export enum CandidateStatus {
  New = 'New',
  SkillCheckPending = 'Skill Check Pending',
  SkillCheckCompleted = 'Skill Check Completed',
  Shortlisted = 'Shortlisted',
  Interviewing = 'Interviewing',
  Hired = 'Hired',
  Rejected = 'Rejected',
}

export interface WorkHistoryEntry {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  industry?: string;
}

export interface CandidateAnalysis {
  summary: string;
  skills: string[];
  experienceYears: number;
  education: string[];
  fitScore: number; // Score out of 10
  workHistory: WorkHistoryEntry[];
}

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  details: string;
}

export interface SkillCheckDetails {
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  status: CandidateStatus;
  appliedDate: string;
  analysis: CandidateAnalysis | null;
  resumeText?: string;
  resumeImages?: { mimeType: string; data: string }[];
  anonymizedResumeText?: string;
  recommendedAction: string | null;
  actionJustification: string | null;
  auditLog: AuditLogEntry[];
  skillCheckScore?: number;
  skillCheckDetails?: SkillCheckDetails;
}

export interface CompanyPerk {
  icon: string;
  title: string;
  description: string;
}
