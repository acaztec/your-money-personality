import emailjs from '@emailjs/browser';
import { EmailNotification } from '../types';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_jpauwpv';
const EMAILJS_TEMPLATE_ID = 'template_p4jrkbh';
const EMAILJS_PUBLIC_KEY = 'jDm6RqfKyLpHaLSEX';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export class EmailService {
  static async sendAssessmentInvitation(
    advisorName: string,
    advisorEmail: string,
    clientEmail: string,
    assessmentLink: string,
    clientName?: string
  ): Promise<boolean> {
    try {
      const templateParams = {
        advisor_name: advisorName,
        advisor_email: advisorEmail,
        client_email: clientEmail,
        client_name: clientName || 'there',
        assessment_link: assessmentLink,
        to_email: clientEmail,
        subject: `${advisorName} is asking you to discover your Money Personality!`,
        message_type: 'invitation'
      };

      console.log('Sending assessment invitation with params:', templateParams);

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('EmailJS Response:', response);
      return response.status === 200;
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
      const templateParams = {
        advisor_name: advisorName,
        advisor_email: advisorEmail,
        client_email: clientEmail,
        client_name: clientName || 'Your client',
        assessment_link: `${window.location.origin}/advisor-portal`,
        to_email: advisorEmail,
        subject: `Money Personality Assessment Completed${clientName ? ` - ${clientName}` : ''}`,
        message_type: 'completion'
      };

      console.log('Sending completion notification with params:', templateParams);

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('EmailJS Response:', response);
      return response.status === 200;
    } catch (error) {
      console.error('Error sending completion notification:', error);
      return false;
    }
  }
}