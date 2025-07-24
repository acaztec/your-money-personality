import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PersonalityCard from '../components/PersonalityCard';
import ToolCard from '../components/ToolCard';
import CourseCard from '../components/CourseCard';
import ChatPanel from '../components/ChatPanel';
import { Profile, Tool, Course } from '../types';
import toolsData from '../data/tools.json';
import coursesData from '../data/courses.json';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [showAllTools, setShowAllTools] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (!savedProfile) {
      navigate('/');
      return;
    }
    setProfile(JSON.parse(savedProfile));
    
    const savedRecommendations = localStorage.getItem('aiRecommendations');
    if (savedRecommendations) {
      setAiRecommendations(JSON.parse(savedRecommendations));
    }
  }, [navigate]);

  if (!profile) {
    return <div>Loading...</div>;
  }

  const getRecommendedTools = (): Tool[] => {
    if (aiRecommendations?.tools && !showAllTools) {
      return aiRecommendations.tools;
    }
    return toolsData.filter(tool => 
      tool.personalities.includes('all') || 
      tool.personalities.some(p => profile.personalities.includes(p))
    );
  };

  const getRecommendedCourses = (): Course[] => {
    if (aiRecommendations?.courses && !showAllCourses) {
      return aiRecommendations.courses;
    }
    return coursesData.filter(course => 
      course.personalities.some(p => profile.personalities.includes(p))
    );
  };

  const recommendedTools = getRecommendedTools();
  const recommendedCourses = getRecommendedCourses();
  const displayedTools = showAllTools ? toolsData : recommendedTools.slice(0, 6);
  const displayedCourses = showAllCourses ? coursesData : recommendedCourses.slice(0, 6);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-600">
            Based on your assessment, here are AI-powered recommendations tailored specifically for you.
          </p>
        </div>

        {/* Personality Overview */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Money Personalities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <PersonalityCard
              title="Emotional Management"
              score={profile.emotions}
              type="emotions"
            />
            <PersonalityCard
              title="Future Outlook"
              score={profile.outlook}
              type="outlook"
            />
            <PersonalityCard
              title="Financial Focus"
              score={profile.focus}
              type="focus"
            />
            <PersonalityCard
              title="Decision Influence"
              score={profile.influence}
              type="influence"
            />
            <PersonalityCard
              title="Risk Tolerance"
              score={profile.riskTolerance}
              type="riskTolerance"
            />
          </div>
        </div>

        {/* Recommended Tools */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {showAllTools ? 'All Tools' : 'AI-Recommended Tools'}
            </h2>
            <button
              onClick={() => setShowAllTools(!showAllTools)}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
            >
              {showAllTools ? 'Show AI Picks' : 'View All Tools'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTools.map((tool) => (
              <div key={tool.id}>
                <ToolCard tool={tool} />
                {aiRecommendations?.tools && !showAllTools && tool.explanation && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Why this fits you:</strong> {tool.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Courses */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {showAllCourses ? 'All Courses' : 'AI-Recommended Courses'}
            </h2>
            <button
              onClick={() => setShowAllCourses(!showAllCourses)}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
            >
              {showAllCourses ? 'Show AI Picks' : 'View All Courses'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCourses.map((course) => (
              <div key={course.id}>
                <CourseCard course={course} />
                {aiRecommendations?.courses && !showAllCourses && course.explanation && (
                  <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Perfect for you:</strong> {course.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ChatPanel profile={profile} />
    </Layout>
  );
}