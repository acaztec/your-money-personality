import { ChevronLeft, ChevronRight } from 'lucide-react';

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

const getCheckpointMessage = (questionNumber: number, totalQuestions: number) => {
  const progress = questionNumber / totalQuestions;
  
  if (questionNumber === Math.floor(totalQuestions * 0.25)) {
    return "Great start! You've completed the first section on spending habits.";
  } else if (questionNumber === Math.floor(totalQuestions * 0.5)) {
    return "Halfway there! You just finished the planning and goal-setting section.";
  } else if (questionNumber === Math.floor(totalQuestions * 0.75)) {
    return "Almost done! You've completed the decision-making and risk assessment section.";
  } else if (questionNumber === totalQuestions - 3) {
    return "Final stretch! Just a few more questions about your financial attitudes.";
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
  const checkpointMessage = getCheckpointMessage(questionNumber, totalQuestions);

  return (
    <div className="w-full max-w-2xl">
      {/* Checkpoint Message */}
      {checkpointMessage && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-blue-800 font-medium">{checkpointMessage}</p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {questionNumber} of {totalQuestions}</span>
          <span>{Math.round((questionNumber / totalQuestions) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="card mb-8">
        <div className="h-32 flex items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 leading-relaxed">
          {question}
          </h2>
        </div>

        {/* Slider */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>Not at all</span>
            <span>Very well</span>
          </div>
          <input
            type="range"
            min="1"
            max="7"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="slider-track w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <span key={num} className={value === num ? 'text-primary-600 font-medium' : ''}>
                {num}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              canGoPrevious
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={onNext}
            disabled={!canGoNext}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              canGoNext
                ? 'btn-primary'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>{questionNumber === totalQuestions ? 'Complete' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}