
export enum UserRole {
  CITIZEN = 'citizen',
  ADMIN = 'admin'
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

export enum Sentiment {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative'
}

export interface StatusHistoryEntry {
  timestamp: number;
  status: ReportStatus;
  actor: string;
}

export interface User {
  username: string;
  password?: string;
  email?: string;
  phone?: string;
  role: UserRole;
  createdAt: number;
}

export interface CivicReport {
  id: string;
  reporter: string;
  title: string;
  description: string;
  category: string;
  department: string;
  sentiment: Sentiment;
  status: ReportStatus;
  location: {
    lat?: number;
    lng?: number;
    address?: string;
    locality?: string;
  };
  image?: string;
  createdAt: number;
  aiInsights?: string;
  history: StatusHistoryEntry[];
}
