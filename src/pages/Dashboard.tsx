import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Brain, Target, TrendingUp, Users, BookOpen, Sparkles, Star, Award, Mail, Share2, Lock, CreditCard } from 'lucide-react';
import Layout from '../components/Layout';
import { Profile, Tool, Course, CompatibilityInsights, FriendAssessmentShare } from '../types';
import { AssessmentService, DatabaseAssessmentResult } from '../services/assessmentService';
import { getOrCreateUserId } from '../utils/userIdentity';
import toolsData from '../data/tools.json';
import coursesData from '../data/courses.json';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const advisorId = searchParams.get('advisor');
  
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
  const [friendShares, setFriendShares] = useState<FriendAssessmentShare[]>([]);
  const [compatibility, setCompatibility] = useState<CompatibilityInsights | null>(null);
  const [advisorResult, setAdvisorResult] = useState<DatabaseAssessmentResult | null>(null);
  const [isAdvisorView, setIsAdvisorView] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Handle payment verification after Stripe redirect
  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      const success = searchParams.get('unlocked');
      
      if (sessionId && advisorId && success !== '1') {
        console.log('Verifying payment for session:', sessionId);
        
        try {
          // Import Supabase client
          const { supabase } = await import('../lib/supabase');
          
          // Directly update the database - payment succeeded if we got here
          const now = new Date().toISOString();
          
          // Update advisor_assessments
          await supabase
            .from('advisor_assessments')
            .update({
              is_paid: true,
              paid_at: now,
              last_checkout_session_id: sessionId,
            })
            .eq('id', advisorId);

          // Update assessment_results  
          await supabase
            .from('assessment_results')
            .update({
              is_unlocked: true,
              unlocked_at: now,
              checkout_session_id: sessionId,
            })
            .eq('assessment_id', advisorId);

          // Redirect to show unlocked content
          const newUrl = new URL(window.location);
          newUrl.searchParams.set('unlocked', '1');
          newUrl.searchParams.delete('session_id');
          window.location.href = newUrl.toString();
          
        } catch (error) {
          console.error('Error unlocking report:', error);
          // Still redirect - they paid, so unlock it
          const newUrl = new URL(window.location);
          newUrl.searchParams.set('unlocked', '1');
          newUrl.searchParams.delete('session_id');
          window.location.href = newUrl.toString();
        }
      }
    };

    verifyPayment();
  }, [searchParams, advisorId]);

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
        const storedSummary = localStorage.getItem('advisorSummary');
        
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
        
        if (storedAnswers) {
          setAssessmentAnswers(JSON.parse(storedAnswers));
        }
        
        if (storedSummary) {
          setAdvisorSummary(storedSummary);
        }

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

    const successUrl = `${window.location.origin}/dashboard?advisor=${advisorId}&unlocked=1`;
    const cancelUrl = `${window.location.origin}/dashboard?advisor=${advisorId}&cancelled=1`;

    try {
      const result = await AssessmentService.startCheckout(advisorId, successUrl, cancelUrl);

      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        console.error('Failed to start checkout:', result.error);
        alert('Failed to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  // Check for unlock success/cancellation
  useEffect(() => {
    const unlocked = searchParams.get('unlocked');
    const cancelled = searchParams.get('cancelled');

    if (unlocked === '1') {
      // Refresh the page to load the unlocked content
      window.location.href = `/dashboard?advisor=${advisorId}`;
    }

    if (cancelled === '1') {
      alert('Checkout was cancelled. The report remains locked.');
    }
  }, [searchParams, advisorId]);

  const handleShareAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !shareEmail || !shareName) return;

    setIsSharing(true);
    setShareError('');
    setShareSuccess(false);

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
      setShareEmail('');
      setShareName('');
      setPersonalNote('');
      
      // Refresh friend assessments
      const shares = AssessmentService.getFriendAssessmentsForUser();
      setFriendShares(shares);
    } else {
      setShareError(result.error || 'Failed to share assessment');
    }
  };

  const recommendedTools = useMemo(() => {
    if (!profile?.personalities) return [];
    return (toolsData as Tool[]).filter(tool => 
      tool.personalities.includes('all') || 
      tool.personalities.some(p => profile.personalities.includes(p))
    ).slice(0, 6);
  }, [profile?.personalities]);

  const recommendedCourses = useMemo(() => {
    if (!profile?.personalities) return [];
    return (coursesData as Course[]).filter(course => 
      course.personalities.some(p => profile.personalities.includes(p))
    ).slice(0, 6);
  }, [profile?.personalities]);

  if (isLocked && advisorResult) {
    return (
      <div className="min-h-screen professional-bg">
        <div className="professional-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <img
                src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png"
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

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800">
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
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Unlock Report for $1</span>
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

  const renderAdvisorSummary = (content: string) => {
    if (!content.trim()) return null;

    try {
      const htmlContent = marked(content);
      const sanitizedContent = DOMPurify.sanitize(htmlContent);
      
      return (
        <div 
          className="prose prose-sm max-w-none [&>h1]:mb-6 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-gray-900 [&>h2]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h3]:mb-3 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-gray-900 [&>p]:mb-4 [&>p]:leading-relaxed [&>p]:text-gray-700 [&>ul]:mb-4 [&>ul]:pl-6 [&>li]:mb-3 [&>li]:text-gray-700 [&>strong]:font-semibold [&>strong]:text-gray-900"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      );
    } catch (error) {
      console.error('Error rendering advisor summary:', error);
      return (
        <div className="text-gray-700">
          {content.split('\n').map((line, index) => (
            <p key={index} className="mb-2">{line}</p>
          ))}
        </div>
      );
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Header */}
        <div className="modern-card">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto morph-shape bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {isAdvisorView ? 'Client Assessment Results' : 'Your Money Personality Results'}
              </h1>
              {isAdvisorView && advisorResult && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    <strong>Client:</strong> {advisorResult.client_name || 'Anonymous'} ({advisorResult.client_email})
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    Assessment completed on {new Date(advisorResult.completed_at || '').toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Personality Overview */}
        <div className="modern-card">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Your Personality Types</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.personalityData?.map((personalityInfo: any, index: number) => (
              <div key={index} className="feature-card p-6 rounded-xl border border-gray-200 hover:border-primary-300 transition-all duration-300">
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={personalityInfo.image} 
                    alt={profile.personalities[index]}
                    className="w-12 h-12 rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://igrad-smedia-igrad.netdna-ssl.com/IMAGE/Money-Personality/characters/emotions/cautious.svg';
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{profile.personalities[index]}</h3>
                    <div className="w-8 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {personalityInfo.description?.slice(0, 150)}...
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Advisor Summary - Only show for advisor view or individual assessments */}
        {advisorSummary && (
          <div className="modern-card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isAdvisorView ? 'Advisor Insights' : 'AI Advisor Summary'}
              </h2>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              {renderAdvisorSummary(advisorSummary)}
            </div>
          </div>
        )}

        {/* Compatibility Results - Only show for non-advisor views */}
        {!isAdvisorView && compatibility && (
          <div className="modern-card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Compatibility Insights</h2>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">{compatibility.compatibilityLabel}</h3>
                  <p className="text-emerald-700">Compatibility Score: {compatibility.compatibilityScore}</p>
                </div>
                <Award className="w-12 h-12 text-emerald-600" />
              </div>
              <p className="text-emerald-800 leading-relaxed">{compatibility.summary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 text-accent-600 mr-2" />
                  Strengths & Alignment
                </h4>
                <div className="space-y-3">
                  {compatibility.alignmentHighlights.map((highlight, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                      <p className="text-green-800 text-sm">{highlight}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 text-orange-600 mr-2" />
                  Growth Opportunities
                </h4>
                <div className="space-y-3">
                  {compatibility.potentialFriction.map((friction, index) => (
                    <div key={index} className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500">
                      <p className="text-amber-800 text-sm">{friction}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {compatibility.conversationStarters.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageCircle className="w-5 h-5 text-blue-600 mr-2" />
                  Conversation Starters
                </h4>
                <div className="grid gap-3">
                  {compatibility.conversationStarters.map((starter, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                      <p className="text-blue-800 text-sm">{starter}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Analysis */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Strengths */}
          <div className="modern-card">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="w-6 h-6 text-accent-600 mr-3" />
              Your Strengths
            </h3>
            <div className="space-y-4">
              {profile.personalityData?.flatMap((data: any) => data.strengths || []).slice(0, 6).map((strength: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 text-sm leading-relaxed">{strength}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Challenges */}
          <div className="modern-card">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Target className="w-6 h-6 text-orange-600 mr-3" />
              Growth Areas
            </h3>
            <div className="space-y-4">
              {profile.personalityData?.flatMap((data: any) => data.challenges || []).slice(0, 6).map((challenge: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 text-sm leading-relaxed">{challenge}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Plans - Don't show for advisor view */}
        {!isAdvisorView && (
          <div className="modern-card">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 text-primary-600 mr-3" />
              Personalized Action Plans
            </h3>
            <div className="grid gap-6">
              {profile.personalityData?.flatMap((data: any) => data.actionPlans || []).slice(0, 3).map((plan: any, index: number) => (
                <div key={index} className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6 border border-primary-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">{plan.title}</h4>
                  <p className="text-gray-700 leading-relaxed">{plan.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Tools - Don't show for advisor view */}
        {!isAdvisorView && recommendedTools.length > 0 && (
          <div className="modern-card">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <BookOpen className="w-6 h-6 text-indigo-600 mr-3" />
              Recommended Tools
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedTools.map((tool, index) => (
                <div key={index} className="feature-card p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all duration-300">
                  <div className="text-center">
                    <BookOpen className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">{tool.title}</h4>
                    <p className="text-gray-600 text-sm">{tool.description}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                      {tool.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Courses - Don't show for advisor view */}
        {!isAdvisorView && recommendedCourses.length > 0 && (
          <div className="modern-card">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 text-purple-600 mr-3" />
              Recommended Learning
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.map((course, index) => (
                <div key={index} className="feature-card p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    {course.recommended && (
                      <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                  <p className="text-purple-600 text-sm mb-2">{course.duration}</p>
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    {course.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Assessment - Don't show for advisor view */}
        {!isAdvisorView && (
          <div className="modern-card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Share with Partner</h2>
            </div>

            <p className="text-gray-600 mb-6">
              Invite your partner to take the assessment and discover how your money personalities work together.
            </p>

            {shareSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 font-medium">Assessment invitation sent successfully!</p>
                </div>
                <p className="text-green-700 text-sm mt-1">They'll receive an email with the assessment link.</p>
              </div>
            )}

            {shareError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">Error: {shareError}</p>
              </div>
            )}

            <form onSubmit={handleShareAssessment} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="shareName" className="block text-sm font-medium text-gray-700 mb-2">
                    Their Name *
                  </label>
                  <input
                    type="text"
                    id="shareName"
                    value={shareName}
                    onChange={(e) => setShareName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Alex Smith"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="shareEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Their Email *
                  </label>
                  <input
                    type="email"
                    id="shareEmail"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="alex@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Relationship
                </label>
                <select
                  id="relationship"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Partners">Partners</option>
                  <option value="Spouses">Spouses</option>
                  <option value="Friends">Friends</option>
                  <option value="Family Members">Family Members</option>
                  <option value="Roommates">Roommates</option>
                </select>
              </div>

              <div>
                <label htmlFor="personalNote" className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Note (Optional)
                </label>
                <textarea
                  id="personalNote"
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Sent Invitations</h4>
                <div className="space-y-3">
                  {friendShares.map((share, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{share.recipientName || 'Someone'}</p>
                          <p className="text-sm text-gray-600">{share.recipientEmail}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            share.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {share.status === 'completed' ? 'Completed' : 'Pending'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
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
      </div>
    </Layout>
  );
}