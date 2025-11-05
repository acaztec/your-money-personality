import { Profile } from '../types';
import questionsData from '../data/questions.json';
import { QUESTION_CATEGORIES } from '../utils/profileCalculator';

const AZURE_ENDPOINT = 'https://mcpbackendai.openai.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview';
const AZURE_KEY = '37IFUAn8JDo4Y9pD8P1jQwq9UCRR8eMvTcZVFA9vyEhJWNibRSvdJQQJ99BGACYeBjFXJ3w3AAABACOGHT7I';

const DEFAULT_SCALE_MIN = 1;
const DEFAULT_SCALE_MAX = 7;
const DEFAULT_MIDPOINT = (DEFAULT_SCALE_MIN + DEFAULT_SCALE_MAX) / 2;

type IntensityMethod = 'midpoint_distance' | 'z_score';
type IntensityLabel = 'High' | 'Moderate' | 'Low';

interface AssessmentQuestionMetadata {
  id?: string | number;
  text?: string;
  category?: string;
  scale_min?: number;
  scale_max?: number;
  reverse_scored?: boolean;
  importance_weight?: number;
  norm_mean?: number;
  norm_sd?: number;
}

interface AssessmentMetadata {
  questions: AssessmentQuestionMetadata[];
}

interface PersonalityInsightBenchmark {
  trait: string;
  stat_text: string;
  percentage?: number;
  sample_n?: number;
  source_title?: string;
  source_id?: string;
}

interface BenchmarksPayload {
  personality_insights?: PersonalityInsightBenchmark[];
  question_insights?: Record<string, unknown>[];
}

interface PartnerCaseStudy {
  partner_name: string;
  finding_text: string;
  applicability_note?: string;
}

