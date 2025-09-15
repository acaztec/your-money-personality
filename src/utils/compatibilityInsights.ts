import { CompatibilityInsights, Profile } from '../types';

const CATEGORY_DETAILS: Record<string, {
  label: string;
  conversationStarter: string;
  bandLanguage: { high: string; medium: string; low: string };
}> = {
  Focus: {
    label: 'Financial Focus',
    conversationStarter: 'Decide how much structure versus spontaneity you both need in your monthly spending plan.',
    bandLanguage: {
      high: 'structure-loving planners',
      medium: 'balanced planners',
      low: 'spontaneous spenders'
    }
  },
  Emotions: {
    label: 'Emotional Relationship with Money',
    conversationStarter: 'Share the money situations that bring you the most stress and what helps you feel supported.',
    bandLanguage: {
      high: 'deep feelers who track every dollar',
      medium: 'steady navigators',
      low: 'easygoing optimists'
    }
  },
  Outlook: {
    label: 'Financial Outlook',
    conversationStarter: 'Set aside time to dream about long-term goals and compare what “security” means to each of you.',
    bandLanguage: {
      high: 'big-picture optimists',
      medium: 'practical realists',
      low: 'healthy skeptics'
    }
  },
  Influence: {
    label: 'Decision-Making Style',
    conversationStarter: 'Discuss who you turn to for financial advice and how comfortable you are making solo decisions.',
    bandLanguage: {
      high: 'collaborative decision-makers',
      medium: 'selectively social planners',
      low: 'independent navigators'
    }
  },
  Bonus: {
    label: 'Lifestyle & Change Orientation',
    conversationStarter: 'Agree on how often you want to try something new versus keep to proven routines with money.',
    bandLanguage: {
      high: 'change-seeking adventurers',
      medium: 'flexible explorers',
      low: 'steady traditionalists'
    }
  }
};

const CATEGORY_ORDER = ['Focus', 'Emotions', 'Outlook', 'Influence', 'Bonus'];

function getBand(score: number | undefined): 'low' | 'medium' | 'high' {
  if (typeof score !== 'number') {
    return 'medium';
  }

  if (score >= 45) {
    return 'high';
  }

  if (score >= 32) {
    return 'medium';
  }

  return 'low';
}

function getCompatibilityLabel(score: number): CompatibilityInsights['compatibilityLabel'] {
  if (score >= 70) {
    return 'High Alignment';
  }

  if (score >= 45) {
    return 'Balanced Blend';
  }

  return 'Growth Opportunity';
}

function buildTraitList(traits: string[]): string {
  if (traits.length === 0) {
    return '';
  }

  if (traits.length === 1) {
    return traits[0];
  }

  if (traits.length === 2) {
    return `${traits[0]} and ${traits[1]}`;
  }

  return `${traits.slice(0, -1).join(', ')}, and ${traits[traits.length - 1]}`;
}

export function generateCompatibilityInsights(
  primaryProfile: Profile,
  partnerProfile: Profile
): CompatibilityInsights {
  const primaryScores = primaryProfile.personalityScores || {};
  const partnerScores = partnerProfile.personalityScores || {};

  const sharedTraits = Array.from(
    new Set(
      primaryProfile.personalities.filter((trait) => partnerProfile.personalities.includes(trait))
    )
  );

  const complementaryDynamics: string[] = [];
  const alignmentHighlights: string[] = [];
  const potentialFriction: string[] = [];
  const conversationStarters: string[] = [];

  let totalDifference = 0;

  CATEGORY_ORDER.forEach((categoryKey) => {
    const categoryDetail = CATEGORY_DETAILS[categoryKey];
    const primaryScore = primaryScores[categoryKey as keyof typeof primaryScores] as number | undefined;
    const partnerScore = partnerScores[categoryKey as keyof typeof partnerScores] as number | undefined;
    const primaryBand = getBand(primaryScore);
    const partnerBand = getBand(partnerScore);

    const primaryBandLabel = categoryDetail.bandLanguage[primaryBand];
    const partnerBandLabel = categoryDetail.bandLanguage[partnerBand];

    const scoreDiff = Math.abs((primaryScore || 0) - (partnerScore || 0));
    totalDifference += scoreDiff;

    const bandGap = Math.abs(['low', 'medium', 'high'].indexOf(primaryBand) - ['low', 'medium', 'high'].indexOf(partnerBand));

    if (bandGap === 0) {
      alignmentHighlights.push(
        `You both operate as ${primaryBandLabel} when it comes to ${categoryDetail.label.toLowerCase()}, keeping decisions feeling natural for each other.`
      );
    } else if (bandGap === 1) {
      complementaryDynamics.push(
        `${categoryDetail.label}: You naturally show up as ${primaryBandLabel}, while your partner brings ${partnerBandLabel}, giving you a healthy mix of structure and flexibility.`
      );
      conversationStarters.push(categoryDetail.conversationStarter);
    } else {
      potentialFriction.push(
        `${categoryDetail.label} styles are quite different—one of you shows up as ${primaryBandLabel} while the other is more of a ${partnerBandLabel}. Create shared guardrails so both styles feel respected.`
      );
      conversationStarters.push(categoryDetail.conversationStarter);
    }
  });

  const maxDifferencePerCategory = 54; // (7-1) * 9 questions
  const compatibilityScore = Math.max(
    5,
    Math.min(100, Math.round(100 - (totalDifference / (CATEGORY_ORDER.length * maxDifferencePerCategory)) * 100))
  );
  const compatibilityLabel = getCompatibilityLabel(compatibilityScore);

  const summaryParts: string[] = [];
  summaryParts.push(
    `Your Money Personalities create a ${compatibilityLabel.toLowerCase()} dynamic with a compatibility score of ${compatibilityScore}.`
  );

  if (sharedTraits.length > 0) {
    summaryParts.push(`You both strongly identify with ${buildTraitList(sharedTraits)}, giving you common ground to build from.`);
  }

  if (alignmentHighlights.length > 0) {
    summaryParts.push('Several core money habits line up naturally, helping day-to-day coordination feel easier.');
  }

  if (potentialFriction.length > 0) {
    summaryParts.push('There are also a few areas where you will benefit from intentional conversations to avoid frustration.');
  }

  const summary = summaryParts.join(' ');

  return {
    compatibilityScore,
    compatibilityLabel,
    summary,
    sharedTraits,
    complementaryDynamics,
    alignmentHighlights,
    potentialFriction,
    conversationStarters: Array.from(new Set(conversationStarters)).slice(0, 5)
  };
}
