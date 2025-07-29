import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Profile, Tool, Course } from '../types';
import { MessageCircle, BookOpen, Wrench, ChevronLeft, ChevronRight, User, Brain } from 'lucide-react';
import toolsData from '../data/tools.json';
import coursesData from '../data/courses.json';

// Markdown to HTML converter
const convertMarkdownToHTML = (markdown: string): string => {
  return markdown
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-900 mb-3">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-gray-900 mb-4">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mb-4">$1</h1>')
    .replace(/^\*\*(.*?)\*\*/gm, '<strong class="font-semibold">$1</strong>')
    .replace(/^\*(.*?)\*/gm, '<em class="italic">$1</em>')
    .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(?!<[h|l|p])/gm, '<p class="mb-4">')
    .replace(/(?<!>)$/gm, '</p>');
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [advisorSummary, setAdvisorSummary] = useState<string>('');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const savedSummary = localStorage.getItem('advisorSummary');
    
    if (!savedProfile) {
      navigate('/');
      return;
    }

    try {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
      setAdvisorSummary(savedSummary || '');
    } catch (error) {
      console.error('Error parsing saved profile:', error);
      navigate('/');
      return;
    }

    setLoading(false);
  }, [navigate]);

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

  if (!profile || !profile.personalityData) {
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

  // Get recommended tools and courses based on personality
  const getRecommendedItems = (items: (Tool | Course)[], personalities: string[]) => {
    return items.filter(item => 
      item.personalities.some(p => 
        personalities.some(userP => 
          userP.toLowerCase().includes(p.toLowerCase()) || 
          p.toLowerCase().includes(userP.toLowerCase()) ||
          p === 'all'
        )
      )
    ).slice(0, 6);
  };

  const recommendedTools = getRecommendedItems(toolsData as Tool[], profile.personalities);
  const recommendedCourses = getRecommendedItems(coursesData as Course[], profile.personalities);

  // Create chapters based on personality data
  const chapters = [
    {
      id: 1,
      title: 'Your Money Personality Overview',
      icon: User,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Money Personality Types</h2>
            <p className="text-lg text-gray-600">
              Based on your assessment, here are your primary financial personality types:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.personalityData.map((personality: any, index: number) => (
              <div key={index} className="card">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto mb-3 bg-blue-50 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{profile.personalities[index]}</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {personality.description}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What This Means</h3>
            <p className="text-gray-700">
              Your personality combination gives you a unique approach to money management. 
              In the following chapters, you'll discover specific insights, strengths, challenges, 
              and action plans tailored to each of your personality types.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
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
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: convertMarkdownToHTML(advisorSummary || 'This is a prototype - AI advisor summary would appear here in the final version.') 
              }}
            />
          </div>
        </div>
      )
    }
  ];

  // Add personality-specific chapters
  profile.personalityData.forEach((personality: any, index: number) => {
    chapters.push({
      id: chapters.length + 1,
      title: `${profile.personalities[index]} Personality`,
      icon: User,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{profile.personalities[index]}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {personality.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-xl font-semibold text-green-600 mb-4">Your Strengths</h3>
              <ul className="space-y-3">
                {personality.strengths.map((strength: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-orange-600 mb-4">Your Challenges</h3>
              <ul className="space-y-3">
                {personality.challenges.map((challenge: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-blue-600 mb-6">Action Plans for You</h3>
            <div className="grid gap-6">
              {personality.actionPlans.map((plan: any, idx: number) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">{plan.title}</h4>
                  <p className="text-gray-700 leading-relaxed">{plan.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    });
  });

  // Add tools and courses chapters
  chapters.push({
    id: chapters.length + 1,
    title: 'Recommended Tools',
    icon: Wrench,
    content: (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
            <Wrench className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Recommended Tools</h2>
          <p className="text-lg text-gray-600">
            Financial tools specifically selected based on your personality types
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedTools.map((tool) => (
            <div key={tool.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {tool.category}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.title}</h3>
              <p className="text-gray-600 text-sm">{tool.description}</p>
            </div>
          ))}
        </div>
      </div>
    )
  });

  chapters.push({
    id: chapters.length + 1,
    title: 'Recommended Courses',
    icon: BookOpen,
    content: (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-purple-50 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Recommended Courses</h2>
          <p className="text-lg text-gray-600">
            Educational courses tailored to your financial personality
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCourses.map((course) => (
            <div key={course.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-4">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  {course.category}
                </span>
                {course.recommended && (
                  <span className="inline-block px-2 py-1 bg-accent-100 text-accent-800 text-xs font-medium rounded">
                    Recommended
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-gray-500 text-sm">{course.duration}</p>
            </div>
          ))}
        </div>
      </div>
    )
  });

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