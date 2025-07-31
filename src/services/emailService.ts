import { EmailNotification } from '../types';

export class EmailService {
  static async sendAssessmentInvitation(
    advisorName: string,
    advisorEmail: string,
    clientEmail: string,
    assessmentLink: string,
    clientName?: string
  ): Promise<boolean> {
    try {
      const clientDisplayName = clientName || 'there';
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Money Personality <onboarding@resend.dev>',
          to: [clientEmail],
          subject: `${advisorName} is asking you to discover your Money Personality!`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://media-cdn.igrad.com/IMAGE/Logos/Color/iGradEnrich.png" alt="iGrad Enrich" style="height: 40px;">
            </div>
            
            <h2 style="color: #2563eb; text-align: center;">Discover Your Money Personality</h2>
            
            <p>Hi ${clientDisplayName},</p>
            
            <p><strong>${advisorName}</strong> has invited you to take the Money Personality assessment to better understand your financial behaviors and decision-making patterns.</p>
            
            <p>This scientifically-designed assessment takes about 10 minutes and will help ${advisorName} provide you with more personalized financial guidance.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${assessmentLink}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Take Assessment Now
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              This assessment is completely confidential and your results will only be shared with ${advisorName} to help them better serve your financial needs.
            </p>
            
            <p style="font-size: 14px; color: #666;">
              If you have any questions, please contact ${advisorName} at ${advisorEmail}.
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              This email was sent by iGrad Enrich Money Personality Assessment
            </p>
          </div>
          `,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Email API error:', response.status, errorText);
        return false;
      }

      const data = await response.json();
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
      const clientDisplayName = clientName || 'Your client';
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Money Personality <onboarding@resend.dev>',
          to: [advisorEmail],
          subject: `Money Personality Assessment Completed${clientName ? ` - ${clientName}` : ''}`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://media-cdn.igrad.com/IMAGE/Logos/Color/iGradEnrich.png" alt="iGrad Enrich" style="height: 40px;">
            </div>
            
            <h2 style="color: #22c55e; text-align: center;">Assessment Completed! ✅</h2>
            
            <p>Hi ${advisorName},</p>
            
            <p><strong>${clientDisplayName}</strong> (${clientEmail}) has completed their Money Personality assessment!</p>
            
            <p>You can now access their detailed results, including:</p>
            <ul>
              <li>Complete personality profile across 5 dimensions</li>
              <li>Behavioral strengths and challenges</li>
              <li>Personalized action plans</li>
              <li>AI-powered advisor recommendations</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${window.location.origin}/advisor-portal" style="background-color: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                View Results
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              Use these insights to provide more personalized financial guidance and build stronger client relationships.
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              This email was sent by iGrad Enrich Money Personality Assessment
            </p>
          </div>
          `,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Email API error:', response.status, errorText);
        return false;
      }

      const data = await response.json();
      return true;
    } catch (error) {
      console.error('Error sending completion notification:', error);
      return false;
    }
  }
}