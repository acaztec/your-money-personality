import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      
      try {
        // Calculate profile
        const profile = calculateProfile(answers);
        
        // Generate AI advisor summary
        const advisorSummary = await generateAdvisorSummary(profile, answers);
        
        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(profile));
        localStorage.setItem('assessmentAnswers', JSON.stringify(answers));
        localStorage.setItem('advisorSummary', advisorSummary);
        
        // Navigate to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error completing assessment:', error);
        // Still navigate even if AI summary fails
        const profile = calculateProfile(answers);
        localStorage.setItem('userProfile', JSON.stringify(profile));
        localStorage.setItem('assessmentAnswers', JSON.stringify(answers));
        navigate('/dashboard');
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (isCompleting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-bounce mb-4">
            <div className="w-16 h-16 bg-primary-500 rounded-full mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Results</h2>
          <p className="text-gray-600">Please wait while we calculate your money personality...</p>
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

      {/* Assessment Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-center">
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
    </div>
  );
}