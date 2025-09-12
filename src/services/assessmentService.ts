import { AdvisorAssessment, Profile } from '../types';
import { EmailService } from './emailService';

export class AssessmentService {
  private static readonly STORAGE_KEY = 'advisor_assessments';

  static generateAssessmentId(): string {
    return 'assess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  static generateAssessmentLink(assessmentId: string): string {
    return `${window.location.origin}/assessment?advisor=${assessmentId}`;
  }

  static async shareAssessment(
    advisorName: string,
    advisorEmail: string,
    clientEmail: string,
    clientName?: string
  ): Promise<{ success: boolean; assessmentId?: string; error?: string }> {
    try {
      const assessmentId = this.generateAssessmentId();
      const assessmentLink = this.generateAssessmentLink(assessmentId);

      const assessment: AdvisorAssessment = {
        id: assessmentId,
        advisorName,
        advisorEmail,
        clientEmail,
        clientName,
        status: 'sent',
        sentAt: new Date(),
        assessmentLink
      };

      // Save assessment to storage
      this.saveAssessment(assessment);

      // Send email invitation
      const emailSent = await EmailService.sendAssessmentInvitation(
        advisorName,
        advisorEmail,
        clientEmail,
        clientName,
        assessmentLink
      );

      if (!emailSent) {
        throw new Error('Failed to send email invitation');
      }

      return { success: true, assessmentId };
    } catch (error) {
      console.error('Error sharing assessment:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  static async completeAssessment(
    assessmentId: string,
    results: Profile
  ): Promise<boolean> {
    try {
      const assessment = this.getAssessment(assessmentId);
      if (!assessment) {
        throw new Error('Assessment not found');
      }

      // Update assessment with results
      const updatedAssessment: AdvisorAssessment = {
        ...assessment,
        status: 'completed',
        completedAt: new Date(),
        results
      };

      this.saveAssessment(updatedAssessment);

      // Send completion notification to advisor
      await EmailService.sendCompletionNotification(
        assessment.advisorEmail,
        assessment.advisorName,
        assessment.clientEmail,
        assessment.clientName
      );

      return true;
    } catch (error) {
      console.error('Error completing assessment:', error);
      return false;
    }
  }

  static getAssessment(assessmentId: string): AdvisorAssessment | null {
    try {
      const assessments = this.getAllAssessments();
      return assessments.find(a => a.id === assessmentId) || null;
    } catch (error) {
      console.error('Error getting assessment:', error);
      return null;
    }
  }

  static getAllAssessments(): AdvisorAssessment[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting assessments:', error);
      return [];
    }
  }

  static saveAssessment(assessment: AdvisorAssessment): void {
    try {
      const assessments = this.getAllAssessments();
      const existingIndex = assessments.findIndex(a => a.id === assessment.id);
      
      if (existingIndex >= 0) {
        assessments[existingIndex] = assessment;
      } else {
        assessments.push(assessment);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assessments));
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  }

  static getAssessmentsForAdvisor(advisorEmail: string): AdvisorAssessment[] {
    try {
      const assessments = this.getAllAssessments();
      return assessments.filter(a => a.advisorEmail === advisorEmail);
    } catch (error) {
      console.error('Error getting advisor assessments:', error);
      return [];
    }
  }
}