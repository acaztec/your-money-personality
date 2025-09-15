import { AdvisorAssessment, FriendAssessmentShare, Profile } from '../types';
import { EmailService } from './emailService';
import { AuthService } from './authService';
import { supabase } from '../lib/supabase';
import { getOrCreateUserId } from '../utils/userIdentity';
import { generateCompatibilityInsights } from '../utils/compatibilityInsights';

export class AssessmentService {
  private static readonly STORAGE_KEY = 'advisor_assessments';
  private static readonly FRIEND_STORAGE_KEY = 'friend_assessments';

  static generateAssessmentId(): string {
    return 'assess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  static generateAssessmentLink(assessmentId: string): string {
    return `${window.location.origin}/assessment?advisor=${assessmentId}`;
  }

  static generateFriendAssessmentId(): string {
    return 'friend_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  static generateFriendAssessmentLink(assessmentId: string): string {
    return `${window.location.origin}/assessment?share=${assessmentId}`;
  }

  static async shareAssessmentWithFriend(
    sharerName: string,
    sharerEmail: string,
    recipientEmail: string,
    relationship: string,
    sharerProfile: Profile,
    personalNote?: string,
    recipientName?: string
  ): Promise<{ success: boolean; shareId?: string; error?: string }> {
    try {
      if (!sharerProfile) {
        return { success: false, error: 'Your profile is required before sharing the assessment.' };
      }

      const sharerId = getOrCreateUserId();
      const shareId = this.generateFriendAssessmentId();
      const assessmentLink = this.generateFriendAssessmentLink(shareId);

      const share: FriendAssessmentShare = {
        id: shareId,
        sharerId,
        sharerName,
        sharerEmail,
        recipientEmail,
        recipientName,
        relationship,
        personalNote,
        status: 'sent',
        sentAt: new Date(),
        assessmentLink,
        sharerProfile
      };

      this.saveFriendAssessment(share);

      const emailSent = await EmailService.sendFriendAssessmentInvitation(
        sharerName,
        sharerEmail,
        recipientEmail,
        assessmentLink,
        relationship,
        personalNote
      );

      if (!emailSent) {
        throw new Error('Failed to send invitation email');
      }

      return { success: true, shareId };
    } catch (error) {
      console.error('Error sharing assessment with friend:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
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
      console.log('🔄 Starting assessment completion for ID:', assessmentId);
      
      const assessment = this.getAssessment(assessmentId);
      if (!assessment) {
        console.error('❌ Assessment not found:', assessmentId);
        throw new Error(`Assessment not found: ${assessmentId}`);
      }

      console.log('✅ Found assessment:', assessment);
      
      // Save results to Supabase database
      const assessmentAnswers = JSON.parse(localStorage.getItem('assessmentAnswers') || '[]');
      
      const { error: dbError } = await supabase
        .from('assessment_results')
        .insert({
          assessment_id: assessmentId,
          advisor_email: assessment.advisorEmail,
          client_email: assessment.clientEmail,
          client_name: assessment.clientName,
          answers: assessmentAnswers,
          profile: results
        });

      if (dbError) {
        console.error('❌ Failed to save assessment results to database:', dbError);
        throw new Error(`Failed to save results: ${dbError.message}`);
      }

      console.log('✅ Assessment results saved to database');
      
      // Update assessment with results
      const updatedAssessment: AdvisorAssessment = {
        ...assessment,
        status: 'completed',
        completedAt: new Date(),
        results
      };

      console.log('💾 Saving updated assessment:', updatedAssessment);
      this.saveAssessment(updatedAssessment);
      
      // Verify the save worked
      const savedAssessment = this.getAssessment(assessmentId);
      console.log('🔍 Verification - saved assessment:', savedAssessment);
      
      // Force a storage event to trigger dashboard refresh
      console.log('📡 Dispatching storage event for dashboard refresh');
      window.dispatchEvent(new StorageEvent('storage', {
        key: this.STORAGE_KEY,
        newValue: localStorage.getItem(this.STORAGE_KEY),
        storageArea: localStorage
      }));
      
      // Also dispatch a custom event for same-window updates
      window.dispatchEvent(new CustomEvent('localStorageUpdate'));

      // Send completion notification to advisor
      try {
        console.log('📧 Sending completion notification to advisor:', assessment.advisorEmail);
        await EmailService.sendCompletionNotification(
          assessment.advisorEmail,
          assessment.advisorName,
          assessment.clientEmail,
          assessment.clientName
        );
        console.log('✅ Email notification sent successfully');
      } catch (emailError) {
        console.error('❌ Email notification failed (but continuing):', emailError);
        // Don't fail the whole completion if email fails
      }

      console.log('🎉 Assessment completion successful');
      return true;
    } catch (error) {
      console.error('Error completing assessment:', error);
      return false;
    }
  }

  static async completeFriendAssessment(
    assessmentId: string,
    results: Profile
  ): Promise<boolean> {
    try {
      const share = this.getFriendAssessment(assessmentId);
      if (!share) {
        throw new Error('Shared assessment not found');
      }

      const compatibility = generateCompatibilityInsights(share.sharerProfile, results);

      const updatedShare: FriendAssessmentShare = {
        ...share,
        status: 'completed',
        completedAt: new Date(),
        recipientProfile: results,
        compatibility
      };

      this.saveFriendAssessment(updatedShare);

      window.dispatchEvent(new StorageEvent('storage', {
        key: this.FRIEND_STORAGE_KEY,
        newValue: localStorage.getItem(this.FRIEND_STORAGE_KEY),
        storageArea: localStorage
      }));
      window.dispatchEvent(new CustomEvent('localStorageUpdate'));

      try {
        await EmailService.sendFriendCompletionNotification(
          share.sharerEmail,
          share.sharerName,
          share.recipientEmail,
          compatibility
        );
      } catch (error) {
        console.error('Error sending friend completion notification:', error);
      }

      return true;
    } catch (error) {
      console.error('Error completing friend assessment:', error);
      return false;
    }
  }

  static async getAssessmentResultsForAdvisor(advisorEmail: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('advisor_email', advisorEmail)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching assessment results:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting assessment results for advisor:', error);
      return [];
    }
  }

