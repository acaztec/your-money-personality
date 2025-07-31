import { EmailNotification } from '../types';

// Mock email service - in production this would integrate with SendGrid, AWS SES, etc.
export class EmailService {
  static async sendAssessmentInvitation(
    advisorName: string,
    advisorEmail: string,
    clientEmail: string,
    assessmentLink: string
  ): Promise<boolean> {
    try {
      // Mock email sending - in production would use actual email service
      const emailData: EmailNotification = {
        to: clientEmail,
        subject: `${advisorName} is asking you to discover your Money Personality!`,
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #2563eb; padding: 20px; text-align: center;">
              <img src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png" alt="iGrad Enrich" style="height: 40px;">
            </div>
            
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Discover Your Money Personality!</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Hi there!
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                <strong>${advisorName}</strong> has invited you to take the Money Personality assessment. 
                This comprehensive evaluation will help you understand your financial behaviors and decision-making patterns.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                The assessment takes about 10 minutes to complete and has been taken by over 500,000 people worldwide.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${assessmentLink}" 
                   style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  Take Assessment Now
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">
                This assessment was sent by ${advisorName} (${advisorEmail}). 
                If you have any questions, please contact them directly.
              </p>
            </div>
            
            <div style="background: #e5e7eb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
              © 2025 iGrad Enrich. All rights reserved.
            </div>
          </div>
        `,
        type: 'assessment_invitation'
      };

      console.log('Mock Email Sent:', emailData);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Error sending assessment invitation:', error);
      return false;
    }
  }

  static async sendCompletionNotification(
    advisorEmail: string,
    advisorName: string,
    clientEmail: string,
    clientName?: string
  ): Promise<boolean> {
    try {
      const emailData: EmailNotification = {
        to: advisorEmail,
        subject: `Money Personality Assessment Completed${clientName ? ` - ${clientName}` : ''}`,
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #2563eb; padding: 20px; text-align: center;">
              <img src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png" alt="iGrad Enrich" style="height: 40px;">
            </div>
            
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Assessment Completed!</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Hi ${advisorName},
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Great news! Your client${clientName ? ` ${clientName}` : ''} (${clientEmail}) has completed their Money Personality assessment.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                The results are now available for your review. You can access detailed insights about their financial personality, 
                behavioral patterns, and recommendations for how to best work with them.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}/advisor-portal" 
                   style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  View Results
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">
                Log into your advisor portal to access the full analysis and AI-powered insights.
              </p>
            </div>
            
            <div style="background: #e5e7eb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
              © 2025 iGrad Enrich. All rights reserved.
            </div>
          </div>
        `,
        type: 'completion_notification'
      };

      console.log('Mock Completion Email Sent:', emailData);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Error sending completion notification:', error);
      return false;
    }
  }
}