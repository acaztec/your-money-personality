interface AssessmentCardProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  value: number;
  onChange: (value: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

const likertScale = [1, 2, 3, 4, 5, 6, 7];

const getCheckpointMessage = (questionNumber: number, totalQuestions: number) => {
  if (questionNumber === Math.floor(totalQuestions * 0.25)) {
    return 'You\'ve completed the spending behavior section—great momentum.';
  }
  if (questionNumber === Math.floor(totalQuestions * 0.5)) {
    return 'Halfway there. Planning and goal-setting insights are taking shape.';
  }
  if (questionNumber === Math.floor(totalQuestions * 0.75)) {
    return 'Only a few more to go. Decision-making patterns are almost complete.';
  }
  if (questionNumber === totalQuestions - 2) {
    return 'Final stretch. Stay focused on your instinctive reactions.';
  }
  return null;
};

export default function AssessmentCard({
  question,
  questionNumber,
  totalQuestions,
  value,
  onChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
}: AssessmentCardProps) {
  const progressPercentage = (questionNumber / totalQuestions) * 100;
  const checkpointMessage = getCheckpointMessage(questionNumber, totalQuestions);

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-neutral-600">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="font-semibold text-primary-700">{Math.round(progressPercentage)}% complete</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 sm:max-w-xs">
          <div className="progress-bar h-2" style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-8 sm:p-12 shadow-subtle space-y-10">
        <h2 className="text-2xl sm:text-3xl font-semibold leading-tight text-center text-ink">
          {question}
        </h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            <span>Not at all</span>
            <span>Very well</span>
          </div>
          <div className="grid grid-cols-7 gap-3 sm:gap-4">
            {likertScale.map((option) => (
              <button
                key={option}
                type="button"
                aria-label={`Response ${option}`}
                aria-pressed={value === option}
                className={`likert-option ${value === option ? 'active' : ''}`}
                onClick={() => onChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-neutral-600">
            Your current selection: <span className="font-semibold text-primary-700">{value}</span>
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline-none ${
              canGoPrevious
                ? 'border border-neutral-300 text-neutral-700 hover:border-primary-400 hover:text-primary-700'
                : 'border border-neutral-200 text-neutral-400 cursor-not-allowed bg-neutral-100'
            }`}
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className={`inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white transition focus-visible:outline-none ${
              canGoNext
                ? 'bg-accent-600 hover:bg-accent-700'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            }`}
          >
            {questionNumber === totalQuestions ? 'Complete assessment' : 'Next question'}
          </button>
        </div>
      </div>

      {checkpointMessage && (
        <div className="mt-6 rounded-2xl border-l-4 border-primary-500 bg-white/70 p-6 text-sm text-neutral-700 shadow-subtle">
          {checkpointMessage}
        </div>
      )}
    </div>
  );
}
