import { Profile } from '../types';

const AZURE_ENDPOINT = 'https://mcpbackendai.openai.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview';
const AZURE_KEY = '37IFUAn8JDo4Y9pD8P1jQwq9UCRR8eMvTcZVFA9vyEhJWNibRSvdJQQJ99BGACYeBjFXJ3w3AAABACOGHT7I';

export async function sendChatMessage(message: string, profile: Profile | null): Promise<string> {
  try {
    const systemPrompt = profile 
      ? `You are a financial wellness coach. The user has completed a money personality assessment with these results:
         - Emotional Management: ${profile.emotions}%
         - Future Outlook: ${profile.outlook}%
         - Financial Focus: ${profile.focus}%
         - Decision Influence: ${profile.influence}%
         - Risk Tolerance: ${profile.riskTolerance}%
         - Personality Types: ${profile.personalities.join(', ')}
         
         Provide personalized financial advice based on their personality profile. Be supportive, professional, and actionable.`
      : 'You are a financial wellness coach. Provide helpful, professional financial advice.';

    const response = await fetch(AZURE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_KEY,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your request.';
  } catch (error) {
    console.error('AI Service Error:', error);
    return 'I apologize, but I\'m currently unable to process your request. Please try again later.';
  }
}