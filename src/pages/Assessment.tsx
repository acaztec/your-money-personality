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
  const [friendAssessmentId, setFriendAssessmentId] = useState<string | null>(null);
  const [friendInfo, setFriendInfo] = useState<{
    sharerName: string;
    relationship: string;
    personalNote?: string;
  } | null>(null);

  useEffect(() => {
    const advisorId = searchParams.get('advisor');
    const friendId = searchParams.get('share');

    const loadAssessmentInfo = async () => {
      if (advisorId) {
        console.log('🔍 Looking up advisor assessment:', advisorId);
        
        // Try to get assessment from database first
        const assessment = await AssessmentService.getAssessmentFromDatabase(advisorId);
        if (assessment) {
          console.log('✅ Found assessment in database:', assessment);
          setAdvisorAssessmentId(advisorId);
          setAdvisorInfo({
            name: assessment.advisor_name,
            email: assessment.advisor_email
          });
        } else {
          console.log('❌ Assessment not found in database, checking localStorage...');
          // Fall back to localStorage for backward compatibility
          const localAssessment = AssessmentService.getAssessment(advisorId);
          if (localAssessment) {
            console.log('✅ Found assessment in localStorage:', localAssessment);
            setAdvisorAssessmentId(advisorId);
            setAdvisorInfo({
              name: localAssessment.advisorName,
              email: localAssessment.advisorEmail
            });
          } else {
            console.log('❌ Assessment not found anywhere');
          }
        }
      } else if (friendId) {
        const share = AssessmentService.getFriendAssessment(friendId);
        if (share) {
          setFriendAssessmentId(friendId);
          setFriendInfo({
            sharerName: share.sharerName,
            relationship: share.relationship,
            personalNote: share.personalNote
          });
        }
      }
    };

    loadAssessmentInfo();
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
        
        // ALWAYS save user profile first
        localStorage.setItem('userProfile', JSON.stringify(profile));
        localStorage.setItem('assessmentAnswers', JSON.stringify(answers));
        
        // If this is an advisor assessment, update the status
        if (advisorAssessmentId) {
          console.log('Completing advisor assessment:', advisorAssessmentId);
          const completed = await AssessmentService.completeAssessment(advisorAssessmentId, profile);

          if (!completed) {
            console.error('Failed to mark assessment as completed, but continuing...');
          }
        } else if (friendAssessmentId) {
          console.log('Completing shared assessment:', friendAssessmentId);
          const completed = await AssessmentService.completeFriendAssessment(friendAssessmentId, profile);

          if (!completed) {
            console.error('Failed to mark friend assessment as completed, but continuing...');
          }
        } else {
          console.log('No advisor or share ID - individual assessment');
        }

        // Generate advisor summary for non-advisor assessments
        let advisorSummary = '';
        if (!advisorAssessmentId && !friendAssessmentId) {
          console.log('Generating AI advisor summary...');
          advisorSummary = await generateAdvisorSummary(profile, answers);
          if (advisorSummary) {
            localStorage.setItem('advisorSummary', advisorSummary);
          }
        }
        
        // Small delay to ensure storage events fire
        setTimeout(() => navigate('/dashboard'), 100);
      } catch (error) {
        console.error('Assessment completion error:', error);
        // Fallback - still save user profile even if advisor notification fails
        const profile = calculateProfile(answers);        
        localStorage.setItem('userProfile', JSON.stringify(profile));
        localStorage.setItem('assessmentAnswers', JSON.stringify(answers));
        setTimeout(() => navigate('/dashboard'), 100);
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
    <div className="min-h-screen professional-bg">

      {/* Header */}
      <div className="professional-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <img
              src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png"
              alt="iGrad Enrich"
              className="h-10 w-auto static-element"
            />
            {(advisorInfo || friendInfo) && (
              <div className="flex items-center space-x-4">
                {advisorInfo && (
                  <div className="flex items-center space-x-2 text-white">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Shared by {advisorInfo.name}</span>
                  </div>
                )}
                {friendInfo && (
                  <div className="flex items-center space-x-2 text-white">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Partner invite from {friendInfo.sharerName}</span>
                  </div>
                )}
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

      {friendInfo && (
        <div className="bg-emerald-50 border-b border-emerald-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center space-y-2">
              <p className="text-emerald-900 font-medium leading-relaxed">
                <strong>{friendInfo.sharerName}</strong> invited you to take the Money Personality assessment so you can explore how your financial styles work together as {friendInfo.relationship.toLowerCase()}.
              </p>
              <p className="text-emerald-800 text-sm">
                Once you both finish, you'll unlock a compatibility breakdown with strengths, watch-outs, and suggested conversation starters.
              </p>
              {friendInfo.personalNote && (
                <p className="text-emerald-700 text-sm italic">{friendInfo.personalNote}</p>
              </p>
              )}
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