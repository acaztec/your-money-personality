import { Profile } from '../types';

// Personality type definitions with scoring thresholds
const PERSONALITY_DEFINITIONS = {
  // Emotional Management personalities
  anxious: { category: 'emotions', threshold: 3, direction: 'below' },
  calm: { category: 'emotions', threshold: 5, direction: 'above' },
  
  // Future Outlook personalities  
  optimistic: { category: 'outlook', threshold: 5, direction: 'above' },
  pessimistic: { category: 'outlook', threshold: 3, direction: 'below' },
  
  // Financial Focus personalities
  organized: { category: 'focus', threshold: 5, direction: 'above' },
  spontaneous: { category: 'focus', threshold: 3, direction: 'below' },
  
  // Decision Influence personalities
  independent: { category: 'influence', threshold: 3, direction: 'below' },
  collaborative: { category: 'influence', threshold: 5, direction: 'above' },
  
  // Risk Tolerance personalities
  'risk-taker': { category: 'riskTolerance', threshold: 5, direction: 'above' },
  cautious: { category: 'riskTolerance', threshold: 3, direction: 'below' },
  
  // Composite personalities (require multiple criteria)
  ambitious: { 
    composite: true, 
    criteria: [
      { category: 'focus', threshold: 5, direction: 'above' },
      { category: 'outlook', threshold: 5, direction: 'above' }
    ]
  },
  'family-focused': {
    composite: true,
    criteria: [
      { questionIndex: 25, threshold: 5, direction: 'above' }, // enjoys buying gifts
      { questionIndex: 26, threshold: 5, direction: 'above' }  // spends on family/friends
    ]
  }
};

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
  
  // Calculate percentage scores for each category
  const categoryScores = {
    emotions: Math.round((emotionScore / 7) * 100),
    outlook: Math.round((outlookScore / 7) * 100),
    focus: Math.round((focusScore / 7) * 100),
    influence: Math.round((influenceScore / 7) * 100),
    riskTolerance: Math.round((riskScore / 7) * 100)
  };

  // Step 1: Calculate personality scores for each type
  const personalityScores: { [key: string]: number } = {};
  
  Object.entries(PERSONALITY_DEFINITIONS).forEach(([personalityType, definition]) => {
    if (definition.composite) {
      // Handle composite personalities
      let meetsAllCriteria = true;
      let totalScore = 0;
      
      definition.criteria.forEach(criterion => {
        let score: number;
        
        if ('questionIndex' in criterion) {
          // Direct question-based criterion
          score = answers[criterion.questionIndex];
        } else {
          // Category-based criterion
          const rawScore = {
            emotions: emotionScore,
            outlook: outlookScore,
            focus: focusScore,
            influence: influenceScore,
            riskTolerance: riskScore
          }[criterion.category];
          score = rawScore;
        }
        
        const meetsCriterion = criterion.direction === 'above' 
          ? score >= criterion.threshold 
          : score <= criterion.threshold;
          
        if (!meetsCriterion) {
          meetsAllCriteria = false;
        }
        totalScore += score;
      });
      
      if (meetsAllCriteria) {
        personalityScores[personalityType] = totalScore / definition.criteria.length;
      }
    } else {
      // Handle simple personalities
      const rawScore = {
        emotions: emotionScore,
        outlook: outlookScore,
        focus: focusScore,
        influence: influenceScore,
        riskTolerance: riskScore
      }[definition.category];
      
      const meetsThreshold = definition.direction === 'above' 
        ? rawScore >= definition.threshold 
        : rawScore <= definition.threshold;
        
      if (meetsThreshold) {
        personalityScores[personalityType] = rawScore;
      }
    }
  });
  
  // Step 2: Group personalities by category and rank within each group
  const personalityGroups: { [category: string]: Array<{ type: string, score: number }> } = {
    emotions: [],
    outlook: [],
    focus: [],
    influence: [],
    riskTolerance: [],
    composite: []
  };
  
  Object.entries(personalityScores).forEach(([type, score]) => {
    const definition = PERSONALITY_DEFINITIONS[type];
    const category = definition.composite ? 'composite' : definition.category;
    personalityGroups[category].push({ type, score });
  });
  
  // Sort each group by score (descending)
  Object.keys(personalityGroups).forEach(category => {
    personalityGroups[category].sort((a, b) => b.score - a.score);
  });
  
  // Step 3: Select top 2 matches per personality category
  const selectedPersonalities: string[] = [];
  
  Object.values(personalityGroups).forEach(group => {
    // Take up to 2 top-ranking personalities from each group
    const topPersonalities = group.slice(0, 2);
    selectedPersonalities.push(...topPersonalities.map(p => p.type));
  });

  // Ensure at least one personality type
  if (selectedPersonalities.length === 0) {
    selectedPersonalities.push('balanced');
  }

  return {
    emotions: categoryScores.emotions,
    outlook: categoryScores.outlook,
    focus: categoryScores.focus,
    influence: categoryScores.influence,
    riskTolerance: categoryScores.riskTolerance,
    personalities: selectedPersonalities
  };
}