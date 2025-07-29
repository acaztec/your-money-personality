import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AssessmentCard from '../components/AssessmentCard';
import { calculateProfile } from '../utils/profileCalculator';
import { generateAdvisorSummary } from '../services/aiService';
import questionsData from '../data/questions.json';

export default function Assessment() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questionsData.length).fill(4));
  const [isCompleting, setIsCompleting] = useState(false);

  const handleAnswerChange = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = async () => {
    if (currentQuestion < questionsData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Complete assessment
      setIsCompleting(true);
      const profile = calculateProfile(answers);
      
      // Generate AI advisor summary
      const advisorSummary = await generateAdvisorSummary(profile, answers);
      
      localStorage.setItem('userProfile', JSON.stringify(profile));
      localStorage.setItem('assessmentAnswers', JSON.stringify(answers));
      localStorage.setItem('advisorSummary', advisorSummary);
      navigate('/dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (isCompleting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
        {/* Header */}
        <div className="bg-primary-600 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <img 
              src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png" 
              alt="iGrad Enrich" 
              className="h-8 w-auto"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Results</h2>
            <p className="text-gray-600">Creating your personalized financial wellness plan...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Header */}
      <div className="bg-primary-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <img 
            src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png" 
            alt="iGrad Enrich" 
            className="h-8 w-auto"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <AssessmentCard
          question={questionsData[currentQuestion]}
          questionNumber={currentQuestion + 1}
          totalQuestions={questionsData.length}
          value={answers[currentQuestion]}
          onChange={handleAnswerChange}
          onNext={handleNext}
          onPrevious={handlePrevious}
          canGoNext={true}
          canGoPrevious={currentQuestion > 0}
        />
      </div>
    </div>
  );
}