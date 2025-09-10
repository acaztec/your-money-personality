import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Profile } from '../types';
import { MessageCircle, ChevronLeft, ChevronRight, User, Brain, Award, Target, Lightbulb } from 'lucide-react';
import { AssessmentService } from '../services/assessmentService';

// Markdown to HTML converter
const convertMarkdownToHTML = (markdown: string): string => {
  return markdown
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .split('\n\n')
    .map(paragraph => {
      if (paragraph.startsWith('<h') || paragraph.startsWith('<li')) {
        return paragraph;
      }
      return paragraph.trim() ? `<p>${paragraph}</p>` : '';
    })
    .join('\n');
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [advisorSummary, setAdvisorSummary] = useState<string>('');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAdvisorAssessment, setIsAdvisorAssessment] = useState(false);
  const [advisorInfo, setAdvisorInfo] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const savedSummary = localStorage.getItem('advisorSummary');
    
    const advisorId = searchParams.get('advisor');
    if (advisorId) {
      const assessment = AssessmentService.getAssessment(advisorId);
      if (assessment) {
        setIsAdvisorAssessment(true);
        setAdvisorInfo({
          name: assessment.advisorName,
          email: assessment.advisorEmail
        });
      }
    }
    
    if (!savedProfile) {
      navigate('/');
      return;
    }

    try {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
      setAdvisorSummary(savedSummary || '');
      setLoading(false);
    } catch (error) {
      console.error('Error parsing saved profile:', error);
      navigate('/');
      return;
    }
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen animated-bg flex items-center justify-center">
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

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen animated-bg flex items-center justify-center">
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
              </div>
              
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
  if (!isAdvisorAssessment && advisorSummary) {
    chapters.push({
      id: chapters.length + 1,
      title: 'AI Advisor Insights',
      icon: Brain,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-10">
            <div className="w-24 h-24 mx-auto morph-shape bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">AI Financial Advisor Summary</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional insights for your financial advisor based on your personality assessment
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

  return (
    <Layout>
      <div className="min-h-screen animated-bg">
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