import { Profile } from '../types';

// Load CSV data - this would be parsed from the actual CSV files
const PERSONALITY_SCORING: { [key: number]: { category: string; scoring: string; personality: string } } = {
  1: { category: 'Spending', scoring: 'Reverse', personality: 'Spontaneous' },
  2: { category: 'Planning', scoring: 'Reverse', personality: 'Pessimistic' },
  3: { category: 'Planning', scoring: 'Reverse', personality: 'Pessimistic' },
  4: { category: 'Saving', scoring: 'Normal', personality: 'Organized' },
  5: { category: 'Saving', scoring: 'Normal', personality: 'Organized' },
  6: { category: 'Planning', scoring: 'Normal', personality: 'Organized' },
  7: { category: 'Emotions', scoring: 'Normal', personality: 'Anxious' },
  8: { category: 'Emotions', scoring: 'Normal', personality: 'Anxious' },
  9: { category: 'Emotions', scoring: 'Normal', personality: 'Anxious' },
  10: { category: 'Spending', scoring: 'Normal', personality: 'Cautious' },
  11: { category: 'Debt', scoring: 'Normal', personality: 'Cautious' },
  12: { category: 'Spending', scoring: 'Normal', personality: 'Cautious' },
  13: { category: 'Spending', scoring: 'Reverse', personality: 'Spontaneous' },
  14: { category: 'Decision', scoring: 'Reverse', personality: 'Spontaneous' },
  15: { category: 'Spending', scoring: 'Reverse', personality: 'Spontaneous' },
  16: { category: 'Emotions', scoring: 'Normal', personality: 'Anxious' },
  17: { category: 'Outlook', scoring: 'Normal', personality: 'Pessimistic' },
  18: { category: 'Trust', scoring: 'Normal', personality: 'Cautious' },
  19: { category: 'Risk', scoring: 'Normal', personality: 'Risk-Taker' },
  20: { category: 'Resilience', scoring: 'Reverse', personality: 'Optimistic' },
  21: { category: 'Security', scoring: 'Reverse', personality: 'Optimistic' },
  22: { category: 'Insurance', scoring: 'Normal', personality: 'Risk-Taker' },
  23: { category: 'Gambling', scoring: 'Normal', personality: 'Risk-Taker' },
  24: { category: 'Confidence', scoring: 'Normal', personality: 'Risk-Taker' },
  25: { category: 'Advice', scoring: 'Normal', personality: 'Collaborative' },
  26: { category: 'Generosity', scoring: 'Normal', personality: 'Family-Focused' },
  27: { category: 'Social', scoring: 'Normal', personality: 'Family-Focused' },
  28: { category: 'Independence', scoring: 'Reverse', personality: 'Independent' },
  29: { category: 'Independence', scoring: 'Reverse', personality: 'Independent' },
  30: { category: 'Independence', scoring: 'Reverse', personality: 'Independent' },
  31: { category: 'Dependence', scoring: 'Normal', personality: 'Collaborative' },
  32: { category: 'Avoidance', scoring: 'Normal', personality: 'Anxious' },
  33: { category: 'Avoidance', scoring: 'Normal', personality: 'Anxious' },
  34: { category: 'Organization', scoring: 'Reverse', personality: 'Organized' },
  35: { category: 'Organization', scoring: 'Reverse', personality: 'Organized' },
  36: { category: 'Organization', scoring: 'Reverse', personality: 'Organized' },
  37: { category: 'Risk', scoring: 'Normal', personality: 'Risk-Taker' },
  38: { category: 'Personality', scoring: 'Normal', personality: 'Risk-Taker' },
  39: { category: 'Adventure', scoring: 'Normal', personality: 'Risk-Taker' },
  40: { category: 'Philosophy', scoring: 'Normal', personality: 'Risk-Taker' },
  41: { category: 'Emotional', scoring: 'Normal', personality: 'Spontaneous' },
  42: { category: 'Credit', scoring: 'Normal', personality: 'Risk-Taker' }
};

// Personality descriptions for hardcoded responses
const PERSONALITY_DESCRIPTIONS = {
  'Anxious': 'Tends to worry about financial decisions and feels stressed about money matters',
  'Cautious': 'Prefers conservative financial approaches and avoids unnecessary risks',
  'Organized': 'Maintains structured financial habits and plans ahead systematically',
  'Spontaneous': 'Makes quick financial decisions and enjoys spending in the moment',
  'Optimistic': 'Has a positive outlook on financial future and resilient mindset',
  'Pessimistic': 'Tends to expect negative financial outcomes and focuses on present concerns',
  'Risk-Taker': 'Comfortable with financial risks and seeks adventure in money decisions',
  'Independent': 'Prefers making financial decisions alone without outside input',
  'Collaborative': 'Values input from others when making financial decisions',
  'Family-Focused': 'Prioritizes spending on relationships and social connections'
};

export function calculateProfile(answers: number[]): Profile {
  // Calculate personality scores based on spreadsheet algorithm
  const personalityScores: { [key: string]: number } = {};
  
  answers.forEach((answer, index) => {
    const questionNum = index + 1;
    const scoring = PERSONALITY_SCORING[questionNum];
    
    if (scoring) {
      const { personality, scoring: scoringType } = scoring;
      
      // Apply scoring logic (Normal = higher score = more of that personality, Reverse = lower score = more)
      let score = scoringType === 'Reverse' ? (8 - answer) : answer;
      
      if (!personalityScores[personality]) {
        personalityScores[personality] = 0;
      }
      personalityScores[personality] += score;
    }
  });
  
  // Calculate average scores for each personality type
  const personalityCounts: { [key: string]: number } = {};
  Object.values(PERSONALITY_SCORING).forEach(({ personality }) => {
    personalityCounts[personality] = (personalityCounts[personality] || 0) + 1;
  });
  
  Object.keys(personalityScores).forEach(personality => {
    personalityScores[personality] = personalityScores[personality] / personalityCounts[personality];
  });
  
  // Sort personalities by score and select top ones
  const sortedPersonalities = Object.entries(personalityScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3) // Take top 3 personality types
    .map(([personality]) => personality);

  return {
    emotions: 0, // Not used in new system
    outlook: 0,  // Not used in new system
    focus: 0,    // Not used in new system
    influence: 0, // Not used in new system
    riskTolerance: 0, // Not used in new system
    personalities: sortedPersonalities,
    personalityScores,
    descriptions: sortedPersonalities.map(p => PERSONALITY_DESCRIPTIONS[p] || '')
  };
}