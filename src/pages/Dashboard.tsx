import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Profile } from '../types';
import { MessageCircle, ChevronLeft, ChevronRight, User, Brain } from 'lucide-react';
import { AssessmentService } from '../services/assessmentService';

// Markdown to HTML converter
const convertMarkdownToHTML = (markdown: string): string => {
  return markdown
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    // Paragraphs
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
    console.log('Dashboard useEffect running...');
    
    const savedProfile = localStorage.getItem('userProfile');
    const savedSummary = localStorage.getItem('advisorSummary');
    
    // Check if this came from an advisor assessment
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
    
    console.log('Saved profile:', savedProfile);
    console.log('Saved summary:', savedSummary);
    
    if (!savedProfile) {
      console.log('No saved profile found, redirecting to home');
      navigate('/');
      return;
    }

    try {
      const parsedProfile = JSON.parse(savedProfile);
      console.log('Parsed profile:', parsedProfile);
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-bounce mb-4">
              <div className="w-16 h-16 bg-primary-500 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Your Results</h2>
            <p className="text-gray-600">Please wait while we load your money personality...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Assessment Found</h2>
            <p className="text-gray-600 mb-6">Please take the assessment first to see your results.</p>
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

  console.log('Profile data for rendering:', profile);
  console.log('Profile personalities:', profile.personalities);
  console.log('Profile personalityData:', profile.personalityData);

  // Create chapters based on personality data
  const chapters = [
    {
      id: 1,
      title: 'Overview',
      icon: User,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Money Personality®</h2>
            <p className="text-lg text-gray-600">
              Understand the "why" behind your money decisions with our behavioral assessment.
            </p>
          </div>

          <div className="space-y-8">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">The Why</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Managing your finances is about more than just your money in the bank. 
                It involves setting goals, evaluating choices, and high stakes! Like most things in life, 
                your unique personality and behaviors are an important piece. This analysis will help you 
                better understand the "why" behind your financial decision making, while recommending positive changes.
              </p>
              <p className="text-gray-600 text-sm">
                Please remember, your financial personality and behaviors depend on complex factors and may change over time. 
                As such, this analysis is to be taken as suggestion only. For individualized advice consult a financial professional.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">The Science</h3>
              <p className="text-gray-700 leading-relaxed">
                This analysis (and the science behind it) is the first of its kind in a financial wellness program. 
                It was developed in collaboration with financial wellness experts led by a Ph.D. in Behavioral Economics. 
                Our goal is to help you understand - in simple, practical terms - the unique characteristics of your 
                personality that affect your financial decision making.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">The How</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Based on your earlier responses, our analysis engine assessed the influences on your financial 
                behaviors across a range of categories.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our analysis looks at different components of your money personality, with explanations of your 
                dominant traits, strengths, challenges, and even a few tips and tricks to make your money 
                personality work for you. Enjoy!
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Add personality-specific chapters only if we have valid data
  if (profile.personalityData && Array.isArray(profile.personalityData)) {
    profile.personalityData.forEach((personalityData: any, index: number) => {
      const personalityName = profile.personalities[index];
      
      // Get the category for this personality type
      const getPersonalityCategory = (personalityName: string) => {
        if (['Future Focused', 'Present Focused'].includes(personalityName)) return 'Focus';
        if (['Apprehensive', 'Cautious', 'Relaxed'].includes(personalityName)) return 'Emotions';
        if (['Confident', 'Optimistic', 'Skeptical'].includes(personalityName)) return 'Outlook';
        if (['Independent', 'Social', 'Elusive'].includes(personalityName)) return 'Influence';
        if (['Organized', 'Fun Seeking', 'Change Seeking'].includes(personalityName)) return 'Bonus';
        return 'Unknown';
      };

      const category = getPersonalityCategory(personalityName);

      chapters.push({
        id: chapters.length + 1,
        title: category,
        icon: User,
        content: (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
              {isAdvisorAssessment && advisorInfo && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800">
                    <strong>{advisorInfo.name}</strong> will receive a notification that you've completed your assessment 
                    and can access your results to provide more personalized financial guidance.
                  </p>
                </div>
              )}
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your {category.toUpperCase()} Type</h2>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-blue-600 mb-2">{personalityName}</h3>
              </div>
            </div>

            <div className="space-y-8">
              <div className="card">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Summary</h3>
                <p className="text-gray-700 leading-relaxed">
                  {personalityData.description}
                </p>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What It Means</h3>
                <p className="text-gray-700 leading-relaxed">
                  {personalityData.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="card">
                  <h3 className="text-xl font-semibold text-green-600 mb-4">3 Biggest Strengths</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 mb-3">When you're {personalityName}...</p>
                    {personalityData.strengths?.map((strength: string, idx: number) => (
                      <div key={idx} className="border-l-4 border-green-500 pl-4">
                        <p className="text-sm font-medium text-green-600 mb-1">Strength</p>
                        <p className="text-gray-700">{strength}</p>
                      </div>
                    )) || []}
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-xl font-semibold text-orange-600 mb-4">3 Biggest Challenges</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 mb-3">When you're {personalityName}...</p>
                    {personalityData.challenges?.map((challenge: string, idx: number) => (
                      <div key={idx} className="border-l-4 border-orange-500 pl-4">
                        <p className="text-sm font-medium text-orange-600 mb-1">Challenge</p>
                        <p className="text-gray-700">{challenge}</p>
                      </div>
                    )) || []}
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold text-blue-600 mb-6">Action Items</h3>
                <p className="text-sm text-gray-500 mb-6">When you're {personalityName}...</p>
                <div className="space-y-6">
                  {personalityData.actionPlans?.map((plan: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-blue-500 pl-6">
                      <div className="flex items-start space-x-3 mb-2">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                          {idx + 1}
                        </span>
                        <h4 className="text-lg font-medium text-gray-900">{plan.title}</h4>
                      </div>
                      <p className="text-gray-700 leading-relaxed ml-9">{plan.description}</p>
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

  // Add AI Financial Advisor Summary as the last chapter (only for non-advisor assessments)
  if (!isAdvisorAssessment && advisorSummary) {
    chapters.push({
      id: chapters.length + 1,
      title: 'AI Financial Advisor Summary',
      icon: Brain,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Financial Advisor Summary</h2>
            <p className="text-lg text-gray-600">
              Professional insights for your financial advisor based on your personality assessment
            </p>
          </div>

          <div className="card">
            <div 
              className="prose prose-gray max-w-none [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-gray-900 [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mb-4 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-gray-900 [&>h3]:mb-3 [&>p]:text-gray-700 [&>p]:mb-4 [&>p]:leading-relaxed [&>ul]:mb-4 [&>ul]:pl-6 [&>li]:mb-2 [&>li]:text-gray-700 [&>strong]:font-semibold [&>strong]:text-gray-900"
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Chapter {currentChapter} of {totalChapters}</span>
              <span>{Math.round((currentChapter / totalChapters) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentChapter / totalChapters) * 100}%` }}
              />
            </div>
          </div>

          {/* Chapter Navigation */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setCurrentChapter(Math.max(1, currentChapter - 1))}
              disabled={currentChapter === 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                currentChapter === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center space-x-2">
                {currentChapterData && (
                  <>
                    <currentChapterData.icon className="w-6 h-6" />
                    <span>{currentChapterData.title}</span>
                  </>
                )}
              </h1>
            </div>

            <button
              onClick={() => setCurrentChapter(Math.min(totalChapters, currentChapter + 1))}
              disabled={currentChapter === totalChapters}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                currentChapter === totalChapters
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Chapter Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {currentChapterData?.content}
          </div>

          {/* Chapter List */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Chapters</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => setCurrentChapter(chapter.id)}
                  className={`flex items-center space-x-3 p-3 rounded-lg text-left transition-colors duration-200 ${
                    currentChapter === chapter.id
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <chapter.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{chapter.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}