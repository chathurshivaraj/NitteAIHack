export enum View {
    Recruiter = 'Recruiter',
    Candidate = 'Candidate',
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

export interface AuditLogEntry {
    timestamp: string;
    action: string;
    details: string;
}

export interface CandidateAnalysis {
    summary: string;
    skills: string[];
    experienceYears: number;
    education: string[];
    fitScore: number;
}

export interface Candidate {
    id: string;
    name: string;
    email: string;
    role: string;
    status: CandidateStatus;
    appliedDate: string;
    analysis?: CandidateAnalysis;
    resumeText?: string;
    anonymizedResumeText?: string;
    recommendedAction?: string;
    actionJustification?: string;
    skillCheckScore?: number;
    auditLog: AuditLogEntry[];
}

export interface SkillQuestion {
    question: string;
    options: string[];
    correctAnswerIndex: number;
}

export interface LearningResource {
    title: string;
    url: string;
    type: string; // e.g., 'Article', 'Video', 'Course'
}

export interface LearningPath {
    skill: string;
    resources: LearningResource[];
}
