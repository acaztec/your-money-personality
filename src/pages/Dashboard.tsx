import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../types';
import { ChevronLeft, ChevronRight, User, Target, Eye, Users, Star } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [advisorSummary, setAdvisorSummary] = useState<string>('');

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const savedSummary = localStorage.getItem('advisorSummary');
    
    if (!savedProfile) {
      navigate('/');
      return;
    }

    setProfile(JSON.parse(savedProfile));
    if (savedSummary) {
      setAdvisorSummary(savedSummary);
    }
  }, [navigate]);

  if (!profile) {
    return <div>Loading...</div>;
  }

  const getPersonalityData = (category: string, personalityType: string) => {
    return profile.personalityData?.[category]?.[personalityType];
  };

  const getChapterIcon = (index: number) => {
    const icons = [User, Eye, Target, Users, Star];
    const IconComponent = icons[index] || User;
    return <IconComponent className="w-6 h-6" />;
  };

  const getChapterColor = (index: number) => {
    const colors = ['blue', 'green', 'purple', 'orange', 'pink'];
    return colors[index] || 'blue';
  };

  // Define chapters based on the real output structure
  const chapters = [
    {
      title: 'Overview',
      number: 1,
      content: (
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Your Money Personality®
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understand the "why" behind your money decisions with our behavioral assessment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">The Why</h3>
              <p className="text-gray-600 leading-relaxed">
                Managing your finances is about more than just your money in the bank. 
                It involves setting goals, evaluating choices, and high stakes! Like most things in life, 
                your unique personality and behaviors are an important piece. This analysis will help you 
                better understand the "why" behind your financial decision making, while recommending positive changes.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Please remember, your financial personality and behaviors depend on complex factors and may change over time. 
                As such, this analysis is to be taken as suggestion only. For individualized advice consult a financial professional.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">The Science</h3>
              <p className="text-gray-600 leading-relaxed">
                This book (and the science behind it) is the first of its kind in a financial wellness program.
                It was developed in collaboration with financial wellness experts led by a Ph.D. in Behavioral Economics. 
                Our goal is to help you understand - in simple, practical terms - the unique characteristics of your 
                personality that affect your financial decision making.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">The How</h3>
              <p className="text-gray-600 leading-relaxed">
                Based on your earlier responses, our analysis engine assessed the influences on your financial behaviors 
                across a range of categories. Our analysis looks at different components of your money personality, 
                with explanations of your dominant traits, strengths, challenges, and even a few tips and tricks to 
                make your money personality work for you. Enjoy!
              </p>
            </div>
          </div>
        </div>
      )
    },
    // Emotions Chapter
    {
      title: 'Emotions',
      number: 2,
      personalityType: profile.personalities[1], // Emotions is second in array
      category: 'EMOTIONS',
      content: null
    },
    // Outlook Chapter  
    {
      title: 'Outlook',
      number: 3,
      personalityType: profile.personalities[2], // Outlook is third in array
      category: 'OUTLOOK',
      content: null
    },
    // Focus Chapter (skipping number 3 to match real output)
    {
      title: 'Focus',
      number: 4,
      personalityType: profile.personalities[0], // Focus is first in array
      category: 'FOCUS',
      content: null
    },
    // Influence Chapter
    {
      title: 'Influence',
      number: 5,
      personalityType: profile.personalities[3], // Influence is fourth in array
      category: 'INFLUENCE',
      content: null
    },
    // Bonus Chapter
    {
      title: 'Bonus',
      number: 6,
      personalityType: profile.personalities[4], // Bonus is fifth in array
      category: 'BONUS',
      content: null
    }
  ];

  const currentChapterData = chapters[currentChapter];

  const renderPersonalityChapter = (chapter: any) => {
    const personalityData = getPersonalityData(chapter.category, chapter.personalityType);
    
    if (!personalityData) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No personality data found</h2>
          <p className="text-gray-600">
            Unable to find data for {chapter.category} - {chapter.personalityType}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Available personalities: {Object.keys(profile.personalityData?.[chapter.category] || {}).join(', ')}
          </p>
        </div>
      );
    }

    const color = getChapterColor(chapter.number - 2); // Adjust for chapter numbering

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 bg-${color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
            {getChapterIcon(chapter.number - 2)}
          </div>
          <div className="text-lg text-gray-600 mb-2">Your {chapter.title.toUpperCase()} Type</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{chapter.personalityType}</h2>
          <div className="text-lg text-gray-600">
            {/* Percentage would go here if we had it */}
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Summary</h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            {personalityData.description.split('.')[0]}.
          </p>
          
          <h4 className="text-lg font-semibold text-gray-900 mb-4">What It Means</h4>
          <p className="text-gray-600 leading-relaxed">
            {personalityData.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-xl font-semibold text-green-600 mb-6">3 Biggest Strengths</h3>
            <div className="space-y-4">
              {personalityData.strengths.map((strength: string, index: number) => (
                <div key={index} className="border-l-4 border-green-500 pl-4">
                  <div className="text-sm font-semibold text-green-600 mb-1">
                    When you're {chapter.personalityType}...
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">Strength</div>
                  <p className="text-gray-600 text-sm leading-relaxed">{strength}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-orange-600 mb-6">3 Biggest Challenges</h3>
            <div className="space-y-4">
              {personalityData.challenges.map((challenge: string, index: number) => (
                <div key={index} className="border-l-4 border-orange-500 pl-4">
                  <div className="text-sm font-semibold text-orange-600 mb-1">
                    When you're {chapter.personalityType}...
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">Challenge</div>
                  <p className="text-gray-600 text-sm leading-relaxed">{challenge}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Action Items</h3>
          <div className="text-sm font-semibold text-blue-600 mb-4">
            When you're {chapter.personalityType}...
          </div>
          <div className="space-y-6">
            {personalityData.actionItems.map((item: any, index: number) => (
              <div key={index} className="border-l-4 border-blue-500 pl-6">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                </div>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <div className="text-sm font-semibold text-gray-900 mb-2">Action Items</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Header */}
      <div className="bg-primary-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <img 
            src="https://media-cdn.igrad.com/IMAGE/Logos/White/iGradEnrich.png" 
            alt="iGrad Enrich" 
            className="h-8 w-auto"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Chapter Navigation */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Chapter {currentChapterData.number}: {currentChapterData.title} 
              ({currentChapter + 1}/{chapters.length})
            </h1>
          </div>
          
          {/* Progress indicator */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentChapter + 1) / chapters.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Chapter Content */}
        <div className="mb-8">
          {currentChapterData.content || renderPersonalityChapter(currentChapterData)}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
            disabled={currentChapter === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              currentChapter === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => {
              if (currentChapter < chapters.length - 1) {
                setCurrentChapter(currentChapter + 1);
              } else {
                // Could navigate somewhere else or show completion
              }
            }}
            disabled={currentChapter === chapters.length - 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              currentChapter === chapters.length - 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            <span>{currentChapter === chapters.length - 1 ? 'Complete' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* AI Advisor Summary (if available) */}
        {advisorSummary && currentChapter === chapters.length - 1 && (
          <div className="mt-12 card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Financial Advisor Summary</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{advisorSummary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}