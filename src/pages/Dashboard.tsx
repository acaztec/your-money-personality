import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Brain, Target, TrendingUp, Users, Sparkles, Star, Award, Mail, Share2, Lock, CreditCard, ChevronRight, ChevronLeft } from 'lucide-react';
import Layout from '../components/Layout';
import { Profile, CompatibilityInsights, FriendAssessmentShare } from '../types';
import { AssessmentService, DatabaseAssessmentResult } from '../services/assessmentService';
import { getOrCreateUserId } from '../utils/userIdentity';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: false,
  mangle: false,
});

interface Chapter {
  id: string;
  title: string;
  number: number;
  total: number;
}

const chapters: Chapter[] = [
  { id: 'overview', title: 'Overview', number: 1, total: 6 },
  { id: 'emotions', title: 'Emotions', number: 2, total: 6 },
  { id: 'outlook', title: 'Outlook', number: 3, total: 6 },
  { id: 'focus', title: 'Focus', number: 4, total: 6 },
  { id: 'influence', title: 'Influence', number: 5, total: 6 },
  { id: 'bonus', title: 'Bonus', number: 6, total: 6 },
];

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const advisorId = searchParams.get('advisor');
  
  const [currentChapter, setCurrentChapter] = useState('overview');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState<number[]>([]);
  const [advisorSummary, setAdvisorSummary] = useState<string>('');
  const [shareEmail, setShareEmail] = useState('');
  const [shareName, setShareName] = useState('');
  const [relationship, setRelationship] = useState('Partners');
  const [personalNote, setPersonalNote] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareError, setShareError] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [shareCopyFeedback, setShareCopyFeedback] = useState('');
  const [friendShares, setFriendShares] = useState<FriendAssessmentShare[]>([]);
  const [compatibility, setCompatibility] = useState<CompatibilityInsights | null>(null);
  const [advisorResult, setAdvisorResult] = useState<DatabaseAssessmentResult | null>(null);
  const [isAdvisorView, setIsAdvisorView] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (advisorId) {
        setIsAdvisorView(true);
        try {
          const result = await AssessmentService.getAssessmentResult(advisorId);
          if (result && result.is_unlocked) {
            setAdvisorResult(result);
            setProfile(result.profile);
            setAssessmentAnswers(result.answers || []);
            setAdvisorSummary(result.advisor_summary || '');
            setIsLocked(false);
          } else if (result && !result.is_unlocked) {
            setAdvisorResult(result);
            setIsLocked(true);
          } else {
            console.error('Assessment result not found or access denied');
            setIsLocked(true);
          }
        } catch (error) {
          console.error('Error loading advisor assessment result:', error);
          setIsLocked(true);
        }
      } else {
        // Load user's own profile
        const storedProfile = localStorage.getItem('userProfile');
        const storedAnswers = localStorage.getItem('assessmentAnswers');

        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }

        if (storedAnswers) {
          setAssessmentAnswers(JSON.parse(storedAnswers));
        }

        // Ensure any locally stored advisor summaries are cleared for client views
        localStorage.removeItem('advisorSummary');
        setAdvisorSummary('');

        // Load friend assessments
        const shares = AssessmentService.getFriendAssessmentsForUser();
        setFriendShares(shares);
        
        // Find completed compatibility insights
        const completedShare = shares.find(share => share.status === 'completed' && share.compatibility);
        if (completedShare?.compatibility) {
          setCompatibility(completedShare.compatibility);
        }
      }
    };

    loadData();
  }, [advisorId]);

  const handleUnlockReport = async () => {
    if (!advisorId || !advisorResult) return;

    setIsUnlocking(true);

    try {
      const result = await AssessmentService.unlockAssessment(advisorId);

      if (result.success) {
        const updated = await AssessmentService.getAssessmentResult(advisorId);
        if (updated) {
          setAdvisorResult(updated);
          setProfile(updated.profile);
          setAssessmentAnswers(updated.answers || []);
          setAdvisorSummary(updated.advisor_summary || '');
          setIsLocked(!updated.is_unlocked);
        } else {
          setIsLocked(false);
        }
      } else {
        console.error('Failed to unlock report:', result.error);
        alert('Failed to unlock the report. Please try again.');
      }
    } catch (error) {
      console.error('Error unlocking report:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleShareAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !shareEmail || !shareName) return;

    setIsSharing(true);
    setShareError('');
    setShareSuccess(false);
    setShareLink('');
    setShareCopyFeedback('');

    const userName = localStorage.getItem('userName') || 'Someone';
    const userEmail = localStorage.getItem('userEmail') || '';

    const result = await AssessmentService.shareAssessmentWithFriend(
      userName,
      userEmail,
      shareEmail,
      relationship,
      profile,
      personalNote || undefined,
      shareName
    );

    setIsSharing(false);

    if (result.success) {
      setShareSuccess(true);
      setShareLink(result.assessmentLink || '');
      setShareEmail('');
      setShareName('');
      setPersonalNote('');

      // Refresh friend assessments
      const shares = AssessmentService.getFriendAssessmentsForUser();
      setFriendShares(shares);
    } else {
      setShareError(result.error || 'Failed to share assessment');
      setShareLink(result.assessmentLink || '');
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setShareCopyFeedback('Link copied to clipboard!');
      setTimeout(() => setShareCopyFeedback(''), 3000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      setShareCopyFeedback('Unable to copy automatically. Please copy the link manually.');
      setTimeout(() => setShareCopyFeedback(''), 4000);
    }
  };

  const currentChapterData = chapters.find(c => c.id === currentChapter);

  const nextChapter = () => {
    const currentIndex = chapters.findIndex(c => c.id === currentChapter);
    if (currentIndex < chapters.length - 1) {
      setCurrentChapter(chapters[currentIndex + 1].id);
    }
  };

  const previousChapter = () => {
    const currentIndex = chapters.findIndex(c => c.id === currentChapter);
    if (currentIndex > 0) {
      setCurrentChapter(chapters[currentIndex - 1].id);
    }
  };

  const renderAdvisorSummary = (content: string) => {
    if (!content.trim()) return null;

    try {
      const htmlContent = marked.parse(content);
      const sanitizedContent = DOMPurify.sanitize(htmlContent);

      return (
        <div className="advisor-summary" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      );
    } catch (error) {
      console.error('Error rendering advisor summary:', error);
      return (
        <div className="text-neutral-700">
          {content.split('\n').map((line, index) => (
            <p key={index} className="mb-2">{line}</p>
          ))}
        </div>
      );
    }
  };

  const getPersonalityImage = (personalityName: string) => {
    const personalityImages: Record<string, string> = {
      'Apprehensive': 'https://images.pexels.com/photos/4386374/pexels-photo-4386374.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&dpr=1',
      'Cautious': 'https://images.pexels.com/photos/6693655/pexels-photo-6693655.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&dpr=1',
      'Relaxed': 'https://images.pexels.com/photos/4050415/pexels-photo-4050415.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&dpr=1',
      'Confident': 'https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&dpr=1',
      'Optimistic': 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&dpr=1',
      'Skeptical': 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&dpr=1',
      'Future Focused': 'https://images.pexels.com/photos/3184307/pexels-photo-3184307.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&dpr=1',
      'Present Focused': 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&dpr=1',
      'Social': 'https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&dpr=1',
      'Independent': 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&dpr=1',
      'Elusive': 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&dpr=1',
      'Organized': 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&dpr=1',
      'Fun Seeking': 'https://images.pexels.com/photos/3153198/pexels-photo-3153198.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&dpr=1',
      'Change Seeking': 'https://images.pexels.com/photos/5668870/pexels-photo-5668870.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&dpr=1',
    };
    return personalityImages[personalityName] || 'https://images.pexels.com/photos/6693655/pexels-photo-6693655.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&dpr=1';
  };

  if (isLocked && advisorResult) {
    return (
      <div className="min-h-screen professional-bg">
        <div className="professional-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <img
                src="https://media-cdn.igrad.com/IMAGE/Logos/Standard-White/Enrich.png"
                alt="iGrad Enrich"
                className="h-10 w-auto static-element"
              />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="modern-card text-center space-y-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-white" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Assessment Report Locked</h1>
              <p className="text-lg text-gray-600 mb-6">
                This detailed assessment report is available for $1. Once unlocked, you'll have access to:
              </p>
              
              <div className="text-left max-w-md mx-auto space-y-3 mb-8">
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-accent-600" />
                  <span>Complete personality breakdown</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-accent-600" />
                  <span>Behavioral strengths and challenges</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Brain className="w-5 h-5 text-accent-600" />
                  <span>AI-powered advisor recommendations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-accent-600" />
                  <span>Personalized action plans</span>
                </div>
              </div>

              <div className="rounded-lg border border-primary-200 bg-primary-100 p-4 mb-6">
                <p className="text-sm text-primary-700">
                  <strong>Client:</strong> {advisorResult.client_name || 'Anonymous'} ({advisorResult.client_email})
                </p>
              </div>
            </div>

            <button
              onClick={handleUnlockReport}
              disabled={isUnlocking}
              className="btn-primary inline-flex items-center space-x-3"
            >
              {isUnlocking ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Unlocking…</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Unlock Report (demo)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="modern-card text-center space-y-6">
            <Brain className="w-16 h-16 text-gray-300 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">No Assessment Results Found</h2>
            <p className="text-gray-600">
              You haven't completed an assessment yet. Take the Money Personality assessment to see your results here.
            </p>
            <Link to="/assessment" className="btn-primary">
              <Sparkles className="w-5 h-5 mr-3" />
              Take Assessment
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Chapter Navigation */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="modern-card p-6">
              <h2 className="text-lg font-semibold text-primary-900 mb-4">
                {isAdvisorView ? 'Client Assessment Report' : 'Your Money Personality'}
              </h2>
              
              {isAdvisorView && advisorResult && (
                <div className="mb-6 p-4 rounded-lg border border-primary-200 bg-primary-100">
                  <p className="text-sm text-primary-700 font-medium">
                    <strong>Client:</strong> {advisorResult.client_name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-primary-600 mt-1">
                    {advisorResult.client_email}
                  </p>
                </div>
              )}

              <nav className="space-y-2">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => setCurrentChapter(chapter.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentChapter === chapter.id
                        ? 'bg-primary-100 text-primary-900 border-l-4 border-primary-700'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      Chapter {chapter.number}: {chapter.title}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      ({chapter.number}/{chapter.total})
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Chapter Content */}
          <div className="space-y-8">
            {/* Chapter Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-primary-900">
                  {currentChapterData?.title}
                </h1>
                <p className="text-neutral-600 mt-2">
                  Chapter {currentChapterData?.number} of {currentChapterData?.total}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={previousChapter}
                  disabled={currentChapter === 'overview'}
                  className={`btn-secondary inline-flex items-center ${
                    currentChapter === 'overview' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>
                <button
                  onClick={nextChapter}
                  disabled={currentChapter === 'bonus'}
                  className={`btn-primary inline-flex items-center ${
                    currentChapter === 'bonus' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>

            {/* Chapter Content */}
            {currentChapter === 'overview' && (
              <div className="space-y-8">
                <div className="modern-card p-8">
                  <h2 className="text-2xl font-bold text-primary-900 mb-6">Overview</h2>
                  
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-xl font-semibold text-ink mb-4">The Why</h3>
                      <p className="text-neutral-700 leading-relaxed">
                        {isAdvisorView ? advisorResult?.client_name || 'Your client' : 'Test3'}, managing your finances is about more than just your money in the bank. 
                        It involves setting goals, evaluating choices, and high stakes! Like most things in life, your unique personality and behaviors are an important piece. 
                        This analysis will help you better understand the "why" behind your financial decision making, while recommending positive changes.
                      </p>
                      <p className="text-neutral-700 leading-relaxed mt-4">
                        Please remember, your financial personality and behaviors depend on complex factors and may change over time. 
                        As such, this analysis is to be taken as suggestion only. For individualized advice consult a financial professional.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-ink mb-4">The Science</h3>
                      <p className="text-neutral-700 leading-relaxed">
                        This report (and the science behind it) is the first of its kind in a financial wellness program. 
                        It was developed in collaboration with financial wellness experts led by a Ph.D. in Behavioral Economics. 
                        Our goal is to help you understand - in simple, practical terms - the unique characteristics of your personality 
                        that affect your financial decision making.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-ink mb-4">The How</h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Based on your earlier responses, our analysis engine assessed the influences on your financial behaviors across a range of categories. 
                        Our analysis looks at different components of your money personality, with explanations of your dominant traits, strengths, challenges, 
                        and even a few tips and tricks to make your money personality work for you. Enjoy!
                      </p>
                    </section>
                  </div>
                </div>
              </div>
            )}

            {/* AI Advisor Summary - Only show for advisor view */}
            {isAdvisorView && advisorSummary && currentChapter === 'overview' && (
              <div className="modern-card p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-primary-900">Advisor Insights</h2>
                </div>
                <div className="rounded-xl border border-primary-200 bg-primary-100 p-6">
                  {renderAdvisorSummary(advisorSummary)}
                </div>
              </div>
            )}

            {/* Personality Chapters */}
            {(currentChapter === 'emotions' || currentChapter === 'outlook' || currentChapter === 'focus' || 
              currentChapter === 'influence' || currentChapter === 'bonus') && (
              <div className="space-y-8">
                {profile.personalityData?.map((personalityInfo: any, index: number) => {
                  const personalityName = profile.personalities[index];
                  const personalityCategory = personalityName.toLowerCase().includes('focused') ? 'focus' :
                                            personalityName.toLowerCase().includes('confident') || personalityName.toLowerCase().includes('optimistic') || personalityName.toLowerCase().includes('skeptical') ? 'outlook' :
                                            personalityName.toLowerCase().includes('apprehensive') || personalityName.toLowerCase().includes('cautious') || personalityName.toLowerCase().includes('relaxed') ? 'emotions' :
                                            personalityName.toLowerCase().includes('social') || personalityName.toLowerCase().includes('independent') || personalityName.toLowerCase().includes('elusive') ? 'influence' :
                                            'bonus';
                  
                  if (personalityCategory !== currentChapter) return null;

                  return (
                    <div key={index} className="space-y-8">
                      <div className="modern-card p-8">
                        <div className="text-center mb-8">
                          <h2 className="text-3xl font-bold text-primary-900 mb-2">
                            Your {currentChapter.toUpperCase()} Type
                          </h2>
                          <h3 className="text-5xl font-bold text-accent-600 mb-4">{personalityName}</h3>
                          <p className="text-xl text-neutral-600">
                            {/* Placeholder percentage - in real implementation this would be calculated */}
                            {personalityName === 'Cautious' ? '59%' : personalityName === 'Independent' ? '57%' : personalityName === 'Present Focused' ? '35%' : personalityName === 'Confident' ? '17%' : '18%'} of people are {personalityName} like you
                          </p>
                          
                          <div className="w-64 h-2 bg-neutral-200 rounded-full mx-auto mt-4">
                            <div 
                              className="h-2 bg-accent-600 rounded-full" 
                              style={{ width: personalityName === 'Cautious' ? '59%' : personalityName === 'Independent' ? '57%' : personalityName === 'Present Focused' ? '35%' : personalityName === 'Confident' ? '17%' : '18%' }}
                            ></div>
                          </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8 items-start">
                          <div>
                            <h4 className="text-xl font-semibold text-ink mb-4">Summary</h4>
                            <p className="text-neutral-700 leading-relaxed mb-6">
                              {personalityInfo.description?.split('.')[0]}.
                            </p>
                            
                            <h4 className="text-xl font-semibold text-ink mb-4">What It Means</h4>
                            <p className="text-neutral-700 leading-relaxed">
                              {personalityInfo.description?.substring(personalityInfo.description.indexOf('.') + 1).trim()}
                            </p>
                          </div>
                          
                          <div className="flex justify-center">
                            <div className="w-80 h-60 bg-neutral-100 rounded-[2rem] overflow-hidden shadow-subtle">
                              <img 
                                src={getPersonalityImage(personalityName)}
                                alt={`${personalityName} personality illustration`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid lg:grid-cols-2 gap-8">
                        <div className="modern-card p-6">
                          <h4 className="text-xl font-semibold text-ink mb-6 flex items-center">
                            <Star className="w-6 h-6 text-accent-600 mr-3" />
                            3 Biggest Strengths
                          </h4>
                          <div className="space-y-4">
                            {personalityInfo.strengths?.slice(0, 3).map((strength: string, idx: number) => (
                              <div key={idx} className="space-y-2">
                                <h5 className="font-semibold text-accent-600">When you're {personalityName}...</h5>
                                <div className="flex items-start space-x-3">
                                  <span className="inline-block w-16 h-6 bg-accent-600 text-white text-xs font-semibold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    Strength
                                  </span>
                                  <p className="text-neutral-700 text-sm leading-relaxed">{strength}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="modern-card p-6">
                          <h4 className="text-xl font-semibold text-ink mb-6 flex items-center">
                            <Target className="w-6 h-6 text-orange-600 mr-3" />
                            3 Biggest Challenges
                          </h4>
                          <div className="space-y-4">
                            {personalityInfo.challenges?.slice(0, 3).map((challenge: string, idx: number) => (
                              <div key={idx} className="space-y-2">
                                <h5 className="font-semibold text-orange-600">When you're {personalityName}...</h5>
                                <div className="flex items-start space-x-3">
                                  <span className="inline-block w-16 h-6 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    Challenge
                                  </span>
                                  <p className="text-neutral-700 text-sm leading-relaxed">{challenge}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Items */}
                      <div className="modern-card p-8">
                        <h4 className="text-2xl font-semibold text-ink mb-6">Action Items</h4>
                        <p className="text-neutral-600 mb-8">When you're {personalityName}...</p>

                        <div className="space-y-6">
                          {personalityInfo.actionPlans?.map((plan: any, idx: number) => (
                            <div key={idx} className="border-l-4 border-primary-500 bg-primary-50 rounded-r-lg p-6">
                              <div className="flex items-start space-x-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-primary-700 text-white rounded-full flex items-center justify-center font-bold">
                                  {idx + 1}
                                </span>
                                <div>
                                  <h5 className="font-semibold text-primary-900 mb-3">{plan.title}</h5>
                                  <p className="text-neutral-700 leading-relaxed">{plan.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Share Assessment - Don't show for advisor view and only on final chapter */}
            {!isAdvisorView && currentChapter === 'bonus' && (
              <div className="modern-card p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-primary-900">Share the Compatibility Quiz</h2>
                </div>

                <p className="text-neutral-600 mb-6">
                  Invite someone important in your life to explore how your money personalities complement each other.
                </p>

                {shareSuccess && (
                  <div className="mb-6 rounded-lg border border-accent-600/40 bg-white p-4">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-accent-600" />
                      <p className="text-neutral-700 font-medium">Assessment invitation sent successfully!</p>
                    </div>
                    <p className="text-neutral-600 text-sm mt-1">They'll receive an email with the quiz link.</p>
                    {shareLink && (
                      <div className="mt-4 text-left">
                        <p className="text-sm text-neutral-600 mb-2">
                          Want to share it directly? Use this link:
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={shareLink}
                            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg bg-white text-sm text-gray-800"
                          />
                          <button
                            type="button"
                            onClick={handleCopyShareLink}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-lg shadow-sm transition-colors"
                          >
                            Copy link
                          </button>
                        </div>
                        {shareCopyFeedback && (
                          <p className="text-xs text-neutral-600 mt-2">{shareCopyFeedback}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {shareError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 font-medium">Error: {shareError}</p>
                    {shareLink && (
                      <div className="mt-4 text-left">
                        <p className="text-sm text-red-700 mb-2">
                          The quiz link is still ready—share it directly while email delivery is unavailable:
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={shareLink}
                            className="flex-1 px-3 py-2 border border-red-200 rounded-lg bg-white text-sm text-gray-800"
                          />
                          <button
                            type="button"
                            onClick={handleCopyShareLink}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
                          >
                            Copy link
                          </button>
                        </div>
                        {shareCopyFeedback && (
                          <p className="text-xs text-red-700 mt-2">{shareCopyFeedback}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleShareAssessment} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="shareName" className="block text-sm font-medium text-neutral-700 mb-2">
                        Their Name *
                      </label>
                      <input
                        type="text"
                        id="shareName"
                        value={shareName}
                        onChange={(e) => setShareName(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Alex Smith"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="shareEmail" className="block text-sm font-medium text-neutral-700 mb-2">
                        Their Email *
                      </label>
                      <input
                        type="email"
                        id="shareEmail"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="alex@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="relationship" className="block text-sm font-medium text-neutral-700 mb-2">
                      Your Relationship
                    </label>
                    <select
                      id="relationship"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="Partners">Partners</option>
                      <option value="Spouses">Spouses</option>
                      <option value="Friends">Friends</option>
                      <option value="Family Members">Family Members</option>
                      <option value="Roommates">Roommates</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="personalNote" className="block text-sm font-medium text-neutral-700 mb-2">
                      Personal Note (Optional)
                    </label>
                    <textarea
                      id="personalNote"
                      value={personalNote}
                      onChange={(e) => setPersonalNote(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="I think you'd find this interesting! It helped me understand my approach to money better."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSharing || !shareEmail || !shareName}
                    className="btn-primary"
                  >
                    {isSharing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-3" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </form>

                {/* Show existing shares */}
                {friendShares.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-neutral-200">
                    <h4 className="text-lg font-semibold text-primary-900 mb-4">Sent Invitations</h4>
                    <div className="space-y-3">
                      {friendShares.map((share, index) => (
                        <div key={index} className="bg-neutral-100 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-primary-900">{share.recipientName || 'Someone'}</p>
                              <p className="text-sm text-neutral-600">{share.recipientEmail}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                share.status === 'completed'
                                  ? 'bg-accent-600/15 text-accent-600'
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {share.status === 'completed' ? 'Completed' : 'Pending'}
                              </span>
                              <p className="text-xs text-neutral-500 mt-1">
                                {share.relationship} • {share.sentAt?.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Compatibility Results - Only show for non-advisor views on final chapter */}
            {!isAdvisorView && compatibility && currentChapter === 'bonus' && (
              <div className="modern-card p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-primary-900">Compatibility Insights</h2>
                </div>

                <div className="rounded-xl border border-accent-600/30 bg-white p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary-900">{compatibility.compatibilityLabel}</h3>
                      <p className="text-neutral-600">Compatibility Score: {compatibility.compatibilityScore}</p>
                    </div>
                    <Award className="w-12 h-12 text-accent-600" />
                  </div>
                  <p className="text-neutral-700 leading-relaxed">{compatibility.summary}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-4 flex items-center">
                      <Star className="w-5 h-5 text-accent-600 mr-2" />
                      Strengths & Alignment
                    </h4>
                    <div className="space-y-3">
                      {compatibility.alignmentHighlights.map((highlight, index) => (
                        <div key={index} className="rounded-lg border-l-4 border-accent-600 bg-white p-3">
                          <p className="text-neutral-700 text-sm">{highlight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-4 flex items-center">
                      <Target className="w-5 h-5 text-orange-600 mr-2" />
                      Growth Opportunities
                    </h4>
                    <div className="space-y-3">
                      {compatibility.potentialFriction.map((friction, index) => (
                        <div key={index} className="rounded-lg border-l-4 border-orange-400 bg-white p-3">
                          <p className="text-neutral-700 text-sm">{friction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {compatibility.conversationStarters.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-primary-900 mb-4 flex items-center">
                      <Brain className="w-5 h-5 text-primary-700 mr-2" />
                      Conversation Starters
                    </h4>
                    <div className="grid gap-3">
                      {compatibility.conversationStarters.map((starter, index) => (
                        <div key={index} className="rounded-lg border-l-4 border-primary-500 bg-primary-100 p-3">
                          <p className="text-primary-700 text-sm">{starter}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}