  static async getAssessmentResult(assessmentId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('assessment_id', assessmentId)
        .single();

      if (error) {
        console.error('Error fetching assessment result:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting assessment result:', error);
      return null;
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

  private static getAllFriendAssessments(): FriendAssessmentShare[] {
    try {
      const stored = localStorage.getItem(this.FRIEND_STORAGE_KEY);
      const assessments = stored ? JSON.parse(stored) : [];
      return assessments.map((assessment: FriendAssessmentShare) => ({
        ...assessment,
        sentAt: assessment.sentAt ? new Date(assessment.sentAt) : undefined,
        completedAt: assessment.completedAt ? new Date(assessment.completedAt) : undefined
      }));
    } catch (error) {
      console.error('Error getting friend assessments:', error);
      return [];
    }
  }

  static saveAssessment(assessment: AdvisorAssessment): void {
    try {
      const assessments = this.getAllAssessments();
      const existingIndex = assessments.findIndex(a => a.id === assessment.id);
      
      if (existingIndex >= 0) {
        assessments[existingIndex] = assessment;
        console.log('📝 Updated existing assessment at index:', existingIndex, assessment);
      } else {
        assessments.push(assessment);
        console.log('➕ Added new assessment, total count:', assessments.length, assessment);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assessments));
      console.log('💾 Saved assessments to localStorage - total:', assessments.length);
      
      // Verify the save worked
      const verified = localStorage.getItem(this.STORAGE_KEY);
      if (verified) {
        const parsedVerification = JSON.parse(verified);
        console.log('✅ Save verification successful - count:', parsedVerification.length);
      } else {
        console.error('❌ Save verification failed - no data in localStorage');
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  }

  private static saveFriendAssessment(assessment: FriendAssessmentShare): void {
    try {
      const assessments = this.getAllFriendAssessments();
      const existingIndex = assessments.findIndex(a => a.id === assessment.id);

      if (existingIndex >= 0) {
        assessments[existingIndex] = assessment;
      } else {
        assessments.push(assessment);
      }

      localStorage.setItem(this.FRIEND_STORAGE_KEY, JSON.stringify(assessments));
    } catch (error) {
      console.error('Error saving friend assessment:', error);
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

  static getFriendAssessmentsForUser(): FriendAssessmentShare[] {
    try {
      const sharerId = getOrCreateUserId();
      const assessments = this.getAllFriendAssessments();
      return assessments.filter(a => a.sharerId === sharerId);
    } catch (error) {
      console.error('Error getting friend assessments for user:', error);
      return [];
    }
  }

  static getFriendAssessment(assessmentId: string): FriendAssessmentShare | null {
    try {
      const assessments = this.getAllFriendAssessments();
      return assessments.find(a => a.id === assessmentId) || null;
    } catch (error) {
      console.error('Error getting friend assessment:', error);
      return null;
    }
  }
}
