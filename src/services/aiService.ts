import { Profile } from '../types';
import toolsData from '../data/tools.json';
import coursesData from '../data/courses.json';

const AZURE_ENDPOINT = 'https://mcpbackendai.openai.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview';
const AZURE_KEY = '37IFUAn8JDo4Y9pD8P1jQwq9UCRR8eMvTcZVFA9vyEhJWNibRSvdJQQJ99BGACYeBjFXJ3w3AAABACOGHT7I';

export async function generatePersonalizedRecommendations(profile: Profile, assessmentAnswers: number[]): Promise<{
  tools: Array<{id: string, title: string, description: string, explanation: string}>,
  courses: Array<{id: string, title: string, duration: string, explanation: string}>
}> {
  try {
    const systemPrompt = `You are a financial wellness expert. Based on the user's money personality assessment results, recommend 3-4 tools and 3-4 courses from the provided lists.

User Profile:
- Emotional Management: ${profile.emotions}%
- Future Outlook: ${profile.outlook}%
- Financial Focus: ${profile.focus}%
- Decision Influence: ${profile.influence}%
- Risk Tolerance: ${profile.riskTolerance}%
- Personality Types: ${profile.personalities.join(', ')}

Available Tools: ${JSON.stringify(toolsData)}
Available Courses: ${JSON.stringify(coursesData)}

Respond with a JSON object containing:
{
  "tools": [{"id": "tool-id", "title": "Tool Title", "description": "Tool Description", "explanation": "Why this tool is perfect for this user's personality"}],
  "courses": [{"id": "course-id", "title": "Course Title", "duration": "Duration", "explanation": "Why this course matches their needs"}]
}

Focus on tools and courses that match their personality types and scores. Provide personalized explanations.`;

    const response = await fetch(AZURE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_KEY,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Please provide personalized recommendations based on my assessment results.' }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Fallback to basic recommendations
      return getFallbackRecommendations(profile);
    }
  } catch (error) {
    console.error('AI Recommendation Error:', error);
    return getFallbackRecommendations(profile);
  }
}

function getFallbackRecommendations(profile: Profile) {
  // Basic fallback logic
  const recommendedTools = toolsData
    .filter(tool => tool.personalities.includes('all') || 
            tool.personalities.some(p => profile.personalities.includes(p)))
    .slice(0, 4)
    .map(tool => ({
      ...tool,
      explanation: `This tool aligns with your ${profile.personalities.join(' and ')} personality traits.`
    }));

  const recommendedCourses = coursesData
    .filter(course => course.personalities.some(p => profile.personalities.includes(p)))
    .slice(0, 4)
    .map(course => ({
      ...course,
      explanation: `This course is tailored for your financial personality type.`
    }));

  return { tools: recommendedTools, courses: recommendedCourses };
}
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