import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AssessmentCard from '../components/AssessmentCard';
import { calculateProfile } from '../utils/profileCalculator';
import { AssessmentService } from '../services/assessmentService';
import questionsData from '../data/questions.json';

export default function Assessment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questionsData.length).fill(0));
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
        const assessment = await AssessmentService.getAssessmentFromDatabase(advisorId);
        if (assessment) {
          setAdvisorAssessmentId(advisorId);
          setAdvisorInfo({
            name: assessment.advisor_name,
            email: assessment.advisor_email,
          });
        } else {
          const localAssessment = AssessmentService.getAssessment(advisorId);
          if (localAssessment) {
            setAdvisorAssessmentId(advisorId);
            setAdvisorInfo({
              name: localAssessment.advisorName,
              email: localAssessment.advisorEmail,
            });
          }
        }
      } else if (friendId) {
        const share = AssessmentService.getFriendAssessment(friendId);
        if (share) {
          setFriendAssessmentId(friendId);
          setFriendInfo({
            sharerName: share.sharerName,
            relationship: share.relationship,
            personalNote: share.personalNote,
          });
        }
      }
    };

    loadAssessmentInfo();
  }, [searchParams]);

  const handleAnswerChange = (value: number) => {
    const nextAnswers = [...answers];
    nextAnswers[currentQuestion] = value;
    setAnswers(nextAnswers);
  };

  const handleNext = async () => {
    if (currentQuestion < questionsData.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      return;
    }

    setIsCompleting(true);

    try {
      const profile = calculateProfile(answers);
      localStorage.setItem('userProfile', JSON.stringify(profile));
      localStorage.setItem('assessmentAnswers', JSON.stringify(answers));

      if (advisorAssessmentId) {
        await AssessmentService.completeAssessment(advisorAssessmentId, profile);
      } else if (friendAssessmentId) {
        await AssessmentService.completeFriendAssessment(friendAssessmentId, profile);
      } else {
        localStorage.removeItem('advisorSummary');
      }

      setTimeout(() => navigate('/dashboard'), 120);
    } catch (error) {
      console.error('Assessment completion error:', error);
      const profile = calculateProfile(answers);
      localStorage.setItem('userProfile', JSON.stringify(profile));
      localStorage.setItem('assessmentAnswers', JSON.stringify(answers));
      setTimeout(() => navigate('/dashboard'), 120);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const exitToWelcome = () => {
    navigate('/');
  };

  if (isCompleting) {
    return (
      <div className="min-h-screen bg-canvas text-ink">
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-600">Wrapping up your assessment…</span>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center shadow-subtle space-y-6">
            <h1 className="text-3xl font-semibold text-ink">Analyzing your responses</h1>
            <p className="text-neutral-700">
              We’re translating your selections into a Money Personality profile and tailored guidance. This only takes a moment.
            </p>
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="h-3 w-3 rounded-full bg-primary-500 animate-pulse"
                  style={{ animationDelay: `${dot * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={exitToWelcome}
            className="text-sm font-semibold text-primary-700 hover:text-primary-500"
          >
            Exit to Enrich
          </button>
          <div className="hidden sm:flex items-center gap-4 text-sm text-neutral-600">
            <span>Question {currentQuestion + 1} of {questionsData.length}</span>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="progress-bar h-1.5"
                style={{ width: `${((currentQuestion + 1) / questionsData.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                currentQuestion === 0
                  ? 'border border-neutral-200 text-neutral-400 cursor-not-allowed bg-neutral-100'
                  : 'border border-neutral-300 text-neutral-700 hover:border-primary-400 hover:text-primary-700'
              }`}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
             disabled={answers[currentQuestion] === 0}
             className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition ${
               answers[currentQuestion] !== 0
                 ? 'bg-accent-600 text-white hover:bg-accent-700'
                 : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
             }`}
            >
              {currentQuestion === questionsData.length - 1 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </header>

      {advisorInfo && (
        <section className="border-b border-primary-200 bg-primary-100/60">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-primary-700 space-y-1">
            <p><strong>{advisorInfo.name}</strong> invited you to complete Your Money Personality assessment to personalize your next consultation.</p>
            <p className="text-neutral-600">Responses are shared securely with your advisor to tailor guidance.</p>
          </div>
        </section>
      )}

      {friendInfo && (
        <section className="border-b border-accent-600/40 bg-accent-600/10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-neutral-700 space-y-2">
            <p>
              <strong>{friendInfo.sharerName}</strong> invited you to compare Money Personality results as {friendInfo.relationship.toLowerCase()}.
            </p>
            {friendInfo.personalNote && (
              <p className="italic text-neutral-600">“{friendInfo.personalNote}”</p>
            )}
          </div>
        </section>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex justify-center">
        <AssessmentCard
          question={questionsData[currentQuestion]}
          questionNumber={currentQuestion + 1}
          totalQuestions={questionsData.length}
          value={answers[currentQuestion]}
          onChange={handleAnswerChange}
          onNext={handleNext}
          onPrevious={handlePrevious}
          canGoNext={answers[currentQuestion] !== 0}
          canGoPrevious={currentQuestion > 0}
        />
      </main>
    </div>
  );
}
