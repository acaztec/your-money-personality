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
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 leading-relaxed">
            {question}
          </h2>

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
    </div>
  );
}