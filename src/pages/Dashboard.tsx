import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Layout from '../components/Layout';
import { Profile, FriendAssessmentShare } from '../types';
import {
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Brain,
  Award,
  Target,
  Lightbulb,
  Users,
  Share2,
  Link2,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  CreditCard,
  Loader2
} from 'lucide-react';
import { AssessmentService, DatabaseAdvisorAssessment } from '../services/assessmentService';

marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: false,
  mangle: false
});

// Markdown to HTML converter with sanitization
const convertMarkdownToHTML = (markdown: string): string => {
  const parsed = marked.parse(markdown ?? '', { async: false });
  const rawHtml = typeof parsed === 'string' ? parsed : '';

  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
  }

  return rawHtml;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [advisorSummary, setAdvisorSummary] = useState<string>('');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAdvisorAssessment, setIsAdvisorAssessment] = useState(false);
  const [advisorInfo, setAdvisorInfo] = useState<{ name: string; email: string } | null>(null);
  const [advisorAssessment, setAdvisorAssessment] = useState<DatabaseAdvisorAssessment | null>(null);
  const [unlockStatus, setUnlockStatus] = useState<'locked' | 'unlocking' | 'unlocked' | 'pending'>('pending');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [friendShares, setFriendShares] = useState<FriendAssessmentShare[]>([]);
  const [shareForm, setShareForm] = useState(() => ({
    sharerName: typeof window !== 'undefined' ? localStorage.getItem('friendShareName') || '' : '',
    sharerEmail: typeof window !== 'undefined' ? localStorage.getItem('friendShareEmail') || '' : '',
    friendEmail: '',
    friendName: '',
    relationship: 'Partner or Spouse',
    personalNote: ''
  }));
  const [isSharingWithFriend, setIsSharingWithFriend] = useState(false);
  const [friendShareFeedback, setFriendShareFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [expandedShareId, setExpandedShareId] = useState<string | null>(null);

  useEffect(() => {
    const advisorId = searchParams.get('advisor');

    if (advisorId) {
      // This is an advisor viewing results - load from database
      loadAssessmentResultFromDatabase(advisorId);
    } else {
      // This is a regular user viewing their own results - load from localStorage
      loadUserProfileFromStorage();
    }
  }, [navigate, searchParams]);

  const loadFriendShares = () => {
    const shares = AssessmentService.getFriendAssessmentsForUser();
    setFriendShares(shares);
    setExpandedShareId(prev => {
      if (prev && shares.some(share => share.id === prev)) {
        return prev;
      }
      const completedShare = shares.find(share => share.status === 'completed');
      return completedShare ? completedShare.id : null;
    });
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'friend_assessments') {
        loadFriendShares();
      }
    };

    const handleCustomStorageChange = () => {
      loadFriendShares();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdate', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdate', handleCustomStorageChange);
    };
  }, []);

  const loadAssessmentResultFromDatabase = async (assessmentId: string) => {
    try {
      setLoading(true);
      setUnlockError(null);
      setProfile(null);
      setAdvisorSummary('');
      setAdvisorAssessment(null);
      setAdvisorInfo(null);

      const checkoutSuccess = searchParams.get('checkoutSuccess');
      const checkoutCancelled = searchParams.get('checkoutCancelled');

      if (checkoutSuccess === '1') {
        setStatusMessage('Payment received! Unlocking your report now.');
      } else if (checkoutCancelled === '1') {
        setUnlockError('Checkout was cancelled. No payment was taken.');
      }

      const assessment = await AssessmentService.getAssessmentFromDatabase(assessmentId);

      if (!assessment) {
        navigate('/');
        return;
      }

      setIsAdvisorAssessment(true);
      setAdvisorAssessment(assessment);
      setAdvisorInfo({ name: assessment.advisor_name, email: assessment.advisor_email });
      setUnlockError(null);

      if (assessment.status !== 'completed') {
        setUnlockStatus('pending');
        setStatusMessage('This assessment has not been completed yet. We will notify you when the client finishes.');
        return;
      }

      if (!assessment.is_paid) {
        setUnlockStatus('locked');
        setStatusMessage('Purchase this report to unlock the full assessment results.');
        return;
      }

      const result = await AssessmentService.getAssessmentResult(assessmentId);

      if (result) {
        setProfile(result.profile);
        if (result.advisor_summary) {
          setAdvisorSummary(result.advisor_summary);
        }
        setUnlockError(null);
        setUnlockStatus('unlocked');
        setStatusMessage(null);
      } else {
        setUnlockStatus('unlocking');
        setStatusMessage('Payment received! We are finalizing the report now.');
      }
    } catch (error) {
      console.error('Error loading assessment result:', error);
      setUnlockError(error instanceof Error ? error.message : 'Unable to load assessment results.');
    } finally {
      if (searchParams.get('checkoutSuccess') || searchParams.get('checkoutCancelled')) {
        const next = new URLSearchParams(searchParams);
        next.delete('checkoutSuccess');
        next.delete('checkoutCancelled');
        next.delete('session_id');
        setSearchParams(next, { replace: true });
      }

      setLoading(false);
    }
  };

  const loadUserProfileFromStorage = () => {
    const savedProfile = localStorage.getItem('userProfile');
    const savedSummary = localStorage.getItem('advisorSummary');

    if (!savedProfile) {
      navigate('/');
      return;
    }

      try {
        const parsedProfile = JSON.parse(savedProfile);
        setIsAdvisorAssessment(false);
        setUnlockStatus('unlocked');
        setAdvisorAssessment(null);
        setUnlockError(null);
        setStatusMessage(null);
        setProfile(parsedProfile);
        setAdvisorSummary(savedSummary || '');
        loadFriendShares();
        setLoading(false);
      } catch (error) {
      console.error('Error parsing saved profile:', error);
      navigate('/');
      return;
    }
  };

  const handleFriendShareChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setShareForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFriendShareSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profile) {
      setFriendShareFeedback({ type: 'error', message: 'Complete the assessment first to share it with someone else.' });
      return;
    }

    if (!shareForm.sharerName || !shareForm.sharerEmail || !shareForm.friendEmail) {
      setFriendShareFeedback({ type: 'error', message: 'Please add your name, email, and who you want to invite.' });
      return;
    }

    setIsSharingWithFriend(true);
    setFriendShareFeedback(null);

    const result = await AssessmentService.shareAssessmentWithFriend(
      shareForm.sharerName,
      shareForm.sharerEmail,
      shareForm.friendEmail,
      shareForm.relationship,
      profile,
      shareForm.personalNote || undefined,
      shareForm.friendName || undefined
    );

    setIsSharingWithFriend(false);

    if (result.success) {
      setFriendShareFeedback({ type: 'success', message: 'Invitation sent! Your partner will receive an email with the link.' });
      setShareForm(prev => ({
        ...prev,
        friendEmail: '',
        friendName: '',
        personalNote: ''
      }));
      if (typeof window !== 'undefined') {
        localStorage.setItem('friendShareName', shareForm.sharerName);
        localStorage.setItem('friendShareEmail', shareForm.sharerEmail);
      }
      loadFriendShares();
    } else {
      setFriendShareFeedback({ type: 'error', message: result.error || 'Unable to send the invitation. Please try again.' });
    }
  };

  const handleCopyFriendLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setFriendShareFeedback({ type: 'info', message: 'Invitation link copied to your clipboard.' });
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      setFriendShareFeedback({ type: 'error', message: 'Unable to copy the link. Please try manually copying it.' });
    }
  };

  const handleUnlockReport = async () => {
    if (!advisorAssessment) {
      return;
    }

    setCheckoutLoading(true);
    setUnlockError(null);
    setStatusMessage('Redirecting to secure checkout...');

    const successUrl = `${window.location.origin}/dashboard?advisor=${advisorAssessment.id}&checkoutSuccess=1`;
    const cancelUrl = `${window.location.origin}/dashboard?advisor=${advisorAssessment.id}&checkoutCancelled=1`;

    const result = await AssessmentService.startCheckout(advisorAssessment.id, successUrl, cancelUrl);

    setCheckoutLoading(false);

    if (!result.success || !result.url) {
      setUnlockError(result.error || 'Failed to start checkout. Please try again.');
      setStatusMessage('Purchase this report to unlock the full assessment results.');
      return;
    }

    window.location.href = result.url;
  };

  const pendingFriendShares = friendShares.filter(share => share.status === 'sent');
  const completedFriendShares = friendShares.filter(share => share.status === 'completed');

  useEffect(() => {
    if (!advisorAssessment || unlockStatus !== 'unlocking') {
      return;
    }

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      const result = await AssessmentService.getAssessmentResult(advisorAssessment.id);

      if (result) {
        setProfile(result.profile);
        if (result.advisor_summary) {
          setAdvisorSummary(result.advisor_summary);
        }
        setUnlockError(null);
        setUnlockStatus('unlocked');
        setStatusMessage(null);
        clearInterval(interval);
      } else if (attempts >= 10) {
        clearInterval(interval);
        setStatusMessage('Payment confirmed. The report will unlock shortly—please refresh if it takes longer than expected.');
      }
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [advisorAssessment, unlockStatus]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen professional-bg flex items-center justify-center">
          <div className="modern-card text-center space-y-6">
            <div className="w-20 h-20 mx-auto morph-shape bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Brain className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Analyzing Your Results</h2>
            <p className="text-gray-600">Creating your personalized money personality profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isAdvisorAssessment && unlockStatus !== 'unlocked') {
    const clientName = advisorAssessment?.client_name || 'your client';
    const possessiveName = clientName.endsWith('s') ? `${clientName}'` : `${clientName}'s`;
    const headline =
      unlockStatus === 'locked'
        ? `Unlock ${possessiveName} report`
        : unlockStatus === 'pending'
          ? 'Assessment not completed yet'
          : 'Finalizing your report';

    return (
      <Layout>
        <div className="min-h-screen professional-bg flex items-center justify-center px-4 py-16">
          <div className="max-w-xl w-full">
            <div className="modern-card text-center space-y-6">
              <div className="w-20 h-20 mx-auto morph-shape bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                {unlockStatus === 'locked' ? (
                  <Lock className="w-10 h-10 text-white" />
                ) : (
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{headline}</h1>
              {statusMessage && <p className="text-gray-600 text-sm">{statusMessage}</p>}
              {unlockError && <p className="text-sm text-red-600">{unlockError}</p>}
              {advisorAssessment?.client_email && (
                <p className="text-xs text-gray-500">Client email: {advisorAssessment.client_email}</p>
              )}
              {unlockStatus === 'locked' && (
                <button
                  onClick={handleUnlockReport}
                  disabled={checkoutLoading}
                  className="btn-primary inline-flex items-center justify-center px-6 py-3 text-base font-semibold"
                >
                  {checkoutLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-5 h-5 mr-2" />
                  )}
                  {checkoutLoading ? 'Redirecting to checkout...' : 'Unlock report ($1)'}
                </button>
              )}
              {unlockStatus === 'pending' && (
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                  <Clock className="w-4 h-4 mr-2" />
                  Awaiting client completion
                </div>
              )}
              {unlockStatus === 'unlocking' && (
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-medium">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finalizing your report...
                </div>
              )}
              <button
                onClick={() => navigate('/advisor/dashboard')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Return to advisor dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen professional-bg flex items-center justify-center">
          <div className="modern-card text-center space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Assessment Not Found</h2>
            <p className="text-gray-600 text-sm">Please complete the assessment to see your results.</p>
            <button
              onClick={() => navigate('/assessment')}
              className="btn-primary"
            >
              Take Assessment
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Create chapters based on personality data
  const chapters = [
    {
      id: 1,
      title: 'Your Profile',
      icon: User,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-10">
            <div className="w-24 h-24 mx-auto morph-shape bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-6">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Money Personality®</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Understanding the psychology behind your financial decisions
            </p>
          </div>

          <div className="grid gap-8">
            <div className="modern-card space-y-6">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-primary-600" />
                <h3 className="text-xl font-bold text-gray-900">The Purpose</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Your financial wellness goes beyond numbers in your bank account. It involves goal-setting, 
                decision-making under pressure, and navigating complex choices. This behavioral assessment 
                reveals the unique psychological patterns that drive your money decisions.
              </p>
              <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-6 rounded-xl border border-primary-100">
                <p className="text-gray-600 text-sm italic">
                  Remember: Your financial personality may evolve over time based on life experiences. 
                  This analysis provides insights for self-improvement and should complement, not replace, 
                  professional financial advice.
                </p>
              </div>
            </div>

            <div className="modern-card space-y-6">
              <div className="flex items-center space-x-3">
                <Brain className="w-6 h-6 text-accent-600" />
                <h3 className="text-xl font-bold text-gray-900">The Science</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                This groundbreaking analysis represents the first behavioral finance assessment of its kind 
                in financial wellness programs. Developed in collaboration with experts led by a Ph.D. in 
                Behavioral Economics, it translates complex psychological research into practical, 
                actionable insights about your financial personality.
              </p>
            </div>

            <div className="modern-card space-y-6">
              <div className="flex items-center space-x-3">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
                <h3 className="text-xl font-bold text-gray-900">Your Analysis</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Based on your responses, our advanced analysis engine evaluated your financial behaviors 
                across multiple psychological dimensions. You'll discover your dominant personality traits, 
                natural strengths, potential challenges, and personalized strategies to optimize your 
                financial decision-making.
              </p>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                <p className="text-gray-800 font-medium">
                  Explore each section to unlock insights about different aspects of your money personality!
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Add personality-specific chapters
  if (profile.personalityData && Array.isArray(profile.personalityData)) {
    profile.personalityData.forEach((personalityData: any, index: number) => {
      const personalityName = profile.personalities[index];
      
      const getPersonalityCategory = (personalityName: string) => {
        if (['Future Focused', 'Present Focused'].includes(personalityName)) return 'Focus';
        if (['Apprehensive', 'Cautious', 'Relaxed'].includes(personalityName)) return 'Emotions';
        if (['Confident', 'Optimistic', 'Skeptical'].includes(personalityName)) return 'Outlook';
        if (['Independent', 'Social', 'Elusive'].includes(personalityName)) return 'Influence';
        if (['Organized', 'Fun Seeking', 'Change Seeking'].includes(personalityName)) return 'Bonus';
        return 'Personality';
      };

      const category = getPersonalityCategory(personalityName);

      chapters.push({
        id: chapters.length + 1,
        title: `${category}: ${personalityName}`,
        icon: User,
        content: (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <div className="w-24 h-24 mx-auto morph-shape bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-6">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Money Personality®</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {personalityName}
              </p>
              
              {isAdvisorAssessment && advisorInfo && (
                <div className="modern-card border-l-4 border-primary-500 mb-8">
                  <p className="text-primary-800 font-medium">
                    <strong>{advisorInfo.name}</strong> will receive notification of your completed assessment 
                    and can use these insights to provide more personalized financial guidance.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="modern-card space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                  <MessageCircle className="w-6 h-6 text-primary-600" />
                  <span>What This Means</span>
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {personalityData.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="modern-card border-l-4 border-green-500">
                  <h3 className="text-xl font-bold text-green-700 mb-6 flex items-center space-x-2">
                    <Award className="w-6 h-6" />
                    <span>Your Strengths</span>
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">When you're {personalityName}, you excel at:</p>
                  <div className="space-y-4">
                    {personalityData.strengths?.map((strength: string, idx: number) => (
                      <div key={idx} className="flex space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <span className="text-green-600 font-bold text-sm">{idx + 1}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{strength}</p>
                      </div>
                    )) || []}
                  </div>
                </div>

                <div className="modern-card border-l-4 border-orange-500">
                  <h3 className="text-xl font-bold text-orange-700 mb-6 flex items-center space-x-2">
                    <Target className="w-6 h-6" />
                    <span>Growth Areas</span>
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Areas for mindful attention:</p>
                  <div className="space-y-4">
                    {personalityData.challenges?.map((challenge: string, idx: number) => (
                      <div key={idx} className="flex space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                          <span className="text-orange-600 font-bold text-sm">{idx + 1}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{challenge}</p>
                      </div>
                    )) || []}
                  </div>
                </div>
              </div>

              <div className="modern-card">
                <h3 className="text-2xl font-bold text-primary-700 mb-6 flex items-center space-x-3">
                  <Lightbulb className="w-6 h-6" />
                  <span>Personalized Action Plan</span>
                </h3>
                <p className="text-sm text-gray-600 mb-6">Strategies tailored for your {personalityName} personality:</p>
                <div className="space-y-8">
                  {personalityData.actionPlans?.map((plan: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{idx + 1}</span>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-lg font-bold text-gray-900">{plan.title}</h4>
                          <p className="text-gray-700 leading-relaxed">{plan.description}</p>
                        </div>
                      </div>
                      {idx < (personalityData.actionPlans?.length - 1) && (
                        <div className="ml-6 mt-4 h-8 w-0.5 bg-gradient-to-b from-primary-200 to-transparent"></div>
                      )}
                    </div>
                  )) || []}
                </div>
              </div>
            </div>
          </div>
        )
      });
    });
  }

  // Add AI advisor summary chapter
  if (advisorSummary) {
    chapters.push({
      id: chapters.length + 1,
      title: isAdvisorAssessment ? 'AI Advisor Summary' : 'AI Advisor Insights',
      icon: Brain,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-10">
            <div className="w-24 h-24 mx-auto morph-shape bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {isAdvisorAssessment ? 'AI Advisor Summary' : 'AI Financial Advisor Summary'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isAdvisorAssessment 
                ? 'Professional insights about this client based on their personality assessment'
                : 'Professional insights for your financial advisor based on your personality assessment'
              }
            </p>
          </div>

          <div className="modern-card">
            <div 
              className="prose prose-lg max-w-none [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-gray-900 [&>h1]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-gray-900 [&>h3]:mb-3 [&>p]:text-gray-700 [&>p]:mb-4 [&>p]:leading-relaxed [&>ul]:mb-4 [&>ul]:pl-6 [&>li]:mb-3 [&>li]:text-gray-700 [&>strong]:font-semibold [&>strong]:text-gray-900"
              dangerouslySetInnerHTML={{ 
                __html: convertMarkdownToHTML(advisorSummary) 
              }}
            />
          </div>
        </div>
      )
    });
  }

  const currentChapterData = chapters.find(c => c.id === currentChapter);
  const totalChapters = chapters.length;

  const feedbackStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  } as const;

  const feedbackIconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    error: <AlertTriangle className="w-5 h-5 text-red-600" />,
    info: <Sparkles className="w-5 h-5 text-blue-600" />
  } as const;

  return (
    <Layout>
      <div className="min-h-screen professional-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Header */}
          <div className="modern-card mb-8">
            <div className="flex justify-between items-center text-sm font-medium text-gray-600 mb-4">
              <span>Chapter {currentChapter} of {totalChapters}</span>
              <span className="stat-number text-lg font-bold">
                {Math.round((currentChapter / totalChapters) * 100)}%
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="progress-bar h-3 transition-all duration-500"
                  style={{ width: `${(currentChapter / totalChapters) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Chapter Navigation */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setCurrentChapter(Math.max(1, currentChapter - 1))}
              disabled={currentChapter === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                currentChapter === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'btn-secondary hover:scale-105'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center space-x-3">
                {currentChapterData && (
                  <>
                    <currentChapterData.icon className="w-8 h-8 text-primary-600" />
                    <span>{currentChapterData.title}</span>
                  </>
                )}
              </h1>
            </div>

            <button
              onClick={() => setCurrentChapter(Math.min(totalChapters, currentChapter + 1))}
              disabled={currentChapter === totalChapters}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                currentChapter === totalChapters
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'btn-primary hover:scale-105 group'
              }`}
            >
              <span>Next</span>
              <ChevronRight className={`w-5 h-5 ${currentChapter !== totalChapters ? 'group-hover:translate-x-1' : ''} transition-transform`} />
            </button>
          </div>

          {!isAdvisorAssessment && profile && (
            <div className="modern-card mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Money Personality Compatibility Quiz</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Invite a spouse, partner, family member, or close friend to compare Money Personalities and unlock AI-powered compatibility insights.
                    </p>
                  </div>
                </div>
                {(completedFriendShares.length > 0 || pendingFriendShares.length > 0) && (
                  <div className="flex flex-wrap items-center gap-3">
                    {completedFriendShares.length > 0 && (
                      <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium">
                        <Sparkles className="w-4 h-4" />
                        <span>{completedFriendShares.length} compatibility insight{completedFriendShares.length > 1 ? 's' : ''} ready</span>
                      </div>
                    )}
                    {pendingFriendShares.length > 0 && (
                      <div className="flex items-center space-x-2 bg-amber-50 border border-amber-100 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        <span>{pendingFriendShares.length} invite{pendingFriendShares.length > 1 ? 's' : ''} in progress</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {friendShareFeedback && (
                <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${feedbackStyles[friendShareFeedback.type]}`}>
                  <div className="flex items-start space-x-3">
                    {feedbackIconMap[friendShareFeedback.type]}
                    <p className="leading-relaxed">{friendShareFeedback.message}</p>
                  </div>
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-8">
                <form onSubmit={handleFriendShareSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sharerName" className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        id="sharerName"
                        name="sharerName"
                        type="text"
                        required
                        value={shareForm.sharerName}
                        onChange={handleFriendShareChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Jordan Lee"
                      />
                    </div>
                    <div>
                      <label htmlFor="sharerEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Email *
                      </label>
                      <input
                        id="sharerEmail"
                        name="sharerEmail"
                        type="email"
                        required
                        value={shareForm.sharerEmail}
                        onChange={handleFriendShareChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="you@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="friendName" className="block text-sm font-semibold text-gray-700 mb-2">
                        Their Name (optional)
                      </label>
                      <input
                        id="friendName"
                        name="friendName"
                        type="text"
                        value={shareForm.friendName}
                        onChange={handleFriendShareChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Taylor"
                      />
                    </div>
                    <div>
                      <label htmlFor="friendEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                        Their Email *
                      </label>
                      <input
                        id="friendEmail"
                        name="friendEmail"
                        type="email"
                        required
                        value={shareForm.friendEmail}
                        onChange={handleFriendShareChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="partner@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="relationship" className="block text-sm font-semibold text-gray-700 mb-2">
                        Relationship Focus
                      </label>
                      <select
                        id="relationship"
                        name="relationship"
                        value={shareForm.relationship}
                        onChange={handleFriendShareChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option>Partner or Spouse</option>
                        <option>Friend</option>
                        <option>Family Member</option>
                        <option>Accountability Buddy</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="personalNote" className="block text-sm font-semibold text-gray-700 mb-2">
                      Add a personal note (optional)
                    </label>
                    <textarea
                      id="personalNote"
                      name="personalNote"
                      value={shareForm.personalNote}
                      onChange={handleFriendShareChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="I thought it would be helpful to compare our money personalities before our next planning session!"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-xs text-gray-500">
                      We send a branded email with your name and a secure link. Completion notifications return here automatically.
                    </p>
                    <button
                      type="submit"
                      disabled={isSharingWithFriend}
                      className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                        isSharingWithFriend ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                      }`}
                    >
                      {isSharingWithFriend ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Share2 className="w-5 h-5 mr-2" />
                          Share Assessment
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">How the compatibility quiz works</h3>
                    <ul className="mt-3 space-y-2 text-sm text-indigo-900 list-disc list-inside">
                      <li>Your invitee receives a secure link to the Money Personality assessment.</li>
                      <li>Once both assessments are complete, compatibility insights unlock automatically.</li>
                      <li>You can revisit this dashboard anytime to review shared strengths and watch-outs.</li>
                    </ul>
                  </div>

                  {friendShares.length === 0 ? (
                    <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center text-sm text-gray-600">
                      <Sparkles className="w-6 h-6 text-primary-500 mx-auto mb-3" />
                      <p>Ready to see how your Money Personalities complement each other? Send an invite to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {friendShares.map(share => (
                        <div key={share.id} className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-gray-500">{share.relationship}</p>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {share.recipientName || 'Invitation in progress'}
                              </h3>
                              <p className="text-sm text-gray-600">{share.recipientEmail}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {share.status === 'completed' ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Completed
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                  <Clock className="w-4 h-4 mr-1" />
                                  Waiting
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 uppercase tracking-wide">
                            <span>Sent {new Date(share.sentAt).toLocaleDateString()}</span>
                            {share.status === 'sent' && (
                              <button
                                type="button"
                                onClick={() => handleCopyFriendLink(share.assessmentLink)}
                                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm normal-case"
                              >
                                <Link2 className="w-4 h-4 mr-1" />
                                Copy invite link
                              </button>
                            )}
                            {share.status === 'completed' && share.compatibility && (
                              <button
                                type="button"
                                onClick={() => setExpandedShareId(prev => (prev === share.id ? null : share.id))}
                                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold text-sm normal-case"
                              >
                                <Sparkles className="w-4 h-4 mr-1" />
                                {expandedShareId === share.id ? 'Hide insights' : 'View insights'}
                              </button>
                            )}
                          </div>

                          {share.status === 'completed' && share.compatibility && expandedShareId === share.id && (
                            <div className="mt-5 space-y-4 text-sm text-gray-700">
                              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
                                <div>
                                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Compatibility score</p>
                                  <p className="text-2xl font-bold text-emerald-900">
                                    {share.compatibility.compatibilityScore}
                                    <span className="text-sm font-medium text-emerald-600 ml-2">{share.compatibility.compatibilityLabel}</span>
                                  </p>
                                </div>
                                <Sparkles className="w-7 h-7 text-emerald-500" />
                              </div>

                              {share.compatibility.sharedTraits.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Shared traits</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {share.compatibility.sharedTraits.map(trait => (
                                      <span key={trait} className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium">
                                        {trait}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <p className="leading-relaxed">{share.compatibility.summary}</p>

                              {share.compatibility.alignmentHighlights.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Where you're in sync</h4>
                                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                                    {share.compatibility.alignmentHighlights.slice(0, 2).map((item, idx) => (
                                      <li key={idx}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {share.compatibility.potentialFriction.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Watch-outs</h4>
                                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                                    {share.compatibility.potentialFriction.slice(0, 2).map((item, idx) => (
                                      <li key={idx}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {share.compatibility.conversationStarters.length > 0 && (
                                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                                  <p className="text-sm font-semibold text-blue-700 mb-2">Suggested conversation starters</p>
                                  <ul className="space-y-2 text-blue-800 list-disc list-inside">
                                    {share.compatibility.conversationStarters.slice(0, 3).map((item, idx) => (
                                      <li key={idx}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Chapter Content */}
          <div className="modern-card mb-8">
            {currentChapterData?.content}
          </div>

          {/* Chapter Navigation Grid */}
          <div className="modern-card">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <MessageCircle className="w-6 h-6 text-primary-600" />
              <span>All Chapters</span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => setCurrentChapter(chapter.id)}
                  className={`chapter-nav p-4 text-left transition-all duration-300 ${
                    currentChapter === chapter.id ? 'active' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      currentChapter === chapter.id 
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <chapter.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {chapter.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        Chapter {chapter.id}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}