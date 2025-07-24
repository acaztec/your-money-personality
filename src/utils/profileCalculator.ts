import { Profile } from '../types';

export function calculateProfile(answers: number[]): Profile {
  // Emotion-related questions (anxiety, worry, panic)
  const emotionQuestions = [6, 7, 8, 15, 31, 32]; // 0-indexed
  const emotionScore = emotionQuestions.reduce((sum, idx) => sum + answers[idx], 0) / emotionQuestions.length;

  // Outlook-related questions (future planning, optimism)
  const outlookQuestions = [1, 2, 16, 19, 20, 38]; // 0-indexed
  const outlookScore = outlookQuestions.reduce((sum, idx) => sum + answers[idx], 0) / outlookQuestions.length;

  // Focus-related questions (planning, organization, goals)
  const focusQuestions = [3, 4, 5, 33, 34, 35]; // 0-indexed
  const focusScore = focusQuestions.reduce((sum, idx) => sum + answers[idx], 0) / focusQuestions.length;

  // Influence-related questions (independence, advice-seeking)
  const influenceQuestions = [24, 27, 28, 29, 30]; // 0-indexed
  const influenceScore = influenceQuestions.reduce((sum, idx) => sum + answers[idx], 0) / influenceQuestions.length;

  // Risk tolerance questions (spending, gambling, adventure)
  const riskQuestions = [12, 13, 14, 18, 21, 22, 36, 37, 39, 40, 41]; // 0-indexed
  const riskScore = riskQuestions.reduce((sum, idx) => sum + answers[idx], 0) / riskQuestions.length;

  // Determine personality types based on scores
  const personalities: string[] = [];
  
  if (emotionScore <= 3) personalities.push('anxious');
  if (outlookScore >= 5) personalities.push('optimistic');
  if (focusScore >= 5) personalities.push('organized');
  if (influenceScore <= 3) personalities.push('independent');
  if (influenceScore >= 5) personalities.push('collaborative');
  if (riskScore >= 5) personalities.push('risk-taker');
  if (riskScore <= 3) personalities.push('cautious');
  if (focusScore >= 5 && outlookScore >= 5) personalities.push('ambitious');
  if (answers[25] >= 5 || answers[26] >= 5) personalities.push('family-focused');

  // Ensure at least one personality type
  if (personalities.length === 0) {
    personalities.push('balanced');
  }

  return {
    emotions: Math.round((emotionScore / 7) * 100),
    outlook: Math.round((outlookScore / 7) * 100),
    focus: Math.round((focusScore / 7) * 100),
    influence: Math.round((influenceScore / 7) * 100),
    riskTolerance: Math.round((riskScore / 7) * 100),
    personalities
  };
}