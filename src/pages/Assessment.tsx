import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AssessmentCard from '../components/AssessmentCard';
import { calculateProfile } from '../utils/profileCalculator';
import { generateAdvisorSummary } from '../services/aiService';
import { AssessmentService } from '../services/assessmentService';
import questionsData from '../data/questions.json';

export default function Assessment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questionsData.length).fill(4));
  const [isCompleting, setIsCompleting] = useState(false);
  const [advisorAssessmentId, setAdvisorAssessmentId] = useState<string | null>(null);
  const [advisorInfo, setAdvisorInfo] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Check if this is an advisor-shared assessment
    const advisorId = searchParams.get('advisor');
    if (advisorId) {
      const assessment = AssessmentService.getAssessment(advisorId);
      if (assessment) {
        setAdvisorAssessmentId(advisorId);
        setAdvisorInfo({
          name: assessment.advisorName,
          email: assessment.advisorEmail
        });
      }
    }
  }, [searchParams]);

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
        
        // If this is an advisor assessment, complete it and notify advisor
        if (advisorAssessmentId) {
          await AssessmentService.completeAssessment(advisorAssessmentId, profile);
        }
        
        // Generate AI advisor summary (only for non-advisor assessments for now)
        let advisorSummary = '';
        if (!advisorAssessmentId) {
          advisorSummary = await generateAdvisorSummary(profile, answers);
        }
        
        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(profile));
        localStorage.setItem('assessmentAnswers', JSON.stringify(answers));
        if (advisorSummary) {
          localStorage.setItem('advisorSummary', advisorSummary);
        }
        
        // Navigate to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error completing assessment:', error);
        // Still navigate even if something fails
        const profile = calculateProfile(answers);
        
        if (advisorAssessmentId) {
          await AssessmentService.completeAssessment(advisorAssessmentId, profile);
        }
        
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
          <div className="flex justify-between items-center">
            <img 
              src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png" 
              alt="iGrad Enrich" 
              className="h-8 w-auto"
            />
            {advisorInfo && (
              <div className="text-primary-100 text-sm">
                Shared by {advisorInfo.name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advisor Welcome Message */}
      {advisorInfo && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="text-center">
              <p className="text-blue-800">
                <strong>{advisorInfo.name}</strong> has invited you to discover your Money Personality! 
                This assessment will help them better understand your financial behaviors and provide more personalized guidance.
              </p>
            </div>
          </div>
        </div>
      )}

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