import { AdvisorAssessment, Profile } from '../types';
import { EmailService } from './emailService';
import { AuthService } from './authService';

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
      // Verify advisor is authenticated
      const currentAdvisor = await AuthService.getCurrentAdvisor();
      if (!currentAdvisor || currentAdvisor.email !== advisorEmail) {
        return { success: false, error: 'Unauthorized: Please log in again' };
      }

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
        throw new Error(`Assessment not found: ${assessmentId}`);
      }

      // Update assessment with results
      const updatedAssessment: AdvisorAssessment = {
        ...assessment,
        status: 'completed',
        completedAt: new Date(),
        results
      };

      this.saveAssessment(updatedAssessment);
      
      // Force a storage event to trigger dashboard refresh
      window.dispatchEvent(new StorageEvent('storage', {
        key: this.STORAGE_KEY,
        newValue: localStorage.getItem(this.STORAGE_KEY),
        storageArea: localStorage
      }));

      // Send completion notification to advisor
      try {
        await EmailService.sendCompletionNotification(
          assessment.advisorEmail,
          assessment.advisorName,
          assessment.clientEmail,
          assessment.clientName
        );
      } catch (emailError) {
        // Don't fail the whole completion if email fails
      }

      return true;
    } catch (error) {
      console.error('Error completing assessment:', error);
      return false;
    }
  }

  static getAssessment(assessmentId: string): AdvisorAssessment | null {
    try {
      const assessments = this.getAllAssessments();
      console.log('Looking for assessment ID:', assessmentId, 'in assessments:', assessments.map(a => a.id));
      return assessments.find(a => a.id === assessmentId) || null;
    } catch (error) {
      console.error('Error getting assessment:', error);
      return null;
    }
  }

  static getAllAssessments(): AdvisorAssessment[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const assessments = stored ? JSON.parse(stored) : [];
      console.log('getAllAssessments returning:', assessments);
      return assessments;
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
        console.log('Updated existing assessment at index:', existingIndex);
      } else {
        assessments.push(assessment);
        console.log('Added new assessment, total count:', assessments.length);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assessments));
      console.log('Saved assessments to localStorage:', assessments);
      
      // Verify the save worked
      const verified = localStorage.getItem(this.STORAGE_KEY);
      console.log('Verified localStorage content:', verified);
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  }

  static getAssessmentsForAdvisor(advisorEmail: string): AdvisorAssessment[] {
    try {
      const assessments = this.getAllAssessments();
      console.log('Getting assessments for advisor:', advisorEmail);
      console.log('All assessments:', assessments);
      const filtered = assessments.filter(a => a.advisorEmail === advisorEmail);
      console.log('Filtered assessments for advisor:', filtered);
      return filtered;
    } catch (error) {
      console.error('Error getting advisor assessments:', error);
      return [];
    }
  }
}