interface AdvisorContext {
  advisor_preferences?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AdvisorSummaryOptions {
  benchmarks?: BenchmarksPayload | null;
  caseStudy?: PartnerCaseStudy | null;
  advisorContext?: AdvisorContext | null;
  assessmentMetadata?: AssessmentMetadata | null;
}

interface ComputedSignal {
  question_id: string;
  question_index: number;
  question_text: string;
  category: string;
  client_score: number;
  adjusted_score: number;
  scale_min: number;
  scale_max: number;
  midpoint: number;
  intensity_method: IntensityMethod;
  intensity_score: number;
  intensity_label: IntensityLabel;
  intensity_weight: number;
  z_score?: number;
  norm_mean?: number;
  norm_sd?: number;
  distance_from_midpoint: number;
  rank: number;
}

interface IntensityContext {
  method_summary: string;
  scale_min: number;
  scale_max: number;
  midpoint: number;
  thresholds: {
    high: number;
    low: number;
  };
  has_norms: boolean;
  percentile_basis: string;
  weights_applied: boolean;
}

interface PersonalitySummary {
  name: string;
  category: string;
  description: string;
  strengths: string[];
  challenges: string[];
}

interface CategoryStat {
  category: string;
  sum: number | null;
  question_count: number;
  average: number | null;
  rank: number;
}

const DEFAULT_QUESTION_METADATA: AssessmentQuestionMetadata[] = questionsData.map((text, index) => ({
  id: `Q${index + 1}`,
  text,
  category: QUESTION_CATEGORIES[index + 1] ?? 'General',
  scale_min: DEFAULT_SCALE_MIN,
  scale_max: DEFAULT_SCALE_MAX,
  reverse_scored: false,
  importance_weight: 1,
}));

const CATEGORY_QUESTION_COUNT = Object.values(QUESTION_CATEGORIES).reduce<Record<string, number>>((acc, category) => {
  acc[category] = (acc[category] ?? 0) + 1;
  return acc;
}, {});

const PERSONALITY_CATEGORY_MAP: Record<string, string> = {
  'Future Focused': 'Focus',
  'Present Focused': 'Focus',
  'Apprehensive': 'Emotions',
  'Cautious': 'Emotions',
  'Relaxed': 'Emotions',
  'Optimistic': 'Outlook',
  'Confident': 'Outlook',
  'Skeptical': 'Outlook',
  'Social': 'Influence',
  'Independent': 'Influence',
  'Elusive': 'Influence',
  'Change Seeking': 'Bonus',
  'Fun Seeking': 'Bonus',
  'Organized': 'Bonus',
};

export async function generateAdvisorSummary(
  profile: Profile,
  assessmentAnswers: number[],
  options: AdvisorSummaryOptions = {}
): Promise<string> {
  try {
    const questionMetadata = buildQuestionMetadata(assessmentAnswers, options.assessmentMetadata);
    const { topSignals, intensityContext } = computeAssessmentSignals(assessmentAnswers, questionMetadata);
    const personalitySummaries = buildPersonalitySummaries(profile);
    const categoryStats = buildCategoryStats(profile.personalityScores);
    const scoreDistribution = buildScoreDistribution(assessmentAnswers);

    const promptData = {
      profile: {
        personalities: profile.personalities ?? [],
        summaries: personalitySummaries,
        category_scores: categoryStats,
      },
      assessment: {
        total_items: assessmentAnswers.length,
        score_distribution: scoreDistribution,
        top_signals: topSignals.map(signal => ({
          id: signal.question_id,
          question_index: signal.question_index,
          text: signal.question_text,
          category: signal.category,
          client_score: Number(signal.client_score.toFixed(2)),
          adjusted_score: Number(signal.adjusted_score.toFixed(2)),
          scale_min: signal.scale_min,
          scale_max: signal.scale_max,
          intensity_method: signal.intensity_method,
          intensity_score: Number(signal.intensity_score.toFixed(3)),
          intensity_label: signal.intensity_label,
          intensity_weight: Number(signal.intensity_weight.toFixed(2)),
          distance_from_midpoint: Number(signal.distance_from_midpoint.toFixed(3)),
          z_score: signal.z_score != null ? Number(signal.z_score.toFixed(3)) : undefined,
          norm_mean: signal.norm_mean,
          norm_sd: signal.norm_sd,
          rank: signal.rank,
        })),
        intensity_context: intensityContext,
      },
      benchmarks: options.benchmarks ?? null,
      case_study: options.caseStudy ?? null,
      advisor_context: options.advisorContext ?? null,
    };

    const systemPrompt = buildSystemPrompt(promptData);

    const response = await fetch(AZURE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_KEY,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Produce the advisor briefing now following the specification.' },
        ],
        max_tokens: 1600,
        temperature: 0.3,
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

function buildSystemPrompt(promptData: Record<string, unknown>): string {
  const instructions = [
    'Role: You are an AI assistant producing a professional, evidence-based briefing for a financial advisor based on the client\'s Your Money Personality (YMP) assessment.',
    'Use only the data supplied in the JSON block. Never invent statistics, sources, or partners.',
    '',
    'DATA:',
    JSON.stringify(promptData, null, 2),
    '',
    'OUTPUT REQUIREMENTS:',
    '- Produce a 350-550 word markdown briefing that follows this exact section order with level-2 headings:',
    '  1. Advisor Insights Summary',
    '  2. Strongest Signals (from assessment)',
    '  3. Personality Tendencies & Benchmarks',
    '  4. Risks & Conversation Starters',
    '  5. Advisor Actions (prioritized)',
    '  6. Recommended Financial Tools & Strategies',
    '  7. Communication Tips',
    '  8. Client Conversation Highlights',
    '- In "Advisor Insights Summary" synthesize the most decision-ready takeaways in 2-3 crisp bullet sentences, calling out the top and bottom category averages from profile.category_scores with their numeric values when available and explaining how the personality mix reinforces or complicates those results.',
    '- In "Strongest Signals" create a markdown table with columns: Item | Client | Intensity | Why it matters | Advisor move. Each row must cite the exact question text in quotes, show the client score as {score}/{scale_max}, state the intensity label and method (midpoint vs z-score), explain the planning implication in one sentence, and offer one concrete advisor action or question.',
    '- Order the "Strongest Signals" table by the provided rank so the highest-intensity items appear first.',
    '- Ground every insight in evidence by referencing question ids (e.g., Q8) or categories from assessment.top_signals, or cite personality benchmarks exactly as provided. No speculative claims.',
    '- For "Personality Tendencies & Benchmarks", if benchmarks.personality_insights exist, quote their percentages and sample sizes verbatim from the data; otherwise rely on profile.summaries descriptions and note they are qualitative.',
    '- In "Risks & Conversation Starters" deliver 2-4 bullet risks in concise professional language and 2-4 conversation starters that use advisor-centric framing (e.g., "Explore...", "Discuss...") while citing the supporting question ids or personality traits.',
    '- "Advisor Actions" must list actions under sub-bullets labeled Quick Win (0-2 wks), Next (1-3 mos), and Build (3-12 mos) with 1-2 specific items each, and each item should reference the relevant question id, category score, or benchmark stat that supports the recommendation.',
    '- In "Recommended Financial Tools & Strategies" suggest 3-4 planning or product ideas (e.g., portfolio mix, insurance, cash management tools) that logically fit the evidence, referencing the supporting scores or questions.',
    '- Provide 3-4 "Communication Tips" tied to the client\'s personalities and evidence in the data, keeping the guidance sharply actionable.',
    '- In "Client Conversation Highlights" replace generic strengths/weakness framing with 3-5 advisor-ready talking points to share with the client, each grounded in assessment data and framed as collaborative opportunities.',
    '- After Communication Tips (and before Client Conversation Highlights), include a bolded Case Point line only if case_study data is present, matching the format **Case Point (Partner): finding — applicability**.',
    '- Maintain a precise, professional tone. Avoid vague language, filler, or unsubstantiated hedging; every recommendation should connect back to a measurement in the data.',
    '- Respond in markdown only.'
  ];

  return instructions.join('\n');
}

function buildQuestionMetadata(
  assessmentAnswers: number[],
  assessmentMetadata?: AssessmentMetadata | null
): AssessmentQuestionMetadata[] {
  const provided = assessmentMetadata?.questions ?? [];

  return assessmentAnswers.map((_, index) => {
    const fallback = DEFAULT_QUESTION_METADATA[index] ?? {
      id: `Q${index + 1}`,
      text: `Question ${index + 1}`,
      category: 'General',
      scale_min: DEFAULT_SCALE_MIN,
      scale_max: DEFAULT_SCALE_MAX,
      reverse_scored: false,
      importance_weight: 1,
    };

    const metadata = provided[index];

    if (!metadata) {
      return fallback;
    }

    return {
      id: metadata.id ?? fallback.id,
      text: metadata.text ?? fallback.text,
      category: metadata.category ?? fallback.category,
      scale_min: metadata.scale_min ?? fallback.scale_min,
      scale_max: metadata.scale_max ?? fallback.scale_max,
      reverse_scored: metadata.reverse_scored ?? fallback.reverse_scored,
      importance_weight: metadata.importance_weight ?? fallback.importance_weight,
      norm_mean: metadata.norm_mean,
      norm_sd: metadata.norm_sd,
    };
  });
}

function computeAssessmentSignals(
  assessmentAnswers: number[],
  questionMetadata: AssessmentQuestionMetadata[]
): { topSignals: ComputedSignal[]; intensityContext: IntensityContext } {
  const signals = assessmentAnswers.map((score, index) => {
    const metadata = questionMetadata[index] ?? DEFAULT_QUESTION_METADATA[index] ?? {
      id: `Q${index + 1}`,
      text: `Question ${index + 1}`,
      category: 'General',
      scale_min: DEFAULT_SCALE_MIN,
      scale_max: DEFAULT_SCALE_MAX,
      reverse_scored: false,
      importance_weight: 1,
    };

    const scaleMin = metadata.scale_min ?? DEFAULT_SCALE_MIN;
    const scaleMax = metadata.scale_max ?? DEFAULT_SCALE_MAX;
    const midpoint = (scaleMin + scaleMax) / 2;
    const weight = metadata.importance_weight ?? 1;

    const safeScore = Number.isFinite(score) ? score : midpoint;
    const adjustedScore = metadata.reverse_scored ? scaleMin + scaleMax - safeScore : safeScore;
    const distanceFromMidpoint = Math.abs(adjustedScore - midpoint);

    let intensityMethod: IntensityMethod = 'midpoint_distance';
    let baseIntensity = distanceFromMidpoint;
    let zScoreValue: number | undefined;

    if (typeof metadata.norm_mean === 'number' && typeof metadata.norm_sd === 'number' && metadata.norm_sd > 0) {
      zScoreValue = (adjustedScore - metadata.norm_mean) / metadata.norm_sd;
      baseIntensity = Math.abs(zScoreValue);
      intensityMethod = 'z_score';
    }

    const intensityScore = baseIntensity * weight;

    return {
      question_id: String(metadata.id ?? `Q${index + 1}`),
      question_index: index + 1,
      question_text: metadata.text ?? `Question ${index + 1}`,
      category: metadata.category ?? 'General',
      client_score: safeScore,
      adjusted_score: adjustedScore,
      scale_min: scaleMin,
      scale_max: scaleMax,
      midpoint,
      intensity_method: intensityMethod,
      intensity_score: Number.isFinite(intensityScore) ? intensityScore : 0,
      intensity_label: 'Low' as IntensityLabel,
      intensity_weight: weight,
      z_score: zScoreValue,
      norm_mean: metadata.norm_mean,
      norm_sd: metadata.norm_sd,
      distance_from_midpoint: distanceFromMidpoint,
      rank: index + 1,
    } as ComputedSignal;
  });

  const intensityScores = signals
    .map(signal => signal.intensity_score)
    .filter(value => Number.isFinite(value)) as number[];

  const highThreshold = calculatePercentile(intensityScores, 0.75);
  const lowThreshold = calculatePercentile(intensityScores, 0.25);

  const signalsWithLabels = signals.map(signal => ({
    ...signal,
    intensity_label: deriveIntensityLabel(signal.intensity_score, highThreshold, lowThreshold),
  }));

  const sortedSignals = [...signalsWithLabels].sort((a, b) => {
    if (b.intensity_score === a.intensity_score) {
      return a.question_index - b.question_index;
    }
    return b.intensity_score - a.intensity_score;
  });

  const rankedSignals = sortedSignals.map((signal, index) => ({
    ...signal,
    rank: index + 1,
  }));

  const topSignals: ComputedSignal[] = [];
  let lastScore: number | null = null;

  for (const signal of rankedSignals) {
    if (topSignals.length < 3) {
      topSignals.push(signal);
      lastScore = signal.intensity_score;
      continue;
    }

    if (topSignals.length < 6 && signal.intensity_score > 0) {
      topSignals.push(signal);
      lastScore = signal.intensity_score;
      continue;
    }

    if (lastScore !== null && signal.intensity_score === lastScore && signal.intensity_score > 0) {
      topSignals.push(signal);
    }
  }

  if (topSignals.length === 0 && rankedSignals.length > 0) {
    topSignals.push(rankedSignals[0]);
  }

  const intensityContext: IntensityContext = {
    method_summary: buildMethodSummary(signalsWithLabels),
    scale_min: DEFAULT_SCALE_MIN,
    scale_max: DEFAULT_SCALE_MAX,
    midpoint: DEFAULT_MIDPOINT,
    thresholds: {
      high: Number(highThreshold.toFixed(2)),
      low: Number(lowThreshold.toFixed(2)),
    },
    has_norms: signalsWithLabels.some(signal => signal.intensity_method === 'z_score'),
    percentile_basis: 'Intensity scores ranked by percentile: High ≥ 75th percentile, Low ≤ 25th percentile after weighting.',
    weights_applied: signalsWithLabels.some(signal => signal.intensity_weight !== 1),
  };

  return { topSignals, intensityContext };
}

function calculatePercentile(values: number[], percentile: number): number {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * percentile;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function deriveIntensityLabel(score: number, highThreshold: number, lowThreshold: number): IntensityLabel {
  if (score >= highThreshold && score > 0) {
    return 'High';
  }

  if (score <= lowThreshold) {
    return 'Low';
  }

  return 'Moderate';
}

function buildMethodSummary(signals: ComputedSignal[]): string {
  const usesZScore = signals.some(signal => signal.intensity_method === 'z_score');
  const usesMidpoint = signals.some(signal => signal.intensity_method === 'midpoint_distance');
  const usesWeights = signals.some(signal => signal.intensity_weight !== 1);

  const parts: string[] = [];

  if (usesZScore && usesMidpoint) {
    parts.push('Used z-scores when norms existed; otherwise used absolute distance from the 1-7 midpoint.');
  } else if (usesZScore) {
    parts.push('All intensities use z-scores relative to provided norms.');
  } else if (usesMidpoint) {
    parts.push('All intensities use absolute distance from the 1-7 midpoint.');
  }

  if (usesWeights) {
    parts.push('Applied importance weights when supplied.');
  } else {
    parts.push('No additional weighting was applied.');
  }

  return parts.join(' ');
}

function buildPersonalitySummaries(profile: Profile): PersonalitySummary[] {
  const personalities = profile.personalities ?? [];
  const personalityData = Array.isArray(profile.personalityData) ? profile.personalityData : [];
  const descriptions = profile.descriptions ?? [];

  return personalities.map((name, index) => {
    const data = personalityData[index] ?? {};
    const rawDescription = (data as { description?: string }).description ?? descriptions[index] ?? '';
    const strengths = Array.isArray((data as { strengths?: string[] }).strengths)
      ? ((data as { strengths?: string[] }).strengths as string[]).slice(0, 2)
      : [];
    const challenges = Array.isArray((data as { challenges?: string[] }).challenges)
      ? ((data as { challenges?: string[] }).challenges as string[]).slice(0, 2)
      : [];

    return {
      name,
      category: PERSONALITY_CATEGORY_MAP[name] ?? 'General',
      description: truncateText(rawDescription),
      strengths,
      challenges,
    };
  });
}

function buildCategoryStats(scores?: { [key: string]: number }): CategoryStat[] {
  if (!scores) {
    return [];
  }

  const stats = Object.entries(scores).map(([category, sum]) => {
    const questionCount = CATEGORY_QUESTION_COUNT[category] ?? 0;
    const average = questionCount ? sum / questionCount : null;

    return {
      category,
      sum: typeof sum === 'number' ? Number(sum.toFixed(2)) : null,
      question_count: questionCount,
      average: average != null ? Number(average.toFixed(2)) : null,
      rank: 0,
    };
  });

  stats.sort((a, b) => {
    if (b.average === a.average) {
      return a.category.localeCompare(b.category);
    }
    return (b.average ?? 0) - (a.average ?? 0);
  });

  return stats.map((stat, index) => ({
    ...stat,
    rank: index + 1,
  }));
}

function buildScoreDistribution(answers: number[]): Record<string, number> {
  return answers.reduce<Record<string, number>>((acc, score) => {
    if (Number.isFinite(score)) {
      const key = String(score);
      acc[key] = (acc[key] ?? 0) + 1;
    } else {
      acc.unknown = (acc.unknown ?? 0) + 1;
    }
    return acc;
  }, {});
}

function truncateText(text?: string, maxLength = 320): string {
  if (!text) {
    return '';
  }

  const normalized = text.replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const truncated = normalized.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');

  if (lastPeriod > maxLength * 0.5) {
    return truncated.slice(0, lastPeriod + 1).trim();
  }

  return `${truncated.trim()}…`;
}
