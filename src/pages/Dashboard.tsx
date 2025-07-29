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

        {/* Money Personality Results */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Money Personality Assessment Results</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Personality Types</h3>
                <div className="space-y-3">
                  {profile.personalities.map((personality, index) => (
                    <div key={personality} className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                      <span className="text-gray-700 capitalize">{personality.replace('-', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Summary</h3>
                <p className="text-gray-600">
                  Based on your responses, your financial personality has been identified. 
                  This assessment provides insights for your financial advisor to better 
                  understand your money management style and preferences.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resources from bff.enrich */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Financial Wellness Resources</h2>
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Continue Your Financial Journey
            </h3>
            <p className="text-gray-600 mb-6">
              Explore comprehensive financial education resources at bff.enrich.org
            </p>
            <a
              href="https://bff.enrich.org"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Visit bff.enrich.org
            </a>
          </div>
        </div>
      </div>

    </Layout>
  );
}