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
  sentAt: Date | string;
  completedAt?: Date | string;
  assessmentLink: string;
  results?: Profile;
  isTrial?: boolean;
  confirmationSentAt?: Date | string;
}

export interface CompatibilityInsights {
  compatibilityScore: number;
  compatibilityLabel: 'High Alignment' | 'Balanced Blend' | 'Growth Opportunity';
  summary: string;
  sharedTraits: string[];
  complementaryDynamics: string[];
  alignmentHighlights: string[];
  potentialFriction: string[];
  conversationStarters: string[];
}

export interface FriendAssessmentShare {
  id: string;
  sharerId: string;
  sharerName: string;
  sharerEmail: string;
  relationship: string;
  recipientEmail: string;
  recipientName?: string;
  personalNote?: string;
  status: 'sent' | 'completed';
  sentAt: Date;
  completedAt?: Date;
  assessmentLink: string;
  sharerProfile: Profile;
  recipientProfile?: Profile;
  compatibility?: CompatibilityInsights;
}

export interface EmailNotification {
  to: string;
  subject: string;
  content: string;
  type:
    | 'assessment_invitation'
    | 'completion_notification'
    | 'internal_lead_alert'
    | 'advisor_share_confirmation';
}
