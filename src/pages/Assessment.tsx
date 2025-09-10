import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AssessmentCard from '../components/AssessmentCard';
import { calculateProfile } from '../utils/profileCalculator';
import { generateAdvisorSummary } from '../services/aiService';
import { AssessmentService } from '../services/assessmentService';
import { Brain, Sparkles } from 'lucide-react';
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
      setIsCompleting(true);
      
      try {
        const profile = calculateProfile(answers);
        
        if (advisorAssessmentId) {
          await AssessmentService.completeAssessment(advisorAssessmentId, profile);
        }
        
        let advisorSummary = '';
        if (!advisorAssessmentId) {
          advisorSummary = await generateAdvisorSummary(profile, answers);
        }
        
        localStorage.setItem('userProfile', JSON.stringify(profile));
        localStorage.setItem('assessmentAnswers', JSON.stringify(answers));
        if (advisorSummary) {
          localStorage.setItem('advisorSummary', advisorSummary);
        }
        
        navigate('/dashboard');
      } catch (error) {
        console.error('Error completing assessment:', error);
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
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="modern-card text-center space-y-6 max-w-md">
          <div className="w-20 h-20 mx-auto morph-shape bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Brain className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Analyzing Your Results</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            Our AI is processing your responses and creating your personalized money personality profile...
          </p>
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-primary-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      {/* Floating particles background */}
      <div className="particles-bg">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 25}s`,
              animationDuration: `${20 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="professional-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <img 
              src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png" 
              alt="iGrad Enrich" 
              className="h-10 w-auto static-element"
            />
            {advisorInfo && (
              <div className="flex items-center space-x-2 text-white">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Shared by {advisorInfo.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advisor Welcome Banner */}
      {advisorInfo && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <p className="text-blue-800 font-medium leading-relaxed">
                <strong>{advisorInfo.name}</strong> has invited you to discover your Money Personality! 
                This assessment will help them understand your financial behaviors and provide 
                more personalized guidance tailored to your unique personality.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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