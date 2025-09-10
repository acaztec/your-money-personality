import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

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
    return "Excellent progress! You've completed the spending behavior section.";
  } else if (questionNumber === Math.floor(totalQuestions * 0.5)) {
    return "Halfway there! Planning and goal-setting analysis complete.";
  } else if (questionNumber === Math.floor(totalQuestions * 0.75)) {
    return "Almost finished! Decision-making patterns analyzed.";
  } else if (questionNumber === totalQuestions - 3) {
    return "Final stretch! Just a few more questions to go.";
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
  const progressPercentage = (questionNumber / totalQuestions) * 100;

  return (
    <div className="w-full max-w-3xl">
      {/* Progress Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center text-sm font-medium text-gray-600 mb-4">
          <span className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-primary-600" />
            <span>Question {questionNumber} of {totalQuestions}</span>
          </span>
          <span className="stat-number text-lg font-bold">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="progress-bar h-3 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="modern-card space-y-8">
        {/* Question Display */}
        <div className="min-h-[120px] flex items-center justify-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center leading-relaxed">
            {question}
          </h2>
        </div>

        {/* Response Scale */}
        <div className="space-y-6">
          <div className="flex justify-between text-sm font-medium text-gray-600 px-2">
            <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full">
              Not at all
            </span>
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">
              Very well
            </span>
          </div>
          
          {/* Custom Slider */}
          <div className="relative px-2">
            <input
              type="range"
              min="1"
              max="7"
              value={value}
              onChange={(e) => onChange(parseInt(e.target.value))}
              className="custom-slider w-full"
            />
            
            {/* Scale markers */}
            <div className="flex justify-between text-xs text-gray-500 mt-3 px-1">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <div key={num} className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full mb-1 transition-colors duration-200 ${
                    value === num 
                      ? 'bg-gradient-to-r from-primary-600 to-accent-600' 
                      : 'bg-gray-300'
                  }`} />
                  <span className={`font-medium transition-colors duration-200 ${
                    value === num ? 'text-primary-600' : 'text-gray-400'
                  }`}>
                    {num}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Current value display */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-accent-50 px-4 py-2 rounded-full border border-primary-200/50">
              <span className="text-sm text-gray-600">Your response:</span>
              <span className="stat-number text-xl font-bold">{value}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              canGoPrevious
                ? 'btn-secondary hover:scale-105'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <button
            onClick={onNext}
            disabled={!canGoNext}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              canGoNext
                ? 'btn-primary hover:scale-105 group'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>{questionNumber === totalQuestions ? 'Complete Assessment' : 'Next Question'}</span>
            <ChevronRight className={`w-5 h-5 ${canGoNext ? 'group-hover:translate-x-1' : ''} transition-transform`} />
          </button>
        </div>
      </div>

      {/* Checkpoint Message */}
      {checkpointMessage && (
        <div className="mt-6 modern-card border-l-4 border-gradient-to-b from-primary-500 to-accent-500">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full animate-pulse" />
            </div>
            <p className="text-gray-800 font-medium leading-relaxed">
              {checkpointMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}