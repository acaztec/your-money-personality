export interface Question {
  id: number;
  text: string;
}

export interface Profile {
  emotions: number;
  outlook: number;
  focus: number;
  influence: number;
  riskTolerance: number;
  personalities: string[];
  personalityScores?: { [key: string]: number };
  descriptions?: string[];
  percentages?: number[];
  personalityData?: any;
}

export interface Tool {
  id: string;
  title: string;
  description: string;
  category: string;
  personalities: string[];
}

export interface Course {
  id: string;
  title: string;
  duration: string;
  category: string;
  personalities: string[];
  recommended?: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface AdvisorAssessment {
  id: string;
  advisorName: string;
  advisorEmail: string;
  clientEmail: string;
  clientName?: string;
  status: 'sent' | 'completed' | 'viewed';
  sentAt: Date;
  completedAt?: Date;
  assessmentLink: string;
  results?: Profile;
}

export interface EmailNotification {
  to: string;
  subject: string;
  content: string;
  type: 'assessment_invitation' | 'completion_notification';
}