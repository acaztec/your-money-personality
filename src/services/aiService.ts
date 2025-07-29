import { Profile } from '../types';
import toolsData from '../data/tools.json';
import coursesData from '../data/courses.json';

const AZURE_ENDPOINT = 'https://mcpbackendai.openai.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview';
const AZURE_KEY = '37IFUAn8JDo4Y9pD8P1jQwq9UCRR8eMvTcZVFA9vyEhJWNibRSvdJQQJ99BGACYeBjFXJ3w3AAABACOGHT7I';

export async function generateAdvisorSummary(profile: Profile, assessmentAnswers: number[]): Promise<string> {
  try {
    const systemPrompt = `You are a financial advisor assistant. Based on the client's money personality assessment results, provide a professional summary that would be helpful for a financial advisor to understand their client better.

Client Profile:
- Primary Personality Types: ${profile.personalities.join(', ')}
- Personality Descriptions: ${profile.descriptions?.join('; ') || ''}

Assessment Responses: ${assessmentAnswers.join(', ')}

Provide a concise professional summary (2-3 paragraphs) that highlights:
1. Key personality traits and financial behaviors
2. Potential challenges or concerns to be aware of
3. Recommended communication and advisory approaches
4. Areas where this client might need extra support or guidance

Write this as a professional advisor briefing.`;

   const response = await fetch(AZURE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_KEY,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Please provide an advisor summary for this client.' }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Unable to generate advisor summary at this time.';
  } catch (error) {
    console.error('AI Advisor Summary Error:', error);
    return 'This is a prototype - AI advisor summary would appear here in the final version.';
  }
}